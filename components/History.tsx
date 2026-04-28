import React from "react";
import {
  History as HistoryIcon,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface HistoryItem {
  id: number;
  timestamp: string;
  action: string;
  status: "completed" | "pending" | "failed";
  details: string;
}

interface HistoryProps {
  items: HistoryItem[];
}

export default function History({ items }: HistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-green-500 bg-linear-to-r from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10";
      case "pending":
        return "border-l-amber-500 bg-linear-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 hover:to-amber-600/10";
      case "failed":
        return "border-l-red-500 bg-linear-to-r from-red-500/10 to-red-600/5 hover:from-red-500/15 hover:to-red-600/10";
      default:
        return "border-l-gray-600 bg-linear-to-r from-gray-500/10 to-gray-600/5 hover:from-gray-500/15 hover:to-gray-600/10";
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-500/20 text-green-300 border-green-500/30`;
      case "pending":
        return `${baseClasses} bg-amber-500/20 text-amber-300 border-amber-500/30`;
      case "failed":
        return `${baseClasses} bg-red-500/20 text-red-300 border-red-500/30`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-300 border-gray-500/30`;
    }
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-8 h-fit backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 rounded-lg bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
          <HistoryIcon className="w-3 h-3 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white">Trade History</h2>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <HistoryIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">No transactions yet</p>
          <p className="text-xs text-gray-500 mt-2">
            Analyze and execute trades to see them here
          </p>
        </div>
      ) : (
        /* History List */
        <div className="space-y-3 max-h-150 overflow-y-auto pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border border-l-4 rounded-lg p-4 transition-all duration-200 backdrop-blur-sm border-white/10 ${getStatusColor(
                item.status,
              )}`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(item.status)}
                  <p className="font-semibold text-sm text-white">
                    {item.action}
                  </p>
                </div>
                <span className={getStatusBadge(item.status)}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-400 mb-2 ml-6">
                {item.timestamp}
              </p>

              {/* Details */}
              <p className="text-xs text-gray-300 ml-6 leading-relaxed">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <p className="text-gray-400 mb-2 font-medium">
                Total Transactions
              </p>
              <p className="text-lg font-bold text-white">{items.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-2 font-medium">Success Rate</p>
              <p className="text-lg font-bold text-green-400">
                {Math.round(
                  (items.filter((i) => i.status === "completed").length /
                    items.length) *
                    100,
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
