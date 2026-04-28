"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    label: "Fetching market data",
    title: "Market",
    description: "Pulling BTC, ETH, and USDT price data.",
  },
  {
    label: "AI analyzing",
    title: "Strategy",
    description: "Generating portfolio allocation and reasoning.",
  },
  {
    label: "Decision ready",
    title: "Risk",
    description: "Validating allocation and applying safety limits.",
  },
  {
    label: "Executing trade",
    title: "Execution",
    description: "Sending trade actions through KeeperHub.",
  },
  {
    label: "Success",
    title: "Memory",
    description: "Persisting the decision and execution result.",
  },
] as const;

export default function AgentFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-8 backdrop-blur-md hover:bg-white/[0.07] transition-colors duration-300">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Agent Pipeline</h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            AI agent orchestration pipeline
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPlaying((current) => !current)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-white/30 hover:bg-white/15 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-blue-300" />
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div className="mb-6 flex h-1.5 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border border-white/5">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ease-out ${
              index <= activeStep
                ? "bg-linear-to-r from-purple-500 via-blue-500 to-blue-400 shadow-lg shadow-blue-500/50"
                : "bg-white/5"
            }`}
            style={{ width: `${100 / steps.length}%` }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <React.Fragment key={step.title}>
              <div
                className={`flex-1 rounded-lg border px-4 py-4 text-center transition-all duration-500 ease-out ${
                  isActive
                    ? "border-purple-400/50 bg-linear-to-br from-purple-600/20 to-purple-700/10 backdrop-blur-md text-white shadow-xl shadow-purple-500/20 scale-[1.03]"
                    : isComplete
                      ? "border-green-500/30 bg-linear-to-br from-green-500/15 to-green-600/5 backdrop-blur-sm text-green-100"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                  {step.title}
                </div>
                <div className="mt-1.5 text-xs font-semibold text-current">
                  {step.label}
                </div>
                <p className="mt-1.5 text-xs leading-tight text-current/80 transition-colors duration-500">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex items-center justify-center text-gray-400 md:flex-none md:px-1">
                  <ArrowRight className="hidden h-4 w-4 transition-transform duration-500 md:block" />
                  <span className="text-sm md:hidden">↓</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-gray-500 font-medium">
          {steps[activeStep].title}: {steps[activeStep].label}
        </span>
        <span className="text-xs text-gray-500 font-medium">
          Market → Strategy → Risk → Execution → Memory
        </span>
      </div>
    </div>
  );
}
