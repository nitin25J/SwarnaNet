"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { TermStructurePoint } from "@/types/terminal";

interface TermStructureChartProps {
  data: TermStructurePoint[];
}

export function TermStructureChart({ data }: TermStructureChartProps) {
  const [curveMode, setCurveMode] = useState<"raw" | "rollDown">("raw");

  // Format custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TermStructurePoint }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="rounded-lg border border-[#34383D] bg-[#181A1D] p-3 shadow-xl text-xs font-mono text-[#F2F0EA]">
          <div className="font-semibold text-[#D6D0C4] border-b border-[#25292E] pb-1.5 mb-2">
            {p.symbol} • Expiry {label} ({p.daysToExpiry} days)
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-4">
              <span className="text-[#9299A3]">Raw Settlement PPG:</span>
              <span className="font-semibold text-[#F2F0EA] tabular-nums">₹{p.rawPpg.toFixed(2)}/g</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#9299A3]">Roll-Down Adjusted:</span>
              <span className="font-semibold text-[#AEB4BD] tabular-nums">₹{p.rollDownAdjustedPpg.toFixed(2)}/g</span>
            </div>
            <div className="flex justify-between gap-4 pt-1.5 border-t border-[#25292E]">
              <span className="text-[#9299A3]">Annualized Carry Rate:</span>
              <span className="font-semibold text-[#48B58A] tabular-nums">+{p.carryYieldAnnualizedPct}% Contango</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const nearPpg = data[0]?.rawPpg || 7351;
  const farPpg = data[data.length - 1]?.rawPpg || 7452;
  const totalDays = data[data.length - 1]?.daysToExpiry || 108;
  const annualizedContango = Number((((farPpg - nearPpg) / nearPpg) * (365 / totalDays) * 100).toFixed(2));

  return (
    <div className="bg-[#111417] border border-[#22262B] rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#22262B]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold font-mono tracking-wider text-[#F1EEE7] uppercase">
              Term Structure & Carry Curve
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#181C20] border border-[#2A2E35] text-[10px] font-mono font-medium text-[#D5B16D]">
              Discrete Expiries
            </span>
          </div>
          <p className="text-xs text-[#757D88] font-mono mt-0.5">
            Normalized Price Per Pure Gram (₹/g) plotted against discrete delivery cycles
          </p>
        </div>

        {/* Dynamic Annualized Carry Rate Indicator & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Annualized Contango Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11241D] border border-[#214C3B] text-xs font-mono font-medium text-[#45BD91]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{annualizedContango}% Annualized Contango</span>
          </div>

          {/* Raw vs Roll-Down Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-[#22262B] bg-[#0F1215] p-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => setCurveMode("raw")}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                curveMode === "raw"
                  ? "bg-[#D5B16D] text-[#0D0F11] font-bold"
                  : "text-[#A0A7B1] hover:text-[#F1EEE7] hover:bg-[#181C20]"
              }`}
            >
              Raw Settlement
            </button>
            <button
              type="button"
              onClick={() => setCurveMode("rollDown")}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                curveMode === "rollDown"
                  ? "bg-[#D5B16D] text-[#0D0F11] font-bold"
                  : "text-[#A0A7B1] hover:text-[#F1EEE7] hover:bg-[#181C20]"
              }`}
            >
              Roll-Down Adjusted
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D5B16D" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#D5B16D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A0A7B1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A0A7B1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1D2126" vertical={false} />
            <XAxis
              dataKey="expiryDate"
              stroke="#22262B"
              tick={{ fill: "#757D88", fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#22262B" }}
            />
            <YAxis
              domain={["dataMin - 15", "dataMax + 15"]}
              stroke="#22262B"
              tick={{ fill: "#757D88", fontSize: 11, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#22262B" }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={curveMode === "raw" ? "rawPpg" : "rollDownAdjustedPpg"}
              stroke={curveMode === "raw" ? "#D5B16D" : "#A0A7B1"}
              strokeWidth={2}
              fillOpacity={1}
              fill={curveMode === "raw" ? "url(#goldGradient)" : "url(#slateGradient)"}
              name={curveMode === "raw" ? "Raw Settlement PPG" : "Roll-Down Adjusted PPG"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Curve Interpretation Explainer */}
      <div className="mt-3 pt-3 border-t border-[#22262B] grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-[#757D88]">
        <div className="flex items-start gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D5B16D] mt-1 shrink-0" />
          <span>
            <strong className="text-[#F1EEE7]">Raw Settlement Curve:</strong> Nominal MCX settlement price per pure gram including calendar carrying costs (financing & vaulting storage).
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="h-2 w-2 rounded-full bg-[#A0A7B1] mt-1 shrink-0" />
          <span>
            <strong className="text-[#F1EEE7]">Roll-Down Adjusted Curve:</strong> Strips out the +5.25% annualized contango carry rate to isolate true structural cross-contract basis mispricings.
          </span>
        </div>
      </div>
    </div>
  );
}
