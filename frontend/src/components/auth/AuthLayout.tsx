"use client";

import React, { ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [hideOverlay, setHideOverlay] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-x-hidden text-[#F1EEE7] selection:bg-[#D8D0C0] selection:text-[#17191B]">
      {/* High-Resolution Trading Floor Background Image (Photo 2) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-[1.01]"
        style={{ backgroundImage: "url('/auth-bg.jpg')" }}
        aria-hidden="true"
      />

      {/* Atmospheric Dark Trading Floor Gradient Overlay matching Photo 1 */}
      <div
        className="fixed inset-0 z-0 bg-gradient-to-b from-[#050B13]/70 via-[#040910]/78 to-[#03060B]/88 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Right "Hide Overlay" / "Show Overlay" Button matching Photo 1 */}
      <button
        type="button"
        onClick={() => setHideOverlay((prev) => !prev)}
        className="fixed top-5 right-5 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0F141C]/80 hover:bg-[#1A222E]/90 backdrop-blur-md border border-white/15 text-xs font-sans text-[#C5CAD2] hover:text-white transition-all shadow-xl cursor-pointer"
        aria-label={hideOverlay ? "Show login card overlay" : "Hide login card overlay"}
      >
        {hideOverlay ? (
          <EyeOff className="h-3.5 w-3.5 text-[#D5B16D]" aria-hidden="true" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-[#C5CAD2]" aria-hidden="true" />
        )}
        <span>{hideOverlay ? "Show Overlay" : "Hide Overlay"}</span>
      </button>

      {/* Bottom Left "N" Brand Pill Badge matching Photo 1 */}
      <div className="fixed bottom-5 left-5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 border border-white/20 text-xs font-mono font-bold text-white shadow-xl select-none">
        N
      </div>

      {/* Centered Authentication Card Container */}
      {!hideOverlay && (
        <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto animate-fade-in">
          <div className="w-full flex items-center justify-center">
            {children}
          </div>
        </main>
      )}

      {/* Subtle Footer Note if overlay is active */}
      {!hideOverlay && (
        <footer className="relative z-10 py-3 text-center text-[10px] font-mono text-[#858D97]/80 select-none">
          <span>SWARNANET MCX DERIVATIVES INTELLIGENCE • INSTITUTIONAL ACCESS ONLY</span>
        </footer>
      )}
    </div>
  );
}
