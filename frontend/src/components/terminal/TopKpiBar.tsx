"use client";

import React from "react";
import {
  Scale,
  Zap,
  Activity,
  ArrowUpRight,
  Coins,
} from "lucide-react";
import { TopKpiMetrics } from "@/types/terminal";

interface TopKpiBarProps {
  metrics: TopKpiMetrics;
  isUpdating?: boolean;
}

export function TopKpiBar({ metrics, isUpdating = false }: TopKpiBarProps) {
  // Helper to format long pair names concisely for card display without losing context
  const formatPairLabel = (pairStr: string) => {
    return pairStr.replace(/\s*\(\d{4}-\d{2}-\d{2}\)/g, "").replace(/GOLD/g, "");
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 transition-opacity duration-200 ${isUpdating ? "opacity-70" : "opacity-100"}`}>
      {/* 1. Benchmark Pure Gram Price */}
      <div className="kpi-card flex flex-col justify-between rounded-xl p-3.5 border border-[#22262B] bg-[#111417] hover:bg-[#14171A] hover:border-[#303640] transition-colors min-h-[128px]">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[11px] font-mono tracking-normal text-[#A0A7B1] flex items-center gap-1.5 font-medium">
            <Coins className="h-3.5 w-3.5 text-[#D5B16D] shrink-0" />
            <span className="whitespace-nowrap">Benchmark Price</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#181C20] text-[#D5B16D] border border-[#2A2E35] shrink-0">
            0.999 Fine
          </span>
        </div>

        {/* Main Metric Value & Trend Badge */}
        <div className="flex items-center justify-between gap-2 my-1">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-xl xl:text-2xl font-mono font-bold text-[#D5B16D] tracking-tight tabular-nums whitespace-nowrap">
              ₹{metrics.benchmarkPureGramPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-mono text-[#757D88] shrink-0">/g</span>
          </div>
          {/* Institutional Trend Badge */}
          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-[#11241D] border border-[#214C3B] text-[11px] font-mono font-semibold text-[#45BD91]">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{metrics.benchmarkChangeBps} bps</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#22262B]">
          <span className="text-[#45BD91] font-medium whitespace-nowrap">
            +{metrics.benchmarkChangeBps} bps today
          </span>
          <span className="text-[#757D88] font-medium shrink-0">GOLDTEN Ref</span>
        </div>
      </div>

      {/* 2. Max Cross-Contract Basis Spread */}
      <div className="kpi-card flex flex-col justify-between rounded-xl p-3.5 border border-[#22262B] bg-[#111417] hover:bg-[#14171A] hover:border-[#303640] transition-colors min-h-[128px]">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[11px] font-mono tracking-normal text-[#A0A7B1] flex items-center gap-1.5 font-medium">
            <Scale className="h-3.5 w-3.5 text-[#A0A7B1] shrink-0" />
            <span className="whitespace-nowrap">Max Basis Spread</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#181C20] text-[#A0A7B1] border border-[#22262B] shrink-0">
            +{metrics.maxBasisSpreadBps} bps
          </span>
        </div>

        {/* Main Metric Value & Spread Pill */}
        <div className="flex items-center justify-between gap-2 my-1">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-xl xl:text-2xl font-mono font-bold text-[#F1EEE7] tracking-tight tabular-nums whitespace-nowrap">
              ₹{metrics.maxBasisSpreadInr.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-[#757D88] shrink-0">/g spread</span>
          </div>
          <div className="shrink-0 px-2 py-0.5 rounded bg-[#181C20] border border-[#22262B] text-[10px] font-mono text-[#A0A7B1]">
            Gross Peak
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#22262B]">
          <span className="text-[#F1EEE7] font-medium truncate max-w-[150px]" title={metrics.maxBasisPair}>
            {formatPairLabel(metrics.maxBasisPair)}
          </span>
          <span className="text-[#757D88] font-medium shrink-0">Bhavcopy Settlement</span>
        </div>
      </div>

      {/* 3. Net Actionable Mispricings */}
      <div className="kpi-card flex flex-col justify-between rounded-xl p-3.5 border border-[#22262B] bg-[#111417] hover:bg-[#14171A] hover:border-[#303640] transition-colors min-h-[128px]">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[11px] font-mono tracking-normal text-[#A0A7B1] flex items-center gap-1.5 font-medium">
            <Zap className={`h-3.5 w-3.5 shrink-0 ${metrics.actionableMispricingsCount > 0 ? "text-[#45BD91]" : "text-[#D5B16D]"}`} />
            <span className="whitespace-nowrap">Actionable Arbs</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 border ${metrics.actionableMispricingsCount > 0
                ? "bg-[#11241D] text-[#45BD91] border-[#214C3B]"
                : "bg-[#221C12] text-[#D5B16D] border-[#4D3D20]"
              }`}
          >
            Hurdle &gt; {metrics.roundTripHurdleBps} bps
          </span>
        </div>

        {/* Main Metric Value & Status */}
        <div className="flex items-center justify-between gap-2 my-1">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span
              className={`text-xl xl:text-2xl font-mono font-bold tracking-tight tabular-nums whitespace-nowrap ${metrics.actionableMispricingsCount > 0 ? "text-[#45BD91]" : "text-[#F1EEE7]"
                }`}
            >
              {metrics.actionableMispricingsCount}
            </span>
            <span className="text-xs font-mono text-[#757D88] shrink-0 whitespace-nowrap">
              of {metrics.totalMonitoredContracts} contracts
            </span>
          </div>
          <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${metrics.actionableMispricingsCount > 0
              ? "bg-[#11241D] text-[#45BD91] border-[#214C3B]"
              : "bg-[#221C12] text-[#D5B16D] border-[#4D3D20]"
            }`}>
            {metrics.actionableMispricingsCount > 0 ? "Actionable" : "Sub-Hurdle"}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#22262B]">
          <span
            className={`font-medium flex items-center gap-1.5 whitespace-nowrap ${metrics.actionableMispricingsCount > 0 ? "text-[#45BD91]" : "text-[#D5B16D]"
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${metrics.actionableMispricingsCount > 0 ? "bg-[#45BD91]" : "bg-[#D5B16D]"
                }`}
            />
            <span>
              {metrics.actionableMispricingsCount > 0 ? "Survives Friction" : "Friction Constrained"}
            </span>
          </span>
          <span className="text-[#757D88] font-medium shrink-0">STT + Slippage ~15 bps</span>
        </div>
      </div>

      {/* 4. Active Rolling Correlation */}
      <div className="kpi-card flex flex-col justify-between rounded-xl p-3.5 border border-[#22262B] bg-[#111417] hover:bg-[#14171A] hover:border-[#303640] transition-colors min-h-[128px]">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[11px] font-mono tracking-normal text-[#A0A7B1] flex items-center gap-1.5 font-medium">
            <Activity className="h-3.5 w-3.5 text-[#A0A7B1] shrink-0" />
            <span className="whitespace-nowrap">Rolling Corr (ρ)</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#181C20] text-[#A0A7B1] border border-[#22262B] shrink-0">
            90-Day Window
          </span>
        </div>

        {/* Main Metric Value & Confidence Pill */}
        <div className="flex items-center justify-between gap-2 my-1">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-xl xl:text-2xl font-mono font-bold text-[#F1EEE7] tracking-tight tabular-nums whitespace-nowrap">
              {metrics.activeRollingCorrelation.toFixed(4)}
            </span>
            <span className="text-xs font-mono text-[#45BD91] font-semibold shrink-0 whitespace-nowrap">Near 1.0</span>
          </div>
          <div className="shrink-0 px-2 py-0.5 rounded bg-[#11241D] border border-[#214C3B] text-[10px] font-mono font-semibold text-[#45BD91]">
            99.9% Parity
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#22262B]">
          <span className="text-[#F1EEE7] font-medium truncate max-w-[150px]" title={metrics.correlationPair}>
            {formatPairLabel(metrics.correlationPair)}
          </span>
          <span className="text-[#757D88] font-medium shrink-0">Par: 1.0040</span>
        </div>
      </div>
    </div>
  );
}
