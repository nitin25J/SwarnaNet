"use client";

import React from "react";
import { Cpu } from "lucide-react";

export function BrandHeader() {
  return (
    <div className="text-center mb-5">
      {/* Golden Microchip Icon matching Photo 1 */}
      <div className="mx-auto inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#1C1712]/90 border border-[#D5B16D]/40 text-[#D5B16D] shadow-[0_0_14px_rgba(213,177,109,0.18)] mb-2.5">
        <Cpu className="h-5 w-5 text-[#D5B16D]" aria-hidden="true" />
      </div>

      {/* Main Heading SWARNANET */}
      <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-[0.08em] text-[#F1EEE7]">
        SWARNANET
      </h1>

      {/* Glowing Gold Subtitle */}
      <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.16em] text-[#D5B16D] mt-1">
        INSTITUTIONAL DERIVATIVES INTELLIGENCE
      </p>

      {/* Supporting Description */}
      <p className="text-xs text-[#858D97] mt-1 leading-relaxed">
        MCX Bullion Cross-Contract Relative Value & Risk Gateway
      </p>
    </div>
  );
}
