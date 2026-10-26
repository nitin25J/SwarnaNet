"use client";

import React from "react";
import {
  X,
  Calculator,
} from "lucide-react";
import { McxContractQuote } from "@/types/terminal";

interface ContractInspectorModalProps {
  contract: McxContractQuote | null;
  onClose: () => void;
}

export function ContractInspectorModal({
  contract,
  onClose,
}: ContractInspectorModalProps) {
  if (!contract) return null;

  const is999 = contract.purity === 999;
  const purityFactor = is999 ? 0.999 : 0.995;
  const basePricePerGram = contract.settlementPrice / contract.quotationBaseGrams;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101113]/85" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#34383D] bg-[#181A1D] p-6 shadow-2xl text-[#F2F0EA] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#25292E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#222831] border border-[#34383D] text-[#D6D0C4]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F2F0EA] font-mono">
                  {contract.symbol} • {contract.expiryDate}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#222831] border border-[#34383D] text-[10px] font-mono font-medium text-[#AEB4BD]">
                  Purity: {contract.purity} Fine Gold
                </span>
              </div>
              <p className="text-xs text-[#9299A3] font-mono mt-0.5">
                Exact Normalization Derivation & Mathematical Proof
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9299A3] hover:bg-[#24282D] hover:text-[#F2F0EA] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Math Derivation Pipeline Cards */}
        <div className="mt-5 space-y-4">
          {/* Step 1: Quotation Scale Conversion */}
          <div className="p-4 rounded-xl border border-[#292D32] bg-[#141619]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#D6D0C4] uppercase">
                Step 1: Quotation Scale De-multiplication
              </span>
              <span className="text-[10px] font-mono text-[#9299A3]">
                Formula: Quoted Price / Quote Unit Grams
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#191C20] border border-[#25292E] font-mono text-xs text-[#C4C7CC] space-y-1">
              <p>
                <span className="text-[#9299A3]">Official MCX Settlement:</span>{" "}
                <span className="text-[#F2F0EA] font-semibold">₹{contract.settlementPrice.toLocaleString("en-IN")}</span> per {contract.quotationBaseGrams}g quote lot
              </p>
              <p>
                <span className="text-[#9299A3]">Quotation Scale De-multiplication:</span> ₹{contract.settlementPrice.toLocaleString("en-IN")} ÷ {contract.quotationBaseGrams}g ={" "}
                <span className="text-[#E6E1D6] font-semibold">₹{basePricePerGram.toFixed(2)} / raw gram</span>
              </p>
            </div>
          </div>

          {/* Step 2: Fineness / Purity Normalization */}
          <div className="p-4 rounded-xl border border-[#292D32] bg-[#141619]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#D6D0C4] uppercase">
                Step 2: Fineness Normalization (PPG)
              </span>
              <span className="text-[10px] font-mono text-[#9299A3]">
                Dividing by {purityFactor} ({contract.purity} Fine)
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#191C20] border border-[#25292E] font-mono text-xs text-[#C4C7CC] space-y-1.5">
              <p>
                <span className="text-[#9299A3]">Normalized PPG Formula:</span> (Raw Price / Gram) ÷ {purityFactor}
              </p>
              <p>
                <span className="text-[#9299A3]">Normalized PPG:</span> ₹{basePricePerGram.toFixed(2)} ÷ {purityFactor} ={" "}
                <span className="text-[#E6E1D6] font-semibold text-sm">₹{contract.normalizedPpg.toFixed(2)} / pure gram</span>
              </p>
              <p className="text-[11px] text-[#9299A3]">
                {is999
                  ? "Divided by 0.999 (GOLDTEN, GOLDGUINEA, GOLDPETAL) to yield pure gold benchmark equivalence."
                  : "Divided by 0.995 (GOLDM) to normalize mini 995 fineness into pure gold."}
              </p>
            </div>
          </div>

          {/* Step 3: Par Ratio & Basis Disparity Calculation */}
          <div className="p-4 rounded-xl border border-[#292D32] bg-[#141619]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#D6D0C4] uppercase">
                Step 3: Par Ratio & Basis Disparity Calculation
              </span>
              <span className="text-[10px] font-mono text-[#48B58A] font-semibold">
                Par Ratio: 999 / 995 ≈ 1.00402 (~0.402% purity premium)
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#191C20] border border-[#25292E] font-mono text-xs text-[#C4C7CC] space-y-2">
              <div className="p-2 rounded bg-[#141619] border border-[#292D32] text-[#AEB4BD]">
                <strong>Fundamental Par Ratio Step:</strong> 999 / 995 ≈ 1.00402 (~0.402% natural structural purity premium).
              </div>
              <p>
                <span className="text-[#9299A3]">Disparity Formula:</span>{" "}
                <code className="text-[#F2F0EA]">((Normalized PPG - Theoretical Par) / Theoretical Par) * 10,000</code>
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[#9299A3] block text-[11px]">Theoretical Par:</span>
                  <span className="text-sm font-semibold text-[#F2F0EA]">₹{contract.theoreticalParPpg.toFixed(2)} / g</span>
                </div>
                <div>
                  <span className="text-[#9299A3] block text-[11px]">Disparity Spread:</span>
                  <span className={`text-sm font-semibold ${contract.disparitySpreadBps >= 0 ? "text-[#E07878]" : "text-[#48B58A]"}`}>
                    {contract.disparitySpreadInr >= 0 ? "+" : ""}₹{contract.disparitySpreadInr.toFixed(2)} / g ({contract.disparitySpreadBps >= 0 ? "+" : ""}{contract.disparitySpreadBps} bps)
                  </span>
                </div>
                <div>
                  <span className="text-[#9299A3] block text-[11px]">Total Friction Hurdle:</span>
                  <span className="text-xs font-semibold text-[#C4C7CC]">{contract.totalRoundTripFrictionBps} bps</span>
                </div>
                <div>
                  <span className="text-[#9299A3] block text-[11px]">Net Edge:</span>
                  <span className={`text-xs font-semibold ${contract.netEdgeBps > 0 ? "text-[#48B58A]" : "text-[#9299A3]"}`}>
                    {contract.netEdgeBps > 0 ? `+${contract.netEdgeBps} bps (Actionable)` : "Sub-hurdle Noise (0 Capital)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature F: Tender Warning in Modal */}
          {contract.isTenderActive && (
            <div className="p-3.5 rounded-xl border border-[#704044] bg-[#301C1E] text-xs font-mono text-[#E07878] flex items-start gap-2.5">
              <span className="text-base shrink-0">⚠️</span>
              <div>
                <strong className="block text-[#E07878] uppercase tracking-wide">
                  TENDER ACTIVE (Physical Delivery Risk)
                </strong>
                <span className="text-[#C4C7CC]">
                  Contract has {contract.daysToExpiry} days to expiry (≤ 5d MCX staggered tender delivery window). Positions entering this window risk physical bullion delivery or cash penalty liquidation.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Verdict Badge in Footer */}
        <div className="mt-5 pt-4 border-t border-[#25292E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9299A3]">Execution Verdict:</span>
            <span
              className={`px-3 py-1 rounded text-xs font-mono font-semibold border ${
                contract.verdict === "CHEAP / LONG"
                  ? "bg-[#142A23] text-[#48B58A] border-[#285D49]"
                  : contract.verdict === "EXPENSIVE / SHORT"
                  ? "bg-[#301C1E] text-[#E07878] border-[#704044]"
                  : "bg-[#222831] text-[#C4C7CC] border-[#414750]"
              }`}
            >
              {contract.verdict}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#111316] hover:bg-[#24282D] text-xs font-mono font-medium text-[#F2F0EA] border border-[#292D32] hover:border-[#8995A3] transition-colors cursor-pointer"
          >
            Dismiss Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
