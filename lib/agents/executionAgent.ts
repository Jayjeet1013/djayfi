/**
 * Execution Agent
 * Converts portfolio allocation into trade actions
 * Coordinates with KeeperHub for trade execution
 */

import {
  executeTrade,
  ExecutionResult,
  TradeData,
  ExecutionLog,
} from "@/lib/services/keeperhub";
import { savePortfolio } from "@/lib/services/OgStorage";

export interface AllocationInput {
  BTC: number;
  ETH: number;
  USDT: number;
}

export interface CurrentPosition {
  BTC: number;
  ETH: number;
  USDT: number;
  totalValue: number;
}

export interface TradeAction {
  asset: string;
  type: "buy" | "sell";
  amount: number;
  targetPrice: number;
  reason: string;
}

export interface ExecutionSummary {
  executionId: string;
  timestamp: string;
  status: "success" | "partial" | "failed";
  tradesExecuted: number;
  tradesFailed: number;
  totalGasUsed?: number;
  trades: Array<{
    asset: string;
    result: ExecutionResult;
  }>;
  logs: ExecutionLog[];
  summary: string;
  storage?: {
    success: boolean;
    rootHash?: string;
  };
}

/**
 * Generate realistic market prices for each asset
 */
function getMarketPrices(): { BTC: number; ETH: number; USDT: number } {
  // Simulate realistic prices with some variance
  const btcBase = 63000;
  const ethBase = 3100;
  const usdt = 1.0;

  const btcPrice = btcBase * (1 + (Math.random() - 0.5) * 0.02); // ±1% variance
  const ethPrice = ethBase * (1 + (Math.random() - 0.5) * 0.02);

  return {
    BTC: Math.round(btcPrice),
    ETH: Math.round(ethPrice * 100) / 100,
    USDT: usdt,
  };
}

/**
 * Calculate trade amounts needed to reach target allocation
 */
function calculateTradeActions(
  currentPosition: CurrentPosition,
  targetAllocation: AllocationInput,
): TradeAction[] {
  const trades: TradeAction[] = [];
  const prices = getMarketPrices();

  // Calculate current allocations
  const currentAllocations = {
    BTC:
      ((currentPosition.BTC * prices.BTC) / currentPosition.totalValue) * 100 ||
      0,
    ETH:
      ((currentPosition.ETH * prices.ETH) / currentPosition.totalValue) * 100 ||
      0,
    USDT: (currentPosition.USDT / currentPosition.totalValue) * 100 || 0,
  };

  // Determine trades for each asset
  const assets: Array<"BTC" | "ETH" | "USDT"> = ["BTC", "ETH", "USDT"];

  for (const asset of assets) {
    const current = currentAllocations[asset] || 0;
    const target = targetAllocation[asset];
    const difference = target - current;

    // Only trade if difference is significant (> 0.5%)
    if (Math.abs(difference) > 0.5) {
      const targetValue = (target / 100) * currentPosition.totalValue;
      const currentValue =
        asset === "BTC"
          ? currentPosition.BTC * prices.BTC
          : asset === "ETH"
            ? currentPosition.ETH * prices.ETH
            : currentPosition.USDT;

      const valueChange = targetValue - currentValue;
      let amount = 0;

      if (asset === "BTC") {
        amount = Math.abs(valueChange) / prices.BTC;
      } else if (asset === "ETH") {
        amount = Math.abs(valueChange) / prices.ETH;
      } else {
        amount = Math.abs(valueChange);
      }

      trades.push({
        asset,
        type: valueChange > 0 ? "buy" : "sell",
        amount: Math.round(amount * 1000) / 1000, // Round to 3 decimals
        targetPrice:
          asset === "BTC" ? prices.BTC : asset === "ETH" ? prices.ETH : 1.0,
        reason:
          valueChange > 0
            ? `Increase ${asset} allocation from ${current.toFixed(1)}% to ${target}%`
            : `Decrease ${asset} allocation from ${current.toFixed(1)}% to ${target}%`,
      });
    }
  }

  return trades;
}

/**
 * Add execution log
 */
function addLog(
  logs: ExecutionLog[],
  level: ExecutionLog["level"],
  message: string,
): void {
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
  });
}

/**
 * Execute portfolio rebalancing
 */
