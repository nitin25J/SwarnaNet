"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronRight,
} from "lucide-react";
import { McxContractQuote } from "@/types/terminal";
import { ContractInspectorModal } from "./ContractInspectorModal";

interface RelativeValueGridProps {
  contracts: McxContractQuote[];
}

export function RelativeValueGrid({ contracts }: RelativeValueGridProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspectContract, setInspectContract] = useState<McxContractQuote | null>(null);

  const filteredContracts = contracts.filter((c) => {
    const matchesSymbol = selectedSymbol === "ALL" || c.symbol === selectedSymbol;
    const matchesSearch =
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.expiryDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSymbol && matchesSearch;
  });

  return (
    <>
      <div className="bg-[#111417] rounded-xl p-4 sm:p-5 border border-[#22262B] shadow-sm transition-colors">
        {/* Module Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-3.5 border-b border-[#22262B]">
          {/* Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-mono tracking-tight text-[#F1EEE7] uppercase">
                Cross-Contract Relative Value Grid
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#181C20] border border-[#2A2E35] text-[10px] font-mono font-medium text-[#D5B16D]">
                0.999 vs 0.995 Fine Normalization
              </span>
            </div>
            <p className="text-xs text-[#757D88] font-mono mt-0.5 font-medium">
              Tracking MCX 4 Core Gold Contracts • Par Ratio: 1.00402 • Click any row for mathematical derivation
            </p>
          </div>

          {/* Right Controls: Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 rounded-lg border border-[#22262B] bg-[#0F1215] p-1">
              {(["ALL", "GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"] as const).map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setSelectedSymbol(sym)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    selectedSymbol === sym
                      ? "bg-[#D5B16D] text-[#0D0F11] font-bold"
                      : "text-[#A0A7B1] hover:text-[#F1EEE7] hover:bg-[#181C20]"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#757D88]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expiry..."
                className="bg-[#0F1215] border border-[#22262B] rounded-lg pl-8 pr-3 py-1 text-xs text-[#F1EEE7] font-mono placeholder-[#757D88] w-full sm:w-48 focus:outline-none focus:border-[#D5B16D] focus:ring-1 focus:ring-[#D5B16D]"
              />
            </div>
          </div>
        </div>

        {/* Relative Value Table Scroll Container (Sticky thead locks in view) */}
        <div className="max-h-[520px] overflow-y-auto overflow-x-auto rounded-lg border border-[#22262B] bg-[#111417]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="terminal-sticky-thead">
              <tr className="text-[#A0A7B1] uppercase tracking-wider text-[10px] border-b border-[#22262B]">
                <th className="py-2.5 px-3 font-semibold bg-[#14171A]">Contract</th>
                <th className="py-2.5 px-2.5 font-semibold bg-[#14171A]">Expiry</th>
                <th className="py-2.5 px-2 font-semibold bg-[#14171A] text-right">Quote</th>
                <th className="py-2.5 px-2 font-semibold bg-[#14171A] text-center">Purity</th>
                <th className="py-2.5 px-2.5 font-semibold text-right bg-[#14171A]">Settlement</th>
                <th className="py-2.5 px-3 font-semibold text-right text-[#D5B16D] bg-[#14171A]">
                  Norm PPG (₹/g)
                </th>
                <th className="py-2.5 px-2.5 font-semibold text-right bg-[#14171A]">Par (₹/g)</th>
                <th className="py-2.5 px-2.5 font-semibold text-right bg-[#14171A]">Disparity</th>
                <th className="py-2.5 px-2 font-semibold text-center bg-[#14171A]">Liquidity</th>
                <th className="py-2.5 px-2 font-semibold text-right bg-[#14171A]">Slippage</th>
                <th className="py-2.5 px-3 font-semibold text-center bg-[#14171A]">Verdict</th>
                <th className="py-2.5 px-2 font-semibold text-center bg-[#14171A]">Math</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c, idx) => {
                const isAlt = idx % 2 === 1;
                return (
                  <tr
                    key={`${c.symbol}-${c.expiryDate}`}
                    onClick={() => setInspectContract(c)}
                    className={`transition-colors cursor-pointer border-b border-[#22262B] ${
                      isAlt ? "bg-[#111417]" : "bg-[#14171A]"
                    } hover:bg-[#181C20]`}
                  >
                    {/* Symbol & Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#F1EEE7] flex items-center gap-1.5">
                        <span>{c.symbol}</span>
                      </div>
                      <div className="text-[10px] text-[#757D88] truncate max-w-[130px]">
                        {c.contractName}
                      </div>
                    </td>

                    {/* Expiry Date & Physical Delivery Tender Warning */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-[#181C20] border border-[#22262B] text-[10px] font-medium text-[#F1EEE7]">
                          {c.expiryDate}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        {c.daysToExpiry <= 5 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1C1618] text-[#E47777] border border-[#47262A] text-[9px] font-semibold">
                            <span>⚠️ TENDER</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#45BD91] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#45BD91]" />
                            <span>{c.daysToExpiry}d left</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quote Base */}
                    <td className="py-2.5 px-2 text-right text-[#A0A7B1] tabular-nums whitespace-nowrap">
                      {c.quotationBaseGrams}g
                    </td>

                    {/* Purity Grade */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          c.purity === 999
                            ? "bg-[#221C12] text-[#D5B16D] border border-[#4D3D20]"
                            : "bg-[#181C20] text-[#A0A7B1] border border-[#22262B]"
                        }`}
                      >
                        {c.purity} Fine
                      </span>
                    </td>

                    {/* Settlement Price */}
                    <td className="py-2.5 px-2.5 text-right font-medium text-[#F1EEE7] tabular-nums whitespace-nowrap">
                      ₹{c.settlementPrice.toLocaleString("en-IN")}
                      <div className={`text-[10px] font-medium ${c.changePct >= 0 ? "text-[#45BD91]" : "text-[#E47777]"}`}>
                        {c.changePct >= 0 ? "+" : ""}{c.changePct}%
                      </div>
                    </td>

                    {/* Normalized PPG */}
                    <td className="py-2.5 px-3 text-right font-bold text-[#D5B16D] text-sm tabular-nums whitespace-nowrap">
                      ₹{c.normalizedPpg.toFixed(2)}
                    </td>

                    {/* Theoretical Par */}
                    <td className="py-2.5 px-2.5 text-right text-[#A0A7B1] tabular-nums whitespace-nowrap">
                      ₹{c.theoreticalParPpg.toFixed(2)}
                    </td>

                    {/* Disparity Spread */}
                    <td className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          c.disparitySpreadBps > 0
                            ? "text-[#E47777]"
                            : c.disparitySpreadBps < 0
                            ? "text-[#45BD91]"
                            : "text-[#757D88]"
                        }`}
                      >
                        {c.disparitySpreadBps > 0 ? "+" : ""}
                        {c.disparitySpreadBps} bps
                      </span>
                      <div className="text-[10px] text-[#757D88]">
                        {c.disparitySpreadInr > 0 ? "+" : ""}₹{c.disparitySpreadInr.toFixed(2)}/g
                      </div>
                    </td>

                    {/* Liquidity Tier */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          c.liquidityTier === "High"
                            ? "bg-[#11241D] text-[#45BD91] border border-[#214C3B]"
                            : c.liquidityTier === "Med"
                            ? "bg-[#181C20] text-[#A0A7B1] border border-[#22262B]"
                            : "bg-[#1C1618] text-[#E47777] border border-[#47262A]"
                        }`}
                      >
                        {c.liquidityTier}
                      </span>
                    </td>

                    {/* Estimated Slippage Drag */}
                    <td className="py-2.5 px-2 text-right text-[#757D88] tabular-nums whitespace-nowrap">
                      {c.estimatedSlippageBps} bps
                    </td>

                    {/* Executable Verdict / Opportunity State */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                          c.opportunityState === "VALIDATED_CANDIDATE"
                            ? "bg-[#11241D] text-[#45BD91] border border-[#214C3B]"
                            : c.opportunityState === "FRICTION_CONSTRAINED"
                            ? "bg-[#221C12] text-[#D5B16D] border border-[#4D3D20]"
                            : "bg-[#181C20] text-[#A0A7B1] border border-[#22262B]"
                        }`}
                      >
                        {c.opportunityState === "VALIDATED_CANDIDATE"
                          ? c.verdict
                          : c.opportunityState === "FRICTION_CONSTRAINED"
                          ? "FRICTION CONSTRAINED"
                          : c.verdict}
                      </span>
                    </td>

                    {/* Feature D: Math [fx] Trigger */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectContract(c);
                        }}
                        className="px-2 py-0.5 rounded bg-[#181C20] hover:bg-[#22262B] text-[#D5B16D] hover:text-[#E2C07D] border border-[#2A2E35] hover:border-[#4D3D20] transition-colors font-mono text-[10px] font-medium inline-flex items-center gap-0.5 cursor-pointer"
                        title="Click to view step-by-step arithmetic derivation"
                      >
                        <span>[fx]</span>
                        <ChevronRight className="h-3 w-3 inline-block" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footnote */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#757D88]">
          <span>
            * Par Ratio: 999 / 995 ≈ 1.00402 (~0.402% natural structural purity premium).
          </span>
          <span className="text-[#A0A7B1] flex items-center gap-1 font-medium mt-1 sm:mt-0">
            <span>Click any row or [fx] button to trigger interactive mathematical derivation modal</span>
          </span>
        </div>
      </div>

      {/* Inspector Modal */}
      <ContractInspectorModal
        contract={inspectContract}
        onClose={() => setInspectContract(null)}
      />
    </>
  );
}
