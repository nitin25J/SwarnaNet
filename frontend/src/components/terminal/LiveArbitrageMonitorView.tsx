"use client";

import React, { useState } from "react";
import { ArrowLeftRight, ShieldAlert } from "lucide-react";
import { McxContract } from "@/types/terminal";
import { RelativeValueGrid } from "./RelativeValueGrid";

interface LiveArbitrageMonitorViewProps {
  contracts: McxContract[];
}

export function LiveArbitrageMonitorView({ contracts }: LiveArbitrageMonitorViewProps) {
  const [selectedPurityFilter, setSelectedPurityFilter] = useState<string>("ALL");

  const filteredContracts = contracts.filter((c) => {
    if (selectedPurityFilter === "ALL") return true;
    if (selectedPurityFilter === "GOLDM") return c.symbol === "GOLDM";
    if (selectedPurityFilter === "GOLDTEN") return c.symbol === "GOLDTEN";
    if (selectedPurityFilter === "GOLDGUINEA") return c.symbol === "GOLDGUINEA";
    if (selectedPurityFilter === "GOLDPETAL") return c.symbol === "GOLDPETAL";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-[#111417] rounded-xl p-4 sm:p-5 border border-[#22262B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#14171A] text-[#D5B16D] border border-[#22262B]">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-sans font-semibold text-[#F1EEE7]">Live Arbitrage Monitor (Maximized View)</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#11241D] text-[#45BD91] border border-[#214C3B] uppercase">
                  SUB-MILLI DISPARITY RADAR
                </span>
              </div>
              <p className="text-xs font-mono text-[#757D88] mt-0.5">
                Surveillance across GOLDM, GOLDTEN, GOLDGUINEA, and GOLDPETAL
              </p>
            </div>
          </div>
        </div>

        {/* Quick Contract Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1215] border border-[#22262B] text-xs font-mono">
          {["ALL", "GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedPurityFilter(tab)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedPurityFilter === tab
                  ? "bg-[#D5B16D] text-[#0D0F11] font-bold"
                  : "text-[#A0A7B1] hover:text-[#F1EEE7] hover:bg-[#181C20]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Disparity Radar Bar: 4 Contracts at Pure Gram Parity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {contracts.slice(0, 4).map((contract) => {
          const pureGram = contract.normalizedPpg;
          const isTender = contract.isTenderActive;
          return (
            <div
              key={`${contract.symbol}-${contract.expiryDate}`}
              className={`p-3.5 rounded-xl border transition-colors ${
                isTender
                  ? "bg-[#1C1618] border-[#47262A]"
                  : "bg-[#111417] border-[#22262B] hover:border-[#303640] hover:bg-[#14171A]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#F1EEE7]">{contract.symbol}</span>
                <span className="text-[10px] font-mono text-[#D5B16D] bg-[#181C20] px-1.5 py-0.5 rounded border border-[#2A2E35]">
                  {contract.purity} Fineness
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-mono font-bold text-[#D5B16D] tabular-nums">
                    ₹{pureGram.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-[#757D88] ml-1">/ pure gram</span>
                </div>
                <span
                  className={`text-xs font-mono font-semibold tabular-nums ${
                    contract.disparitySpreadBps >= 0 ? "text-[#45BD91]" : "text-[#E47777]"
                  }`}
                >
                  {contract.disparitySpreadBps >= 0 ? "+" : ""}
                  {contract.disparitySpreadBps.toFixed(1)} bps
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#22262B] flex items-center justify-between text-[10px] font-mono text-[#757D88]">
                <span>Expiry: {contract.expiryDate}</span>
                {isTender ? (
                  <span className="text-[#E47777] font-semibold">⚠️ TENDER ACTIVE</span>
                ) : (
                  <span className="text-[#45BD91]">{contract.daysToExpiry}d left</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Maximized Relative Value Grid */}
      <RelativeValueGrid contracts={filteredContracts} />

      {/* Verified Opportunity Validation Engine Status Bar */}
      <div className="bg-[#111417] rounded-xl p-3.5 border border-[#22262B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#221C12] text-[#D5B16D] border border-[#4D3D20] shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F1EEE7]">Opportunity Validation Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#221C12] text-[#D5B16D] border border-[#4D3D20] uppercase font-bold">
                Friction Constrained
              </span>
            </div>
            <span className="text-[#757D88] text-[11px] block mt-0.5">
              Active Spread: <strong className="text-[#F1EEE7]">GOLDGUINEA vs GOLDPETAL</strong> | Gross Edge: <span className="text-[#A0A7B1]">6.4 bps (₹9.01/10g)</span> &lt; Hurdle: <span className="text-[#E47777]">15.0 bps</span> | Net Edge: <span className="text-[#E47777] font-semibold">-8.6 bps</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="px-2.5 py-1 rounded bg-[#0F1215] text-[#757D88] border border-[#22262B] text-[11px]">
            No DMA/OMS Connected • Analytical Feed Only
          </span>
        </div>
      </div>
    </div>
  );
}
