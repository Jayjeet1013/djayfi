/**
 * GET /api/history
 * Returns stored decision history from the Memory Agent
 */

import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/agents/memoryAgent";

type RiskLevel = "low" | "medium" | "high";

interface HistoryResponse {
  success: boolean;
  data?: {
    history: ReturnType<typeof getHistory>;
    count: number;
    filters: {
      riskLevel?: RiskLevel;
      limit?: number;
      offset?: number;
    };
    timestamp: string;
  };
  error?: string;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<HistoryResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const riskLevel = searchParams.get("riskLevel") as RiskLevel | null;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;

    if (riskLevel && !["low", "medium", "high"].includes(riskLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid riskLevel. Must be "low", "medium", or "high".',
        },
        { status: 400 },
      );
    }

    if (limit !== undefined && (!Number.isFinite(limit) || limit < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid limit. Must be a positive integer.",
        },
        { status: 400 },
      );
    }

    if (offset !== undefined && (!Number.isFinite(offset) || offset < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid offset. Must be a non-negative integer.",
        },
        { status: 400 },
      );
    }

    const history = getHistory({
      riskLevel: riskLevel ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          history,
          count: history.length,
          filters: {
            riskLevel: riskLevel ?? undefined,
            limit,
            offset,
          },
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[/api/history] Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch history: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
