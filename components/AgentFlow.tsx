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
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Agent Flow</h2>
          <p className="text-xs text-gray-400">Live demo state progression</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPlaying((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-black/30 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-gray-500 hover:bg-black/50"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-300" />
          {isPlaying ? "Pause demo" : "Play demo"}
        </button>
      </div>

      <div className="mb-5 flex h-2 overflow-hidden rounded-full bg-gray-800">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ease-out ${
              index <= activeStep
                ? "bg-linear-to-r from-purple-500 to-blue-500"
                : "bg-transparent"
            }`}
            style={{ width: `${100 / steps.length}%` }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <React.Fragment key={step.title}>
              <div
                className={`flex-1 rounded-lg border px-4 py-5 text-center shadow-sm transition-all duration-500 ease-out ${
                  isActive
                    ? "border-purple-500 bg-purple-950/70 text-white shadow-purple-950/30 scale-[1.02]"
                    : isComplete
                      ? "border-green-700 bg-green-950/40 text-green-100"
                      : "border-gray-700 bg-black/30 text-gray-300"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  {step.title}
                </div>
                <div className="mt-2 text-sm font-semibold uppercase tracking-wide">
                  {step.label}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-400 transition-colors duration-500">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex items-center justify-center text-gray-500 md:flex-none md:px-1">
                  <ArrowRight className="hidden h-5 w-5 transition-transform duration-500 md:block" />
                  <span className="text-lg md:hidden">↓</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {steps[activeStep].title}: {steps[activeStep].label}
        </span>
        <span>Market → Strategy → Risk → Execution → Memory</span>
      </div>
    </div>
  );
}
