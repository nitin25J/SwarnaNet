"use client";

import React from "react";
import { Compass, ArrowRight } from "lucide-react";
import { BrandHeader } from "./BrandHeader";
import { TraderAuthenticationForm } from "./TraderAuthenticationForm";
import { enterGuestAnalyticalMode } from "@/lib/auth";

interface SignInCardProps {
  onLoginSuccess?: () => void;
}

export function SignInCard({ onLoginSuccess }: SignInCardProps) {
  const handleExploreDemo = () => {
    enterGuestAnalyticalMode();
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      {/* Institutional Obsidian Glass Card */}
      <div className="bg-[#111417]/95 backdrop-blur-xl border border-[#22262B] rounded-2xl p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.85)] transition-all">
        {/* Header Section */}
        <BrandHeader />

        {/* Prominent Judge & Evaluator Instant Access */}
        <div className="mb-5 p-4 rounded-xl bg-[#14171A] border border-[#303640] relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D5B16D] font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#45BD91]" />
              Judge / Evaluator Access
            </span>
            <span className="text-[10px] font-mono text-[#A0A7B1] bg-[#181C20] px-2 py-0.5 rounded border border-[#22262B]">
              No Login Required
            </span>
          </div>
          <p className="text-xs text-[#A0A7B1] mb-3 leading-relaxed">
            Instant read-only terminal access to all verified MCX bullion relative value analytics, carry curves, and backtest results.
          </p>
          <button
            type="button"
            onClick={handleExploreDemo}
            className="w-full py-2.5 px-4 rounded-lg bg-[#D5B16D] hover:bg-[#E2C07D] text-[#0D0F11] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_16px_rgba(213,177,109,0.2)] active:scale-[0.99]"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Demo (Institutional Terminal)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Subtle Separator */}
        <div className="relative flex py-2 items-center mb-3">
          <div className="flex-grow border-t border-[#22262B]" />
          <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-wider text-[#757D88]">
            Or Authenticate Trader Account
          </span>
          <div className="flex-grow border-t border-[#22262B]" />
        </div>

        {/* Trader Authentication Form */}
        <TraderAuthenticationForm onSuccess={onLoginSuccess} />
      </div>
    </div>
  );
}
