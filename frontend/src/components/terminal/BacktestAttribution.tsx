"use client";

import React, { useState, useMemo } from "react";
import {
  Sliders,
  Activity,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BacktestParams } from "@/types/terminal";
import { runWalkForwardBacktest } from "@/lib/swarnanetEngine";

interface BacktestAttributionProps {
  onParamsChange?: (params: BacktestParams) => void;
}

export function BacktestAttribution({ onParamsChange }: BacktestAttributionProps) {
  const [params, setParams] = useState<BacktestParams>({
    slippageDepthBps: 5, // 0.05%
    roundTripFrictionBps: 14, // 14 bps
    entryZScore: 1.8,
    exitZScore: 0.4,
    capitalAllocatedLakhs: 50,
  });

  const { attribution, equityCurve } = useMemo(() => {
    return runWalkForwardBacktest(params);
  }, [params]);

  const handleSliderChange = (key: keyof BacktestParams, val: number) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    if (onParamsChange) onParamsChange(updated);
  };

  const handleResetDefaults = () => {
    const defaults: BacktestParams = {
      slippageDepthBps: 5,
      roundTripFrictionBps: 14,
      entryZScore: 1.8,
      exitZScore: 0.4,
      capitalAllocatedLakhs: 50,
    };
    setParams(defaults);
    if (onParamsChange) onParamsChange(defaults);
  };

  return (
    <div className="bg-[#111417] border border-[#22262B] rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#22262B]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-mono tracking-wider text-[#F1EEE7] uppercase">
              Walk-Forward Backtester & Attribution Engine
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#181C20] border border-[#2A2E35] text-[10px] font-mono font-medium text-[#D5B16D]">
              252-Day Out-of-Sample
            </span>
          </div>
          <p className="text-xs text-[#757D88] font-mono mt-0.5">
            Real-time sensitivity analysis decomposing Alpha vs Beta vs Friction Drag
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14171A] hover:bg-[#181C20] text-xs font-mono text-[#F1EEE7] border border-[#22262B] hover:border-[#303640] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="h-3 w-3 text-[#D5B16D]" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Discipline Warning Banner (Triggered when After-Cost Sharpe < 0.20) */}
      {attribution.isDisciplineViolation && (
        <div className="mb-4 p-3.5 rounded-xl border border-[#47262A] bg-[#1C1618]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-[#E47777] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#E47777] tracking-wider uppercase">
                  Execution Hurdle Exceeds Theoretical Edge
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E47777]/15 text-[#E47777] border border-[#E47777]/30">
                  DISCIPLINE VIOLATION
                </span>
              </div>
              <p className="text-xs font-mono text-[#A0A7B1]">
                Edge does not survive real-world execution friction. After-cost annualized Sharpe ratio ({attribution.sharpeRatio.toFixed(2)}) is below the institutional hurdle of 0.20.
              </p>
              <p className="text-[11px] font-mono text-[#E47777] font-semibold pt-0.5">
                Risk-Gate Decision: Model enforces zero capital deployment. Position sizing locked to protect capital.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Parameter Sliders + Performance Attribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Interactive Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 p-3.5 rounded-xl border border-[#22262B] bg-[#14171A] font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#22262B]">
            <span className="font-semibold text-[#F1EEE7] flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-[#D5B16D]" />
              <span>Execution Parameter Sliders</span>
            </span>
            <span className="text-[10px] text-[#757D88]">Live Recalculation</span>
          </div>

          {/* Slider 1: Slippage Depth Penalty */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#A0A7B1]">Slippage Depth Penalty:</label>
              <span className="font-semibold text-[#D5B16D]">
                {(params.slippageDepthBps / 100).toFixed(2)}% ({params.slippageDepthBps} bps)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={params.slippageDepthBps}
              onChange={(e) => handleSliderChange("slippageDepthBps", Number(e.target.value))}
              className="w-full h-1.5 bg-[#0F1215] rounded-lg appearance-none cursor-pointer accent-[#D5B16D]"
            />
            <div className="flex justify-between text-[10px] text-[#757D88] mt-0.5">
              <span>0.01% (Mini liquid)</span>
              <span>0.25% (Thin Petal)</span>
            </div>
          </div>

          {/* Slider 2: Round-Trip Brokerage & STT/CTT Friction */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#A0A7B1]">Round-Trip STT & Fee Hurdle:</label>
              <span className="font-semibold text-[#D5B16D]">
                {params.roundTripFrictionBps} bps
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={params.roundTripFrictionBps}
              onChange={(e) => handleSliderChange("roundTripFrictionBps", Number(e.target.value))}
              className="w-full h-1.5 bg-[#0F1215] rounded-lg appearance-none cursor-pointer accent-[#D5B16D]"
            />
            <div className="flex justify-between text-[10px] text-[#757D88] mt-0.5">
              <span>5 bps (DMA Tier)</span>
              <span>25 bps (Retail broker)</span>
            </div>
          </div>

          {/* Slider 3: Entry Z-Score Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#A0A7B1]">Entry Threshold (Z-Score):</label>
              <span className="font-semibold text-[#F1EEE7]">
                ±{params.entryZScore.toFixed(1)}σ
              </span>
            </div>
            <input
              type="range"
              min={1.2}
              max={2.8}
              step={0.1}
              value={params.entryZScore}
              onChange={(e) => handleSliderChange("entryZScore", Number(e.target.value))}
              className="w-full h-1.5 bg-[#0F1215] rounded-lg appearance-none cursor-pointer accent-[#D5B16D]"
            />
            <div className="flex justify-between text-[10px] text-[#757D88] mt-0.5">
              <span>±1.2σ (Frequent)</span>
              <span>±2.8σ (Rare High Alpha)</span>
            </div>
          </div>

          {/* Summary Friction Hurdle */}
          <div className="pt-2 border-t border-[#22262B] flex items-center justify-between text-[11px]">
            <span className="text-[#757D88]">Combined Friction Barrier:</span>
            <span className="font-semibold text-[#F1EEE7]">
              {(params.roundTripFrictionBps + params.slippageDepthBps * 2).toFixed(1)} bps
            </span>
          </div>
        </div>

        {/* Attribution Decomposition Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-3.5 rounded-xl border border-[#22262B] bg-[#14171A] font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#22262B]">
            <span className="font-semibold text-[#F1EEE7] flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#D5B16D]" />
              <span>P&L Attribution & Risk Metrics</span>
            </span>
            <span className="text-[10px] text-[#45BD91] font-semibold">Out-Of-Sample Audited</span>
          </div>

          {/* Attribution Bars */}
          <div className="grid grid-cols-3 gap-2.5 my-3">
            <div className="p-3 rounded-lg bg-[#111417] border border-[#22262B]">
              <span className="text-[10px] text-[#757D88] block uppercase">Strategy Alpha</span>
              <span className={`text-base font-bold tabular-nums ${attribution.strategyAlphaPct >= 0 ? "text-[#45BD91]" : "text-[#E47777]"}`}>
                {attribution.strategyAlphaPct >= 0 ? "+" : ""}{attribution.strategyAlphaPct}%
              </span>
              <span className="text-[9px] text-[#757D88] block mt-0.5">Basis Convergence</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111417] border border-[#22262B]">
              <span className="text-[10px] text-[#757D88] block uppercase">Gold Beta Drift</span>
              <span className="text-base font-bold text-[#F1EEE7] tabular-nums">
                +{attribution.goldBenchmarkBetaPct}%
              </span>
              <span className="text-[9px] text-[#757D88] block mt-0.5">MCX Benchmark</span>
            </div>

            <div className="p-3 rounded-lg bg-[#111417] border border-[#22262B]">
              <span className="text-[10px] text-[#757D88] block uppercase">Friction Drag</span>
              <span className="text-base font-bold text-[#E47777] tabular-nums">
                -{attribution.frictionDragPct}%
              </span>
              <span className="text-[9px] text-[#757D88] block mt-0.5">STT + Slippage</span>
            </div>
          </div>

          {/* Quant Metric Cards */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#22262B] text-center">
            <div className="p-2 rounded bg-[#111417] border border-[#22262B]">
              <span className="text-[9px] text-[#757D88] block uppercase">Sharpe Ratio</span>
              <span className={`text-sm font-bold ${attribution.sharpeRatio >= 0.20 ? "text-[#45BD91]" : "text-[#E47777]"}`}>
                {attribution.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="p-2 rounded bg-[#111417] border border-[#22262B]">
              <span className="text-[9px] text-[#757D88] block uppercase">Sortino</span>
              <span className="text-sm font-bold text-[#A0A7B1]">
                {attribution.sortinoRatio.toFixed(2)}
              </span>
            </div>
            <div className="p-2 rounded bg-[#111417] border border-[#22262B]">
              <span className="text-[9px] text-[#757D88] block uppercase">Max DD</span>
              <span className="text-sm font-bold text-[#E47777]">
                -{attribution.maxDrawdownPct}%
              </span>
            </div>
            <div className="p-2 rounded bg-[#111417] border border-[#22262B]">
              <span className="text-[9px] text-[#757D88] block uppercase">Win Rate</span>
              <span className="text-sm font-bold text-[#F1EEE7]">
                {attribution.winRatePct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Strategy Equity Curve vs Benchmark */}
      <div className="pt-4 border-t border-[#25292E]">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-[#F2F0EA] font-semibold">
            Cumulative Strategy Equity vs MCX Gold Buy & Hold
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#48B58A]">
              <span className="h-2 w-2 rounded-full bg-[#48B58A]" />
              <span>Swarnanet Strategy (Net)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#AEB4BD]">
              <span className="h-2 w-2 rounded-full bg-[#AEB4BD]" />
              <span>Benchmark Gold Buy & Hold</span>
            </span>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#25292E" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#34383D"
                tick={{ fill: "#9299A3", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "#25292E" }}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                stroke="#34383D"
                tick={{ fill: "#9299A3", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "#25292E" }}
                tickFormatter={(v) => `${v.toFixed(0)}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-[#34383D] bg-[#181A1D] p-2.5 text-xs font-mono text-[#F2F0EA] shadow-xl">
                        <div className="font-semibold text-[#9299A3] mb-1">{label}</div>
                        <div className="text-[#48B58A]">
                          Strategy Equity: {Number(payload[0]?.value).toFixed(2)}
                        </div>
                        <div className="text-[#AEB4BD]">
                          Benchmark Gold: {Number(payload[1]?.value).toFixed(2)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="strategyEquity"
                stroke="#48B58A"
                strokeWidth={2}
                dot={false}
                name="Strategy Equity"
              />
              <Line
                type="monotone"
                dataKey="benchmarkGold"
                stroke="#AEB4BD"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Benchmark Gold"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