export async function executeRebalance(
  currentPosition: CurrentPosition,
  targetAllocation: AllocationInput,
  options?: {
    slippage?: number;
    dryRun?: boolean;
  },
): Promise<ExecutionSummary> {
  const executionId = `exec_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const logs: ExecutionLog[] = [];

  addLog(
    logs,
    "info",
    `Execution Agent initiated. Execution ID: ${executionId}`,
  );

  try {
    // Step 1: Calculate trade actions
    addLog(logs, "info", "Calculating trade actions based on allocation");
    const tradeActions = calculateTradeActions(
      currentPosition,
      targetAllocation,
    );

    if (tradeActions.length === 0) {
      addLog(logs, "info", "No significant allocation changes detected");
      const storageResult = await savePortfolio({
        executionId,
        allocation: targetAllocation,
        currentPosition,
        result: [],
        status: "success",
        logs,
        timestamp,
      });
      return {
        executionId,
        timestamp,
        status: "success",
        tradesExecuted: 0,
        tradesFailed: 0,
        trades: [],
        logs,
        summary: "No trades needed - allocation already at target",
        storage: storageResult,
      };
    }

    addLog(logs, "info", `Generated ${tradeActions.length} trade action(s)`);

    // Log each trade action
    tradeActions.forEach((trade, index) => {
      addLog(
        logs,
        "info",
        `Trade ${index + 1}: ${trade.type.toUpperCase()} ${trade.amount} ${trade.asset} @ $${trade.targetPrice} (${trade.reason})`,
      );
    });

    // Step 2: Execute trades via KeeperHub
    addLog(logs, "info", "Submitting trades to KeeperHub");

    const executionResults: Array<{
      asset: string;
      result: ExecutionResult;
    }> = [];
    let successCount = 0;
    let failureCount = 0;
    let totalGasUsed = 0;

    for (const trade of tradeActions) {
      try {
        addLog(
          logs,
          "info",
          `Executing ${trade.type} ${trade.amount} ${trade.asset}`,
        );

        const tradeData: TradeData = {
          asset: trade.asset,
          type: trade.type,
          amount: trade.amount,
          targetPrice: trade.targetPrice,
          slippage: options?.slippage || 0.5,
        };

        const result = await executeTrade(tradeData);
        executionResults.push({ asset: trade.asset, result });

        if (result.status === "success") {
          successCount++;
          if (result.gasUsed) totalGasUsed += result.gasUsed;
          addLog(
            logs,
            "success",
            `${trade.asset} trade successful - TxHash: ${result.txHash}, Retries: ${result.retries}`,
          );
        } else {
          failureCount++;
          addLog(
            logs,
            "error",
            `${trade.asset} trade failed: ${result.error || "Unknown error"}`,
          );
        }

        // Merge execution logs
        logs.push(...result.logs);
      } catch (error) {
        failureCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        addLog(
          logs,
          "error",
          `Error executing ${trade.asset} trade: ${errorMessage}`,
        );
      }
    }

    // Step 3: Generate summary
    const overallStatus =
      failureCount === 0
        ? "success"
        : successCount === 0
          ? "failed"
          : "partial";

    const summary =
      overallStatus === "success"
        ? `Successfully executed all ${successCount} trades. Total gas: ${totalGasUsed} units`
        : overallStatus === "failed"
          ? `Failed to execute any trades. See logs for details.`
          : `Partially executed: ${successCount} successful, ${failureCount} failed`;

    addLog(
      logs,
      "success",
      `Execution Agent completed. Status: ${overallStatus}`,
    );

    const storageResult = await savePortfolio({
      executionId,
      allocation: targetAllocation,
      currentPosition,
      result: executionResults,
      status: overallStatus,
      logs,
      timestamp,
    });

    return {
      executionId,
      timestamp,
      status: overallStatus,
      tradesExecuted: successCount,
      tradesFailed: failureCount,
      totalGasUsed,
      trades: executionResults,
      logs,
      summary,
      storage: storageResult,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    addLog(logs, "error", `Fatal error in Execution Agent: ${errorMessage}`);

    return {
      executionId,
      timestamp,
      status: "failed",
      tradesExecuted: 0,
      tradesFailed: 0,
      trades: [],
      logs,
      summary: `Execution failed: ${errorMessage}`,
    };
  }
}

/**
 * Dry run - calculate trades without executing
 */
export function simulateRebalance(
  currentPosition: CurrentPosition,
  targetAllocation: AllocationInput,
): {
  tradeActions: TradeAction[];
  estimatedGas: number;
  summary: string;
} {
  const tradeActions = calculateTradeActions(currentPosition, targetAllocation);
  const estimatedGas = tradeActions.length * 150000; // Rough estimate

  const summary =
    tradeActions.length === 0
      ? "No trades required"
      : `Estimated ${tradeActions.length} trade(s) requiring ~${estimatedGas} gas`;

  return {
    tradeActions,
    estimatedGas,
    summary,
  };
}

/**
 * Validate current position
 */
export function validatePosition(position: CurrentPosition): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (position.BTC < 0 || position.ETH < 0 || position.USDT < 0) {
    errors.push("Position amounts cannot be negative");
  }

  if (position.totalValue <= 0) {
    errors.push("Total portfolio value must be positive");
  }

  const calculated = position.BTC * 63000 + position.ETH * 3100 + position.USDT;

  if (Math.abs(calculated - position.totalValue) > 100) {
    errors.push("Position amounts do not match total value");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
