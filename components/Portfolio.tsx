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
        return "from-orange-500 to-orange-600";
      case "ETH":
        return "from-purple-500 to-purple-600";
      case "USDT":
        return "from-green-500 to-green-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold">Portfolio Allocation</h2>
      </div>

      {/* Total Value */}
      <div className="mb-6 pb-6 border-b border-gray-800">
        <p className="text-gray-400 text-sm mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
      </div>

      {/* Assets */}
      <div className="space-y-6">
        {sortedAssets.map((asset) => (
          <div key={asset.symbol} className="space-y-3">
            {/* Asset Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-white">{asset.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{asset.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  ${asset.value.toLocaleString()}
                </p>
                <p
                  className={`text-xs font-medium ${
                    asset.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {asset.allocation}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${getAssetColor(
                    asset.symbol,
                  )} transition-all duration-500`}
                  style={{ width: `${asset.allocation}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-3 gap-4">
        {sortedAssets.map((asset) => (
          <div key={`stat-${asset.symbol}`} className="text-center">
            <p className="text-xs text-gray-400 mb-1">{asset.symbol}</p>
            <p className="text-sm font-semibold text-white">
              {asset.allocation}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
