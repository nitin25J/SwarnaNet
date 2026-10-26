"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { ActionableAlert, SuppressedNoiseAlert } from "@/types/terminal";

interface TraderAlertMatrixProps {
  actionableAlerts: ActionableAlert[];
  suppressedNoiseAlerts: SuppressedNoiseAlert[];
}

export function TraderAlertMatrix({
  actionableAlerts,
  suppressedNoiseAlerts,
}: TraderAlertMatrixProps) {
  const [activeTab, setActiveTab] = useState<"actionable" | "suppressed">("actionable");

  return (
    <div className="bg-[#111417] border border-[#22262B] rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#22262B]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-mono tracking-wider text-[#F1EEE7] uppercase">
              Low-Noise Trader Alert Matrix
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#181C20] border border-[#2A2E35] text-[10px] font-mono font-medium text-[#D5B16D]">
              Friction-Aware Signal Filter
            </span>
          </div>
          <p className="text-xs text-[#757D88] font-mono mt-0.5">
            Real-time cross-contract arb execution gateway with quantitative noise suppression
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-[#22262B] bg-[#0F1215] p-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("actionable")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeTab === "actionable"
                ? "bg-[#D5B16D] text-[#0D0F11] font-bold"
                : "text-[#A0A7B1] hover:text-[#F1EEE7] hover:bg-[#181C20]"
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Actionable Spreads ({actionableAlerts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suppressed")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeTab === "suppressed"
                ? "bg-[#221C12] text-[#D5B16D] border border-[#4D3D20]"
                : "text-[#A0A7B1] hover:text-[#F1EEE7] hover:bg-[#181C20]"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Suppressed Noise ({suppressedNoiseAlerts.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Actionable Spreads (Alpha Signal) */}
      {activeTab === "actionable" && (
        <div className="space-y-3">
          {actionableAlerts.length === 0 ? (
            <div className="p-6 rounded-xl border border-[#22262B] bg-[#14171A] text-center font-mono space-y-3">
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full bg-[#181C20] border border-[#2A2E35] flex items-center justify-center text-[#D5B16D]">
                  <Scale className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F1EEE7] tracking-wider uppercase">
                  Zero Hurdle Breakouts Detected
                </h4>
                <p className="text-[11px] text-[#757D88] max-w-md mx-auto mt-1">
                  All 4 monitored MCX gold contracts trade within theoretical parity. Transaction frictions (STT, exchange turnover fees, bid-ask slippage ~15.0 bps) exceed gross basis disparities (peak: 6.4 bps).
                </p>
              </div>
              <div className="pt-2 border-t border-[#22262B] flex flex-wrap items-center justify-center gap-4 text-[10px] text-[#A0A7B1]">
                <span>Gross Peak: <strong className="text-[#F1EEE7]">6.4 bps</strong></span>
                <span>•</span>
                <span>Hurdle Barrier: <strong className="text-[#D5B16D]">15.0 bps</strong></span>
                <span>•</span>
                <span>Net Edge: <strong className="text-[#757D88]">-8.6 bps</strong></span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("suppressed")}
                  className="text-[#D5B16D] hover:underline cursor-pointer"
                >
                  View Suppressed Noise ({suppressedNoiseAlerts.length}) →
                </button>
              </div>
            </div>
          ) : (
            actionableAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-[#214C3B] bg-[#11241D]/30 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-[#214C3B]/40">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#11241D] text-[#45BD91] font-semibold text-[10px] border border-[#214C3B]">
                      {alert.convictionLevel}
                    </span>
                    <span className="font-semibold text-[#F1EEE7]">{alert.id}</span>
                    <span className="text-[#757D88] text-[11px]">• {alert.timestamp}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-[#14171A] border border-[#22262B] text-[#A0A7B1] font-medium">
                      Tender Window Status: {alert.tenderWindowStatus || "Safe / Cash-Settled Window"}
                    </span>
                    <span className="text-[#757D88]">
                      Execution: <strong className="text-[#F1EEE7]">{alert.executionWindow}</strong>
                    </span>
                  </div>
                </div>

                {/* 2-Leg Pair Trade Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">
                  {/* Leg 1: Long Cheap */}
                  <div className="p-2.5 rounded-lg bg-[#14171A] border border-[#22262B] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#45BD91] font-semibold block uppercase">
                        LEG 1: BUY (CHEAP)
                      </span>
                      <span className="font-semibold text-[#F1EEE7] text-sm">
                        {alert.legLongSymbol} {alert.legLongExpiry}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#757D88] block">Normalized PPG</span>
                      <span className="font-semibold text-[#45BD91]">₹{alert.legLongPpg.toFixed(2)}/g</span>
                    </div>
                  </div>

                  {/* Leg 2: Short Expensive */}
                  <div className="p-2.5 rounded-lg bg-[#14171A] border border-[#22262B] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#E47777] font-semibold block uppercase">
                        LEG 2: SELL (EXPENSIVE)
                      </span>
                      <span className="font-semibold text-[#F1EEE7] text-sm">
                        {alert.legShortSymbol} {alert.legShortExpiry}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#757D88] block">Normalized PPG</span>
                      <span className="font-semibold text-[#E47777]">₹{alert.legShortPpg.toFixed(2)}/g</span>
                    </div>
                  </div>
                </div>

                {/* Decomposed Calendar Carry & Net Arbitrage Breakdown */}
                <div className="p-3 rounded-lg bg-[#111417] border border-[#22262B] space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-[#757D88] border-b border-[#22262B] pb-1.5">
                    <span className="text-[#A0A7B1] font-semibold uppercase">
                      Carry Decomposition ({alert.daysBetweenMaturities}d Maturity Gap @ {alert.annualizedCarryRatePct}% p.a.)
                    </span>
                    <span className="text-[#45BD91] font-semibold">✓ Net Alpha &gt; 0</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                    <div>
                      <span className="text-[10px] text-[#757D88] block">1. Gross Spread:</span>
                      <strong className="text-[#F1EEE7]">₹{alert.grossSpreadInr.toFixed(2)}/g ({alert.grossSpreadBps} bps)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#757D88] block">2. Expected Carry:</span>
                      <strong className="text-[#D5B16D]">₹{alert.calendarCarryInr.toFixed(2)}/g ({alert.calendarCarryBps} bps)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#757D88] block">3. Net Basis Mispricing:</span>
                      <strong className="text-[#A0A7B1]">₹{alert.netBasisSpreadInr.toFixed(2)}/g ({alert.netBasisSpreadBps} bps)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#757D88] block">4. Round-Trip Hurdle:</span>
                      <strong className="text-[#E47777]">{alert.roundTripFrictionBps} bps</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#22262B] text-[11px]">
                    <span className="text-[#757D88]">
                      Net Edge After Carry & Fees: <strong className="text-[#45BD91]">+{alert.netEdgeBps} bps</strong> (~₹{alert.netConvergenceExpectedInr.toFixed(2)}/g profit)
                    </span>
                    <span className="text-[#45BD91] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>SURVIVES SLIPPAGE & STT</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Suppressed Noise Log */}
      {activeTab === "suppressed" && (
        <div className="space-y-2.5">
          {suppressedNoiseAlerts.map((noise) => (
            <div
              key={noise.id}
              className="p-3 rounded-xl border border-[#22262B] bg-[#14171A] font-mono text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-[#22262B]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#181C20] border border-[#22262B] text-[#D5B16D] font-semibold text-[10px]">
                    {noise.isCalendarCarryFiltered ? "FILTERED / SUB-HURDLE" : "SUPPRESSED"}
                  </span>
                  <span className="font-semibold text-[#F1EEE7]">{noise.pair}</span>
                  <span className="text-[#757D88] text-[10px]">• {noise.timestamp}</span>
                </div>
                <div className="text-[11px] text-[#A0A7B1] font-semibold">
                  Net Expected Drag: <span className="text-[#E47777]">{noise.netPnlExpectedBps} bps</span>
                </div>
              </div>

              {/* Decomposition breakdown for calendar spreads */}
              {noise.isCalendarCarryFiltered ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 text-[11px] text-[#A0A7B1] bg-[#111417] p-2 rounded-lg border border-[#22262B] mb-2">
                  <div>
                    Raw Disparity: <span className="text-[#F1EEE7] font-semibold">{noise.rawDisparityBps} bps</span>
                  </div>
                  <div>
                    Calendar Carry (36d): <span className="text-[#D5B16D] font-semibold">+{noise.calendarCarryBps} bps</span>
                  </div>
                  <div>
                    Net Basis: <span className="text-[#A0A7B1] font-semibold">+{noise.netBasisSpreadBps} bps</span>
                  </div>
                  <div>
                    Execution Hurdle: <span className="text-[#E47777] font-semibold">{noise.frictionHurdleBps} bps</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 text-[11px] text-[#A0A7B1]">
                  <div>
                    Raw Disparity: <span className="text-[#F1EEE7] font-semibold">{noise.rawDisparityBps} bps</span>
                  </div>
                  <div>
                    Slippage Drag: <span className="text-[#E47777] font-semibold">{noise.slippageDragBps} bps</span>
                  </div>
                  <div>
                    Fee Hurdle: <span className="text-[#E47777] font-semibold">{noise.frictionHurdleBps} bps</span>
                  </div>
                </div>
              )}

              {/* Exact Quantitative Suppression Rationale */}
              <div className="mt-1 p-2 rounded bg-[#111417] border border-[#22262B] text-[11px] text-[#A0A7B1] flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-[#D5B16D] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#F1EEE7]">Algorithm Rationale:</strong> {noise.suppressionReason}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
