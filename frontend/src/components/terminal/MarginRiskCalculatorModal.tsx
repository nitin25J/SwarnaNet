"use client";

import React, { useState } from "react";
import { X, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { McxContract } from "@/types/terminal";

interface MarginRiskCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: McxContract[];
}

export function MarginRiskCalculatorModal({
  isOpen,
  onClose,
  contracts,
}: MarginRiskCalculatorModalProps) {
  // Default to the contract in tender period or first contract
  const tenderContract = contracts.find((c) => c.isTenderActive) || contracts[0];
  const [selectedSymbol, setSelectedSymbol] = useState<string>(tenderContract?.symbol || "GOLDM");
  const [lots, setLots] = useState<number>(5);

  if (!isOpen) return null;

  const currentContract = contracts.find((c) => c.symbol === selectedSymbol) || contracts[0];
  const quotePrice = currentContract ? currentContract.settlementPrice : 78450;
  const quoteUnitGrams = currentContract ? currentContract.quotationBaseGrams : 10;
  const lotSizeGrams = currentContract ? (currentContract.symbol === "GOLDM" ? 100 : currentContract.symbol === "GOLDTEN" ? 10 : currentContract.symbol === "GOLDGUINEA" ? 8 : 1) : 100;

  // Notional value calculation
  const pricePerGram = quotePrice / quoteUnitGrams;
  const lotNotional = pricePerGram * lotSizeGrams;
  const totalPositionNotional = lotNotional * lots;

  // Normal Span + Exposure Margin (10%)
  const standardMarginPct = 0.10;
  const standardMarginAmt = totalPositionNotional * standardMarginPct;

  // Tender Period Staggered Margin Calculation
  // MCX Tender period is last 5 trading days:
  // Day 1: 5%, Day 2: 10%, Day 3: 15%, Day 4: 20%, Day 5: 25%
  const daysLeft = currentContract ? currentContract.daysToExpiry : 16;
  const isTender = daysLeft <= 5;
  const tenderDaysElapsed = isTender ? Math.max(1, 6 - daysLeft) : 0;
  const tenderMarginPct = isTender ? tenderDaysElapsed * 0.05 : 0;
  const tenderMarginAmt = totalPositionNotional * tenderMarginPct;

  const totalRequiredCashMargin = standardMarginAmt + tenderMarginAmt;
  const physicalDeliveryDefaultPenalty = totalPositionNotional * 0.04; // 4% penalty

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101113]/85 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-[#181A1D] border border-[#34383D] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#25292E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#301C1E] border border-[#704044] text-[#E07878]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-sans font-semibold text-[#F2F0EA]">Physical Delivery Tender Risk & Margin Calculator</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#301C1E] text-[#E07878] border border-[#704044] uppercase">
                  SEBI / MCX NORMS
                </span>
              </div>
              <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                Staggered tender margin escalation ladder and physical delivery penalty estimator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111316] text-[#9299A3] hover:text-[#F2F0EA] hover:bg-[#24282D] transition-colors border border-[#292D32]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Contract Selector & Lots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#141619] border border-[#292D32]">
              <label className="text-[11px] font-mono text-[#686F79] uppercase block mb-1.5 font-semibold">
                Select Bullion Contract:
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#111316] border border-[#292D32] text-xs font-mono text-[#F2F0EA] focus:border-[#8995A3] focus:outline-none"
              >
                {contracts.map((c) => (
                  <option key={`${c.symbol}-${c.expiryDate}`} value={c.symbol}>
                    {c.symbol} ({c.expiryDate}) {c.isTenderActive ? "⚠️ [TENDER ACTIVE]" : `(${c.daysToExpiry}d left)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141619] border border-[#292D32]">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-[#686F79] uppercase font-semibold">Position Size (Lots):</span>
                <span className="text-[#E6E1D6] font-semibold">{lots} Lots ({lots * lotSizeGrams}g)</span>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={lots}
                onChange={(e) => setLots(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg bg-[#111316] border border-[#292D32] text-xs font-mono text-[#F2F0EA] focus:border-[#8995A3] focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Tender Status Warning Banner */}
          {isTender ? (
            <div className="p-3.5 rounded-xl bg-[#301C1E] border border-[#704044] flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#E07878] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-[#E07878] uppercase tracking-wider">
                  ⚠️ CONTRACT IN STAGGERED TENDER PERIOD ({daysLeft} DAYS TO EXPIRY)
                </h4>
                <p className="text-[11px] font-sans text-[#C4C7CC] mt-1">
                  Staggered tender period is currently ACTIVE. Mandatory physical delivery tender rules apply.
                  MCX mandates an additional 5% daily cash margin step-up. Close out open positions before the tender cut-off
                  to avoid delivery default penalties and vault handling charges.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#142A23] border border-[#285D49] flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#48B58A] shrink-0" />
              <span className="text-xs font-mono text-[#48B58A]">
                Safe Window: Contract has {daysLeft} days to expiry. Initial margin only; zero tender delivery surcharge.
              </span>
            </div>
          )}

          {/* Quantitative Margin Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-[#141619] border border-[#292D32] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#9299A3]">
              <span>Gross Notional Position Value:</span>
              <span className="text-[#F2F0EA] font-semibold tabular-nums">
                ₹{totalPositionNotional.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#9299A3]">
              <span>Standard SPAN + Exposure Margin (10%):</span>
              <span className="text-[#AEB4BD] font-semibold tabular-nums">
                ₹{standardMarginAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#9299A3]">
              <span className="flex items-center gap-1.5">
                <span>Tender Period Staggered Cash Surcharge:</span>
                {isTender && (
                  <span className="px-1.5 py-0.2 rounded bg-[#301C1E] text-[#E07878] border border-[#704044] text-[10px]">
                    Day {tenderDaysElapsed} ({(tenderMarginPct * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
              <span className={`font-semibold tabular-nums ${isTender ? "text-[#E07878]" : "text-[#686F79]"}`}>
                {isTender ? `+₹${tenderMarginAmt.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "₹0 (Safe)"}
              </span>
            </div>

            <div className="pt-2 border-t border-[#25292E] flex items-center justify-between text-sm">
              <span className="font-semibold text-[#F2F0EA]">Total Required Upfront Cash Margin:</span>
              <span className="font-bold text-[#E6E1D6] tabular-nums text-base">
                ₹{totalRequiredCashMargin.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Delivery Default Penalty Box */}
          <div className="p-3 rounded-xl bg-[#301C1E]/40 border border-[#704044] flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[#E07878] font-semibold block">Delivery Default Penalty (4% of value):</span>
              <span className="text-[11px] text-[#686F79]">Levied by clearing corporation if seller fails to tender pure gold</span>
            </div>
            <span className="text-[#E07878] font-bold text-sm tabular-nums">
              ₹{physicalDeliveryDefaultPenalty.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#25292E] flex items-center justify-between text-xs font-mono">
          <span className="text-[#686F79]">Ref: MCX Circular MCX/C&S/084/2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#111316] text-[#F2F0EA] hover:bg-[#24282D] font-medium border border-[#292D32] hover:border-[#8995A3] transition-colors cursor-pointer"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
