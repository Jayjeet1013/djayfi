/**
 * POST /api/execute
 * Executes portfolio rebalancing trades
 *
 * Flow:
 * 1. Execution Agent: Convert allocation to trades and execute via KeeperHub
 * 2. Memory Agent: Save decision and execution results
 * 3. Return: Transaction hashes, status, and execution logs
 */

import { NextRequest, NextResponse } from "next/server";
import {
  executeRebalance,
  CurrentPosition,
  AllocationInput as ExecutionAllocationInput,
} from "@/lib/agents/executionAgent";
import {
  saveDecision,
  updateDecisionExecution,
} from "@/lib/agents/memoryAgent";

interface ExecuteRequest {
  currentPosition: {
    BTC: number;
    ETH: number;
    USDT: number;
    totalValue: number;
  };
  targetAllocation: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
  riskLevel: "low" | "medium" | "high";
  reasoning: string;
  slippage?: number;
}

interface ExecuteResponse {
  success: boolean;
  data?: {
    executionId: string;
    status: "success" | "partial" | "failed";
    riskLevel: string;
    tradesExecuted: number;
    tradesFailed: number;
    totalGasUsed?: number;
    txHashes: (string | null)[];
    trades: Array<{
      asset: string;
      type: string;
      status: string;
      txHash: string | null;
      retries: number;
    }>;
    summary: string;
    memoryId?: string;
    storage?: {
      success: boolean;
      rootHash?: string;
    };
    logs: Array<{
      timestamp: string;
      level: "info" | "warn" | "error" | "success";
      message: string;
    }>;
    timestamp: string;
  };
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ExecuteResponse>> {
  try {
    // Step 1: Parse and validate request
    const body = await request.json();
    const {
      currentPosition,
      targetAllocation,
      riskLevel,
      reasoning,
      slippage,
    } = body as ExecuteRequest;

    // Validate required fields
    if (!currentPosition || !targetAllocation || !riskLevel || !reasoning) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: currentPosition, targetAllocation, riskLevel, reasoning",
        },
        { status: 400 },
      );
    }

    // Validate position structure
    if (
      typeof currentPosition.BTC !== "number" ||
      typeof currentPosition.ETH !== "number" ||
      typeof currentPosition.USDT !== "number" ||
      typeof currentPosition.totalValue !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid currentPosition: must contain numeric BTC, ETH, USDT, totalValue",
        },
        { status: 400 },
      );
    }

    // Validate allocation
    if (
      typeof targetAllocation.BTC !== "number" ||
      typeof targetAllocation.ETH !== "number" ||
      typeof targetAllocation.USDT !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid targetAllocation: must contain numeric BTC, ETH, USDT",
        },
        { status: 400 },
      );
    }

    if (!["low", "medium", "high"].includes(riskLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid riskLevel. Must be "low", "medium", or "high"',
        },
        { status: 400 },
      );
    }

    console.log(
      `[/api/execute] Received execution request for ${riskLevel} risk level`,
    );
    console.log(
      `[/api/execute] Target allocation: BTC ${targetAllocation.BTC}%, ETH ${targetAllocation.ETH}%, USDT ${targetAllocation.USDT}%`,
    );

    // Step 2: Save decision to memory BEFORE execution (for audit trail)
    console.log("[/api/execute] Saving decision to Memory Agent...");
    const saveResult = saveDecision({
      riskLevel: riskLevel as "low" | "medium" | "high",
      allocation: targetAllocation,
      reasoning,
    });

    if (!saveResult.success || !saveResult.id) {
      console.error(
        "[/api/execute] Failed to save decision:",
        saveResult.error,
      );
      return NextResponse.json(
        {
          success: false,
          error: `Failed to save decision: ${saveResult.error}`,
        },
        { status: 500 },
      );
    }

    const decisionId = saveResult.id;
    console.log(`[/api/execute] Decision saved with ID: ${decisionId}`);

    // Step 3: Execute rebalance via Execution Agent
    console.log("[/api/execute] Calling Execution Agent...");
    const executionSummary = await executeRebalance(
      currentPosition as CurrentPosition,
      targetAllocation as ExecutionAllocationInput,
      { slippage },
    );

    console.log(
      `[/api/execute] Execution complete. Status: ${executionSummary.status}`,
    );
    console.log(
      `[/api/execute] Trades executed: ${executionSummary.tradesExecuted}, Failed: ${executionSummary.tradesFailed}`,
    );

    // Step 4: Extract transaction hashes from execution results
    const txHashes: (string | null)[] = executionSummary.trades.map(
      (trade) => trade.result.txHash,
    );
    const nonNullTxHashes = txHashes.filter(
      (txHash): txHash is string => txHash !== null,
    );

    // Step 5: Update decision with execution results in Memory Agent
    console.log(
      `[/api/execute] Updating decision execution in Memory Agent...`,
    );
    const updateResult = updateDecisionExecution(decisionId, {
      status: executionSummary.status,
      tradesExecuted: executionSummary.tradesExecuted,
      tradesFailed: executionSummary.tradesFailed,
      totalGasUsed: executionSummary.totalGasUsed,
      txHashes: nonNullTxHashes,
    });

    if (!updateResult.success) {
      console.warn(
        "[/api/execute] Warning: Failed to update decision execution:",
        updateResult.error,
      );
      // Don't fail the whole request, execution was successful
    } else {
      console.log("[/api/execute] Decision execution updated successfully");
    }

    // Step 6: Format trade details
    const trades = executionSummary.trades.map((trade) => ({
      asset: trade.asset,
      type: trade.result.status === "success" ? "execution" : "failed",
      status: trade.result.status,
      txHash: trade.result.txHash,
      retries: trade.result.retries,
    }));

    // Step 7: Prepare response
    const response: ExecuteResponse = {
      success: true,
      data: {
        executionId: executionSummary.executionId,
        status: executionSummary.status,
        riskLevel,
        tradesExecuted: executionSummary.tradesExecuted,
        tradesFailed: executionSummary.tradesFailed,
        totalGasUsed: executionSummary.totalGasUsed,
        txHashes,
        trades,
        summary: executionSummary.summary,
        memoryId: decisionId,
        storage: executionSummary.storage,
        logs: executionSummary.logs,
        timestamp: new Date().toISOString(),
      },
    };

    console.log(
      "[/api/execute] Execution complete. Returning response with",
      txHashes.length,
      "transaction hashes",
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[/api/execute] Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Execution failed: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for API documentation
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: "/api/execute",
      method: "POST",
      description: "Executes portfolio rebalancing trades and saves to memory",
      request: {
        body: {
          currentPosition: {
            BTC: "number (amount held)",
            ETH: "number (amount held)",
            USDT: "number (amount held)",
            totalValue: "number (total portfolio value in USD)",
          },
          targetAllocation: {
            BTC: "number (target percentage)",
            ETH: "number (target percentage)",
            USDT: "number (target percentage)",
          },
          riskLevel: "low | medium | high (required)",
          reasoning: "string (AI reasoning text)",
          slippage: "number (optional, default 0.5%)",
        },
      },
      response: {
        success: "boolean",
        data: {
          executionId: "string",
          status: "success | partial | failed",
          riskLevel: "string",
          tradesExecuted: "number",
          tradesFailed: "number",
          totalGasUsed: "number (optional)",
          txHashes: "string[] (transaction hashes)",
          trades: [
            {
              asset: "string",
              type: "execution | failed",
              status: "string",
              txHash: "string | null",
              retries: "number",
            },
          ],
          summary: "string",
          memoryId: "string (decision ID in memory)",
          storage: {
            success: "boolean",
            rootHash: "string (optional)",
          },
          logs: [
            {
              timestamp: "ISO string",
              level: "info | warn | error | success",
              message: "string",
            },
          ],
          timestamp: "ISO string",
        },
        error: "string (if success is false)",
      },
      examples: {
        request: {
          method: "POST",
          body: {
            currentPosition: {
              BTC: 1.5,
              ETH: 10,
              USDT: 5000,
              totalValue: 100000,
            },
            targetAllocation: {
              BTC: 45,
              ETH: 30,
              USDT: 25,
            },
            riskLevel: "medium",
            reasoning:
              "With a balanced risk approach, I'm allocating across assets...",
            slippage: 0.5,
          },
        },
        response: {
          success: true,
          data: {
            executionId: "exec_1714309200000",
            status: "success",
            riskLevel: "medium",
            tradesExecuted: 2,
            tradesFailed: 0,
            totalGasUsed: 304500,
            txHashes: [
              "0x7a2f8c9d4e1b6f5a2c3d9e1f4g5h6i7j8k9l",
              "0x9b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s",
            ],
            trades: [
              {
                asset: "BTC",
                type: "execution",
                status: "success",
                txHash: "0x7a2f...",
                retries: 0,
              },
              {
                asset: "ETH",
                type: "execution",
                status: "success",
                txHash: "0x9b1c...",
                retries: 1,
              },
            ],
            summary:
              "Successfully executed all 2 trades. Total gas: 304500 units",
            memoryId: "decision_1714309200000_1",
            storage: {
              success: true,
              rootHash: "0xabc123...",
            },
            logs: [
              {
                timestamp: "2026-04-28T14:32:00.000Z",
                level: "info",
                message: "Execution Agent initiated...",
              },
            ],
            timestamp: "2026-04-28T14:32:00.000Z",
          },
        },
      },
    },
    { status: 200 },
  );
}
