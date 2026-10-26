"use client";

import React from "react";
import { Radio, Database, ShieldAlert } from "lucide-react";

interface MarketStatusBarProps {
  status?: "demo" | "online" | "offline";
  latencyMs?: number;
}

export function MarketStatusBar({
  status = "demo",
  latencyMs = 24,
}: MarketStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#25292E] text-xs font-mono">
      {/* Exchange Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === "online"
                ? "bg-[#48B58A] animate-ping"
                : status === "demo"
                ? "bg-[#AEB4BD] animate-pulse"
                : "bg-[#E07878]"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === "online"
                ? "bg-[#48B58A]"
                : status === "demo"
                ? "bg-[#AEB4BD]"
                : "bg-[#E07878]"
            }`}
          />
        </span>
        <span
          className={`text-[11px] font-semibold tracking-wider uppercase ${
            status === "online"
              ? "text-[#48B58A]"
              : status === "demo"
              ? "text-[#C4C7CC]"
              : "text-[#E07878]"
          }`}
        >
          {status === "online"
            ? "MCX BHAVCOPY: LIVE STREAM"
            : status === "demo"
            ? "MCX BHAVCOPY: EOD SNAPSHOT (DEMO)"
            : "MCX BHAVCOPY: OFFLINE"}
        </span>
      </div>

      {/* Latency / Mode Badge */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#141619] border border-[#292D32] text-[9.5px] sm:text-[10px] text-[#9299A3]">
        {status === "online" ? (
          <>
            <Radio className="h-3 w-3 text-[#48B58A] animate-pulse" aria-hidden="true" />
            <span>Exchange Latency: {latencyMs}ms</span>
          </>
        ) : status === "demo" ? (
          <>
            <Database className="h-3 w-3 text-[#AEB4BD]" aria-hidden="true" />
            <span>Discrete EOD Parser Active</span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-3 w-3 text-[#E07878]" aria-hidden="true" />
            <span>Disconnected</span>
          </>
        )}
      </div>
    </div>
  );
}
