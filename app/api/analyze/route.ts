/**
 * POST /api/analyze
 * Analyzes market conditions and generates portfolio allocation
 *
 * Flow:
 * 1. Market Agent: Fetch current prices
 * 2. Strategy Agent: Generate allocation based on risk level
 * 3. Risk Agent: Validate and adjust allocation
 * 4. Return: Safe allocation with reasoning
 */

import { NextRequest, NextResponse } from "next/server";
import { getMarketData } from "@/lib/agents/marketAgent";
import { generateStrategy, RiskLevel } from "@/lib/agents/strategyAgent";
import { assessAndAdjustAllocation } from "@/lib/agents/riskAgent";

interface AnalyzeRequest {
  riskLevel: "low" | "medium" | "high";
}

interface AnalyzeResponse {
  success: boolean;
  data?: {
    riskLevel: RiskLevel;
    allocation: {
      BTC: number;
      ETH: number;
      USDT: number;
    };
    reasoning: string;
    marketData: {
      BTC: {
        price: number;
        change24h: number;
      };
      ETH: {
        price: number;
        change24h: number;
      };
      USDT: {
        price: number;
        change24h: number;
      };
    };
    riskAnalysis: {
      isSafe: boolean;
      warnings: string[];
      adjustments: {
        BTC: {
          changed: boolean;
          reason: string;
          value: number;
        };
        ETH: {
          changed: boolean;
          reason: string;
          value: number;
        };
        USDT: {
          changed: boolean;
          reason: string;
          value: number;
        };
      };
    };
    timestamp: string;
  };
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Step 1: Parse request body
    const body = await request.json();
    const { riskLevel } = body as AnalyzeRequest;

    // Validate input
    if (!riskLevel || !["low", "medium", "high"].includes(riskLevel)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid request. Required: { "riskLevel": "low" | "medium" | "high" }',
        },
        { status: 400 },
      );
    }

    console.log(
      `[/api/analyze] Received analysis request for ${riskLevel} risk level`,
    );

    // Step 2: Market Agent - Fetch current prices
    console.log("[/api/analyze] Calling Market Agent...");
    const marketData = await getMarketData();

    if (!marketData.success) {
      console.warn(
        "[/api/analyze] Market Agent returned error. Using fallback prices:",
        marketData.error,
      );
    }

    console.log("[/api/analyze] Market data retrieved successfully");

    // Step 3: Strategy Agent - Generate allocation
    console.log("[/api/analyze] Calling Strategy Agent...");
    const strategy = generateStrategy(riskLevel);
    console.log(
      `[/api/analyze] Strategy generated: ${JSON.stringify(strategy.allocation)}`,
    );

    // Step 4: Risk Agent - Validate and adjust allocation
    console.log("[/api/analyze] Calling Risk Agent...");
    const allocationInput = {
      BTC: strategy.allocation.BTC.percentage,
      ETH: strategy.allocation.ETH.percentage,
      USDT: strategy.allocation.USDT.percentage,
    };

    const riskAssessment = assessAndAdjustAllocation(allocationInput);
    console.log(
      `[/api/analyze] Risk assessment complete. Safe: ${riskAssessment.isSafe}`,
    );

    if (riskAssessment.warnings.length > 0) {
      console.log("[/api/analyze] Warnings:", riskAssessment.warnings);
    }

    // Step 5: Prepare response
    const response: AnalyzeResponse = {
      success: true,
      data: {
        riskLevel,
        allocation: riskAssessment.adjusted,
        reasoning: strategy.reasoning,
        marketData: {
          BTC: {
            price: marketData.prices.BTC.currentPrice,
            change24h: marketData.prices.BTC.priceChange24h,
          },
          ETH: {
            price: marketData.prices.ETH.currentPrice,
            change24h: marketData.prices.ETH.priceChange24h,
          },
          USDT: {
            price: marketData.prices.USDT.currentPrice,
            change24h: marketData.prices.USDT.priceChange24h,
          },
        },
        riskAnalysis: {
          isSafe: riskAssessment.isSafe,
          warnings: riskAssessment.warnings,
          adjustments: riskAssessment.adjustments,
        },
        timestamp: new Date().toISOString(),
      },
    };

    console.log(
      "[/api/analyze] Analysis complete. Returning allocation:",
      response.data?.allocation,
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[/api/analyze] Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Analysis failed: ${errorMessage}`,
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
      endpoint: "/api/analyze",
      method: "POST",
      description:
        "Analyzes market conditions and generates portfolio allocation",
      request: {
        body: {
          riskLevel: "low | medium | high (required)",
        },
      },
      response: {
        success: "boolean",
        data: {
          riskLevel: "string",
          allocation: {
            BTC: "number (percentage)",
            ETH: "number (percentage)",
            USDT: "number (percentage)",
          },
          reasoning: "string (AI-generated explanation)",
          marketData: {
            BTC: { price: "number", change24h: "number" },
            ETH: { price: "number", change24h: "number" },
            USDT: { price: "number", change24h: "number" },
          },
          riskAnalysis: {
            isSafe: "boolean",
            warnings: "string[]",
            adjustments: "object",
          },
          timestamp: "ISO string",
        },
        error: "string (if success is false)",
      },
      examples: {
        request: {
          method: "POST",
          body: {
            riskLevel: "medium",
          },
        },
        response: {
          success: true,
          data: {
            riskLevel: "medium",
            allocation: {
              BTC: 45,
              ETH: 30,
              USDT: 25,
            },
            reasoning: "With a balanced risk approach...",
            marketData: {
              BTC: { price: 63420, change24h: 2.5 },
              ETH: { price: 3100, change24h: -1.2 },
              USDT: { price: 1.0, change24h: 0.0 },
            },
            timestamp: "2026-04-28T...",
          },
        },
      },
    },
    { status: 200 },
  );
}
