import React from "react";
import { Brain, Sparkles } from "lucide-react";

interface ReasoningProps {
  text: string;
  isLoading?: boolean;
}

export default function Reasoning({ text, isLoading = false }: ReasoningProps) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-8 backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white">AI Reasoning</h2>
        </div>
        {isLoading && (
          <Sparkles className="w-4 h-4 text-purple-300 animate-pulse ml-auto" />
        )}
      </div>

      {/* AI Message Box */}
      <div className="relative">
        <div className="bg-linear-to-br from-purple-600/20 to-purple-700/10 rounded-xl border border-purple-500/20 p-6 mb-4 backdrop-blur-sm">
          {/* AI Avatar Indicator */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-9 h-9 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded-full animate-pulse w-5/6"></div>
                  <div className="h-4 bg-white/10 rounded-full animate-pulse w-2/3"></div>
                </div>
              ) : (
                <p className="text-gray-100 leading-relaxed text-sm font-medium">
                  {text}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-14 h-0.5 w-1/3 bg-linear-to-r from-purple-500/60 to-transparent"></div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>AI Generated Analysis</span>
        </div>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
