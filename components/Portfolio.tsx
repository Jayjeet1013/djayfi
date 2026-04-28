import React from "react";
import { TrendingUp } from "lucide-react";

interface Asset {
  name: string;
  symbol: string;
  allocation: number;
  value: number;
  change: number;
}

interface PortfolioProps {
  totalValue: number;
  assets: Asset[];
}

export default function Portfolio({ totalValue, assets }: PortfolioProps) {
  // Ensure we have the required assets in order
  const assetOrder = ["BTC", "ETH", "USDT"];
  const sortedAssets = assetOrder
    .map((symbol) => assets.find((a) => a.symbol === symbol))
    .filter((asset) => asset !== undefined) as Asset[];

  const getAssetColor = (symbol: string): string => {
    switch (symbol) {
      case "BTC":
        return "from-amber-500 to-amber-600";
      case "ETH":
        return "from-purple-500 to-purple-600";
      case "USDT":
        return "from-green-500 to-green-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-8 backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h2 className="text-2xl font-semibold text-white">
          Portfolio Allocation
        </h2>
      </div>

      {/* Total Value */}
      <div className="mb-8 pb-8 border-b border-white/10">
        <p className="text-gray-400 text-sm font-medium mb-2">
          Total Portfolio Value
        </p>
        <p className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
          ${totalValue.toLocaleString()}
        </p>
      </div>

      {/* Assets */}
      <div className="space-y-6">
        {sortedAssets.map((asset) => (
          <div key={asset.symbol} className="space-y-3">
            {/* Asset Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white text-sm">{asset.name}</p>
                <p className="text-xs text-gray-400 mt-1">{asset.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  ${asset.value.toLocaleString()}
                </p>
                <p
                  className={`text-xs font-medium mt-1 ${
                    asset.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">
                  {asset.allocation}% allocation
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className={`h-2 rounded-full bg-linear-to-r ${getAssetColor(
                    asset.symbol,
                  )} transition-all duration-500 shadow-lg shadow-current/30`}
                  style={{ width: `${asset.allocation}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
        {sortedAssets.map((asset) => (
          <div key={`stat-${asset.symbol}`} className="text-center">
            <p className="text-xs text-gray-400 mb-2 font-medium">
              {asset.symbol}
            </p>
            <p className="text-sm font-semibold text-white">
              {asset.allocation}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
