"use client";

import React, { useEffect, useState } from "react";
import { Brain, Zap, AlertCircle } from "lucide-react";
import Portfolio from "@/components/Portfolio";
import Reasoning from "@/components/Reasoning";
import HistoryComponent from "@/components/History";
import AgentFlow from "@/components/AgentFlow";

type RiskLevel = "low" | "medium" | "high";

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
      BTC: { price: number; change24h: number };
      ETH: { price: number; change24h: number };
      USDT: { price: number; change24h: number };
    };
  };
  error?: string;
}

interface ExecuteResponse {
  success: boolean;
  data?: {
    executionId: string;
    status: "success" | "partial" | "failed";
    tradesExecuted: number;
    tradesFailed: number;
    txHashes: (string | null)[];
    summary: string;
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

interface HistoryResponse {
  success: boolean;
  data?: {
    history: Array<{
      id: string;
      timestamp: string;
      riskLevel: RiskLevel;
      allocation: {
        BTC: number;
        ETH: number;
        USDT: number;
      };
      reasoning: string;
      execution?: {
        status: "success" | "partial" | "failed";
        tradesExecuted: number;
        tradesFailed: number;
        totalGasUsed?: number;
        txHashes: string[];
      };
    }>;
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

export default function Dashboard() {
  const initialPortfolioValue = 10000;

  type HistoryStatus = "completed" | "pending" | "failed";

  interface HistoryItem {
    id: number;
    timestamp: string;
    action: string;
    status: HistoryStatus;
    details: string;
  }

  const [portfolio, setPortfolio] = useState({
    totalValue: initialPortfolioValue,
    assets: [
      {
        name: "Bitcoin",
        symbol: "BTC",
        allocation: 45,
        value: 4500,
        change: 5.2,
      },
      {
        name: "Ethereum",
        symbol: "ETH",
        allocation: 30,
        value: 3000,
        change: -2.1,
      },
      {
        name: "USDT",
        symbol: "USDT",
        allocation: 25,
        value: 2500,
        change: 0.0,
      },
    ],
  });

  const [reasoning, setReasoning] = useState(
    "Market analysis indicates moderate volatility. Bitcoin showing strong momentum with positive sentiment in funding rates. Ethereum consolidating after recent rally. Risk-adjusted allocation favors BTC exposure while maintaining stablecoin buffer for volatility hedging.",
  );

  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [loading, setLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<
    Array<{
      timestamp: string;
      level: "info" | "warn" | "error" | "success";
      message: string;
    }>
  >([]);
  const [storageResult, setStorageResult] = useState<{
    success: boolean;
    rootHash?: string;
  } | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await fetch("/api/history");
        const result = (await response.json()) as HistoryResponse;

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch history");
        }

        const mappedHistory: HistoryItem[] = result.data.history.map(
          (decision) => {
            const status: HistoryStatus = decision.execution
              ? decision.execution.status === "failed"
                ? "failed"
                : "completed"
              : "pending";

            const details = decision.execution
              ? `${decision.reasoning} | Execution: ${decision.execution.status} (${decision.execution.tradesExecuted} executed, ${decision.execution.tradesFailed} failed)`
              : `${decision.reasoning} | Allocation: BTC ${decision.allocation.BTC}%, ETH ${decision.allocation.ETH}%, USDT ${decision.allocation.USDT}%`;

            return {
              id:
                Number.parseInt(decision.id.replace(/\D/g, ""), 10) ||
                Date.now(),
              timestamp: new Date(decision.timestamp).toLocaleString(),
              action: `Decision ${decision.riskLevel.toUpperCase()} Risk`,
              status,
              details,
            };
          },
        );

        setHistory(mappedHistory);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setHistoryError(errorMessage);
      } finally {
        setHistoryLoading(false);
      }
    };

    void fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ riskLevel }),
      });

      const result = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to analyze portfolio");
      }

      const { allocation, reasoning, marketData } = result.data;

      setPortfolio({
        totalValue: initialPortfolioValue,
        assets: [
          {
            name: "Bitcoin",
            symbol: "BTC",
            allocation: allocation.BTC,
            value: Math.round((initialPortfolioValue * allocation.BTC) / 100),
            change: marketData.BTC.change24h,
          },
          {
            name: "Ethereum",
            symbol: "ETH",
            allocation: allocation.ETH,
            value: Math.round((initialPortfolioValue * allocation.ETH) / 100),
            change: marketData.ETH.change24h,
          },
          {
            name: "USDT",
            symbol: "USDT",
            allocation: allocation.USDT,
            value: Math.round((initialPortfolioValue * allocation.USDT) / 100),
            change: marketData.USDT.change24h,
          },
        ],
      });

      setReasoning(reasoning);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setAnalysisError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = () => {
    // Simulate trade execution
    const newTrade = {
      id: history.length + 1,
      timestamp: new Date().toLocaleString(),
      action: "Trade Execution",
      status: "completed" as const,
      details: `Executed ${riskLevel} risk portfolio allocation`,
    };
    setHistory([newTrade, ...history]);
  };

  const handleExecutePortfolio = async () => {
    setLoading(true);
    setExecuteError(null);
    setStorageResult(null);

    try {
      const currentPosition = {
        BTC: Number(
          (portfolio.assets.find((asset) => asset.symbol === "BTC")?.value ||
            0) / 63000,
        ),
        ETH: Number(
          (portfolio.assets.find((asset) => asset.symbol === "ETH")?.value ||
            0) / 3100,
        ),
        USDT: Number(
          portfolio.assets.find((asset) => asset.symbol === "USDT")?.value || 0,
        ),
        totalValue: portfolio.totalValue,
      };

      const targetAllocation = {
        BTC:
          portfolio.assets.find((asset) => asset.symbol === "BTC")
            ?.allocation || 0,
        ETH:
          portfolio.assets.find((asset) => asset.symbol === "ETH")
            ?.allocation || 0,
        USDT:
          portfolio.assets.find((asset) => asset.symbol === "USDT")
            ?.allocation || 0,
      };

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPosition,
          targetAllocation,
          riskLevel,
          reasoning,
          slippage: 0.5,
        }),
      });

      const result = (await response.json()) as ExecuteResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Failed to execute trade");
      }

      setExecutionLogs(result.data.logs);
      setStorageResult(result.data.storage ?? null);

      const txHashSummary = result.data.txHashes
        .filter((txHash): txHash is string => Boolean(txHash))
        .join(", ");

      const executionStatus: HistoryStatus =
        result.data.status === "failed" ? "failed" : "completed";

      const newTrade = {
        id: history.length + 1,
        timestamp: new Date().toLocaleString(),
        action: `Execution ${result.data.status}`,
        status: executionStatus,
        details: `${result.data.summary}${txHashSummary ? ` | Tx: ${txHashSummary}` : ""}`,
      };

      setHistory([newTrade, ...history]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setExecuteError(errorMessage);
      setExecutionLogs((previousLogs) => [
        ...previousLogs,
        {
          timestamp: new Date().toISOString(),
          level: "error",
          message: errorMessage,
        },
      ]);
      setStorageResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-slate-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-8 lg:px-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Brain className="w-6 h-6" />
                </div>
                DJayFi - AI DeFi Agent
              </h1>
              <p className="text-gray-400 mt-3 text-sm font-medium">
                Autonomous portfolio management powered by AI
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-linear-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                ${portfolio.totalValue.toLocaleString()}
              </div>
              <div className="text-green-400 text-sm font-medium mt-1">
                +$240.00 (2.4%)
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <AgentFlow />

            {/* Portfolio Section */}
            <Portfolio
              totalValue={portfolio.totalValue}
              assets={portfolio.assets}
            />

            {/* Risk Level Selector */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
              <label className="block text-sm font-semibold mb-4 text-white">
                Risk Profile
              </label>
              <div className="flex gap-3">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskLevel(level)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      riskLevel === level
                        ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Reasoning Section */}
            <Reasoning text={reasoning} isLoading={loading} />

            {analysisError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-md px-4 py-3 text-sm text-red-300">
                {analysisError}
              </div>
            )}

            {executeError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-md px-4 py-3 text-sm text-red-300">
                {executeError}
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 disabled:shadow-none"
            >
              <Brain className="w-4 h-4" />
              {loading ? "Analyzing..." : "Analyze Portfolio"}
            </button>

            {/* Trade Execution Section */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">
                  Trade Execution
                </h2>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-200">Ready to Execute</p>
                  <p className="text-sm text-blue-300 mt-1">
                    Review the allocation above. Click execute to simulate
                    onchain transaction.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gas Estimate</span>
                  <span className="text-white font-medium">0.0025 ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slippage Impact</span>
                  <span className="text-amber-400 font-medium">0.5%</span>
                </div>
              </div>

              <button
                onClick={handleExecutePortfolio}
                disabled={loading}
                className="w-full bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-600 text-black font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 disabled:shadow-none"
              >
                <Zap className="w-5 h-5" />
                {loading ? "Executing..." : "Execute Trade"}
              </button>
            </div>
          </div>

          {/* Right Column - History */}
          <div className="space-y-4">
            {historyLoading ? (
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 h-fit backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Trade History
                  </h2>
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
                <div className="space-y-3 animate-pulse">
                  <div className="h-20 rounded-lg bg-white/5" />
                  <div className="h-20 rounded-lg bg-white/5" />
                  <div className="h-20 rounded-lg bg-white/5" />
                </div>
              </div>
            ) : historyError ? (
              <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6 h-fit backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Trade History
                  </h2>
                  <span className="text-xs text-red-400">Error</span>
                </div>
                <p className="text-sm text-red-300">{historyError}</p>
              </div>
            ) : (
              <HistoryComponent items={history} />
            )}

            <div className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Execution Logs
                </h2>
                <span className="text-xs text-gray-400 font-medium">
                  {executionLogs.length} entries
                </span>
              </div>

              {executionLogs.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Execute a trade to view KeeperHub logs here.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {executionLogs.map((log, index) => (
                    <div
                      key={`${log.timestamp}-${index}`}
                      className="rounded-lg border border-white/10 bg-white/3 hover:bg-white/6 px-3 py-2 transition-colors duration-200 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
                        <span className="uppercase tracking-wide font-medium text-gray-300">
                          {log.level}
                        </span>
                        <span className="text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-200">
                        {log.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {storageResult?.success && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-green-400 font-semibold">
                    Stored on 0G Storage
                  </p>
                  <span className="text-xs bg-purple-500/20 px-2 py-1 rounded">
                    0G Storage
                  </span>
                </div>
                <p className="text-xs break-all text-gray-300">
                  {storageResult.rootHash ?? "Root hash unavailable"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
