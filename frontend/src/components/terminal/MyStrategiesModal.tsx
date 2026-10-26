"use client";

import React, { useState } from "react";
import { X, Check, Folder, Play } from "lucide-react";
import { BacktestParams } from "@/types/terminal";

interface StrategyPreset {
  id: string;
  name: string;
  tagline: string;
  category: "Scalping" | "Statistical Arb" | "Institutional" | "DMA";
  params: BacktestParams;
  historicalSharpe: number;
  winRate: string;
  annualizedRoi: string;
  description: string;
}

const DEFAULT_PRESETS: StrategyPreset[] = [
  {
    id: "conservative-arb",
    name: "Conservative Multi-Expiry Arb",
    tagline: "High-conviction cross-contract disparity with carry filter",
    category: "Statistical Arb",
    params: {
      slippageDepthBps: 5,
      roundTripFrictionBps: 14,
      entryZScore: 1.8,
      exitZScore: 0.4,
      capitalAllocatedLakhs: 50,
    },
    historicalSharpe: 2.34,
    winRate: "78.4%",
    annualizedRoi: "18.6%",
    description: "Filters out sub-hurdle multi-expiry noise using 5.25% annualized carry deduction. Trades only when net edge > 14 bps.",
  },
  {
    id: "aggressive-scalp",
    name: "Aggressive Intraday Scalp",
    tagline: "Fast mean-reversion on high-frequency GOLDM / GOLDTEN mispricing",
    category: "Scalping",
    params: {
      slippageDepthBps: 3,
      roundTripFrictionBps: 9,
      entryZScore: 1.3,
      exitZScore: 0.2,
      capitalAllocatedLakhs: 100,
    },
    historicalSharpe: 1.88,
    winRate: "69.1%",
    annualizedRoi: "24.2%",
    description: "Lower entry hurdle for rapid order turnaround. Tight exit threshold to capture transient microsecond basis dislocations.",
  },
  {
    id: "zero-slippage-dma",
    name: "Direct Market Access (DMA) Co-Location",
    tagline: "Institutional low-friction execution at MCX data center",
    category: "DMA",
    params: {
      slippageDepthBps: 1,
      roundTripFrictionBps: 6,
      entryZScore: 1.5,
      exitZScore: 0.3,
      capitalAllocatedLakhs: 250,
    },
    historicalSharpe: 3.12,
    winRate: "84.2%",
    annualizedRoi: "31.5%",
    description: "Assumes membership-tier transaction rates and co-located low-slippage fills. Exploits tender window cash basis.",
  },
  {
    id: "cash-carry-fund",
    name: "Cash-and-Carry Basis Fund",
    tagline: "Quarterly gold basis capture against physical gold bar tender",
    category: "Institutional",
    params: {
      slippageDepthBps: 7,
      roundTripFrictionBps: 18,
      entryZScore: 2.2,
      exitZScore: 0.5,
      capitalAllocatedLakhs: 500,
    },
    historicalSharpe: 2.65,
    winRate: "89.0%",
    annualizedRoi: "14.8%",
    description: "Institutional strategy that captures positive contango carry while hedging physical inventory in MCX vault-approved depositories.",
  },
];

interface MyStrategiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: BacktestParams;
  onApplyParams: (params: BacktestParams) => void;
}

export function MyStrategiesModal({
  isOpen,
  onClose,
  currentParams,
  onApplyParams,
}: MyStrategiesModalProps) {
  const [selectedId, setSelectedId] = useState<string>("conservative-arb");
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = (preset: StrategyPreset) => {
    setSelectedId(preset.id);
    onApplyParams(preset.params);
    setAppliedToast(`Applied "${preset.name}" into terminal state!`);
    setTimeout(() => {
      setAppliedToast(null);
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101113]/85 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl bg-[#181A1D] border border-[#34383D] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#25292E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#222831] border border-[#34383D] text-[#D6D0C4]">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-sans font-semibold text-[#F2F0EA]">Strategy Presets & Configurations</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#222831] text-[#AEB4BD] border border-[#34383D] uppercase">
                  Institutional
                </span>
              </div>
              <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                Load calibrated parameter sets into the Backtest & Friction Execution engine
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

        {/* Toast confirmation */}
        {appliedToast && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#142A23] border border-[#285D49] text-[#48B58A] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#48B58A]" />
              <span>{appliedToast}</span>
            </div>
            <span className="text-[10px] text-[#48B58A] font-bold uppercase">LIVE SYNCED</span>
          </div>
        )}

        {/* Presets List */}
        <div className="mt-4 space-y-3 overflow-y-auto pr-1 flex-1">
          {DEFAULT_PRESETS.map((preset) => {
            const isSelected = selectedId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#24282D] border-[#8995A3]"
                    : "bg-[#1C1F22] border-[#292D32] hover:border-[#34383D] hover:bg-[#222529]"
                }`}
                onClick={() => setSelectedId(preset.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-sans font-semibold text-[#F2F0EA]">{preset.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141619] text-[#AEB4BD] border border-[#25292E]">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#9299A3] font-mono mt-1">{preset.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(preset);
                    }}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#D6D0C4] text-[#17191C] hover:bg-[#E5E0D6]"
                        : "bg-[#111316] text-[#F2F0EA] hover:bg-[#24282D] border border-[#292D32]"
                    }`}
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Apply Preset</span>
                  </button>
                </div>

                {/* Quantitative Parameters & Historical Metrics */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-[#25292E] text-xs font-mono">
                  <div className="p-2 rounded bg-[#141619] border border-[#25292E]">
                    <span className="text-[10px] text-[#686F79] block">SLIPPAGE</span>
                    <span className="text-[#AEB4BD] font-semibold">{preset.params.slippageDepthBps} bps</span>
                  </div>
                  <div className="p-2 rounded bg-[#141619] border border-[#25292E]">
                    <span className="text-[10px] text-[#686F79] block">HURDLE</span>
                    <span className="text-[#F2F0EA] font-semibold">{preset.params.roundTripFrictionBps} bps</span>
                  </div>
                  <div className="p-2 rounded bg-[#141619] border border-[#25292E]">
                    <span className="text-[10px] text-[#686F79] block">ENTRY Z</span>
                    <span className="text-[#D6D0C4] font-semibold">±{preset.params.entryZScore}σ</span>
                  </div>
                  <div className="p-2 rounded bg-[#141619] border border-[#25292E]">
                    <span className="text-[10px] text-[#686F79] block">SHARPE</span>
                    <span className="text-[#48B58A] font-semibold">{preset.historicalSharpe}</span>
                  </div>
                  <div className="p-2 rounded bg-[#141619] border border-[#25292E]">
                    <span className="text-[10px] text-[#686F79] block">WIN RATE</span>
                    <span className="text-[#48B58A] font-semibold">{preset.winRate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#25292E] flex items-center justify-between text-xs font-mono text-[#686F79]">
          <span>Active Strategy Allocation: ₹{currentParams.capitalAllocatedLakhs} Lakhs</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#111316] text-[#F2F0EA] hover:bg-[#24282D] text-xs font-mono font-medium border border-[#292D32] hover:border-[#8995A3] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
