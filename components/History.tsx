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
        return "border-l-green-500 bg-green-900 bg-opacity-10";
      case "pending":
        return "border-l-yellow-500 bg-yellow-900 bg-opacity-10";
      case "failed":
        return "border-l-red-500 bg-red-900 bg-opacity-10";
      default:
        return "border-l-gray-600 bg-gray-900 bg-opacity-10";
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs font-semibold px-2.5 py-1 rounded-full";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-900 text-green-200`;
      case "pending":
        return `${baseClasses} bg-yellow-900 text-yellow-200`;
      case "failed":
        return `${baseClasses} bg-red-900 text-red-200`;
      default:
        return `${baseClasses} bg-gray-800 text-gray-300`;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 h-fit">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="w-5 h-5 text-green-400" />
        <h2 className="text-xl font-semibold">Trade History</h2>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <HistoryIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No transactions yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Analyze and execute trades to see them here
          </p>
        </div>
      ) : (
        /* History List */
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border border-gray-700 border-l-4 rounded p-4 transition-all hover:border-gray-600 ${getStatusColor(
                item.status,
              )}`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(item.status)}
                  <p className="font-medium text-sm text-white">
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
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <p className="text-gray-400 mb-1">Total Transactions</p>
              <p className="text-lg font-semibold text-white">{items.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-1">Success Rate</p>
              <p className="text-lg font-semibold text-green-400">
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
