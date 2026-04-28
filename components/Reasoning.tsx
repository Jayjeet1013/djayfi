import React from "react";
import { Brain, Sparkles } from "lucide-react";

interface ReasoningProps {
  text: string;
  isLoading?: boolean;
}

export default function Reasoning({ text, isLoading = false }: ReasoningProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold">AI Reasoning</h2>
        </div>
        {isLoading && (
          <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
        )}
      </div>

      {/* AI Message Box */}
      <div className="relative">
        <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-lg border border-purple-800 p-4 mb-4">
          {/* AI Avatar Indicator */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-200" />
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-purple-800 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-purple-800 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-purple-800 rounded animate-pulse w-2/3"></div>
                </div>
              ) : (
                <p className="text-gray-100 leading-relaxed text-sm">{text}</p>
              )}
            </div>
          </div>
        </div>

        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-11 h-0.5 w-1/3 bg-gradient-to-r from-purple-500 to-transparent"></div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>AI Generated Analysis</span>
        </div>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
