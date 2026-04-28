"use client";

import React, { useState } from "react";
import {
  Brain,
  Zap,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Portfolio from "@/components/Portfolio";
import Reasoning from "@/components/Reasoning";
import HistoryComponent from "@/components/History";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState({
    totalValue: 10000,
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

  const [history, setHistory] = useState([
    {
      id: 1,
      timestamp: "2024-04-28 14:32:00",
      action: "Portfolio Rebalance",
      status: "completed",
      details: "Moved 10% from ETH to BTC",
    },
    {
      id: 2,
      timestamp: "2024-04-28 12:15:00",
      action: "Risk Adjustment",
      status: "completed",
      details: "Reduced exposure to volatile assets",
    },
    {
      id: 3,
      timestamp: "2024-04-28 10:00:00",
      action: "Initial Analysis",
      status: "completed",
      details: "Market sentiment: Bullish",
    },
  ]);

  const handleAnalyze = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReasoning(
        `Analysis complete for ${riskLevel.toUpperCase()} risk profile. Current market conditions suggest a ${riskLevel === "low" ? "conservative" : riskLevel === "medium" ? "balanced" : "aggressive"} approach. Recommendation: ${riskLevel === "low" ? "Increase stablecoin allocation to 40%" : riskLevel === "high" ? "Increase altcoin exposure to 20%" : "Maintain current balanced allocation"}.`,
      );
      setLoading(false);
    }, 1500);
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                DJayFi - AI DeFi Agent
              </h1>
              <p className="text-gray-400 mt-2">
                Autonomous portfolio management powered by AI
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${portfolio.totalValue.toLocaleString()}
              </div>
              <div className="text-green-400 text-sm">+$240.00 (2.4%)</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Section */}
            <Portfolio
              totalValue={portfolio.totalValue}
              assets={portfolio.assets}
            />

            {/* Risk Level Selector */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <label className="block text-sm font-medium mb-3">
                Risk Profile
              </label>
              <div className="flex gap-3">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskLevel(level)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      riskLevel === level
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Reasoning Section */}
            <Reasoning text={reasoning} isLoading={loading} />

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {loading ? "Analyzing..." : "Analyze Portfolio"}
            </button>

            {/* Trade Execution Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-semibold">Trade Execution</h2>
              </div>

              <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-200">Ready to Execute</p>
                  <p className="text-sm text-blue-300">
                    Review the allocation above. Click execute to simulate
                    onchain transaction.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gas Estimate</span>
                  <span>0.0025 ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slippage Impact</span>
                  <span className="text-yellow-400">0.5%</span>
                </div>
              </div>

              <button
                onClick={handleExecute}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Execute Trade
              </button>
            </div>
          </div>

          {/* Right Column - History */}
          <HistoryComponent items={history} />
        </div>
      </main>
    </div>
  );
}
