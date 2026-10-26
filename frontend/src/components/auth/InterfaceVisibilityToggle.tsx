"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface InterfaceVisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function InterfaceVisibilityToggle({
  isVisible,
  onToggle,
}: InterfaceVisibilityToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[1000]">
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        id="interface-visibility-toggle"
        aria-label={
          isVisible
            ? "Hide authentication interface overlay"
            : "Show authentication interface overlay"
        }
        aria-expanded={isVisible}
        title={isVisible ? "Hide Overlay (H)" : "Show Login Panel (H)"}
        className="group relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 ease-out cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#E5A93C] focus:ring-offset-2 focus:ring-offset-[#090D16]"
        style={{
          background: isVisible
            ? "rgba(14, 23, 38, 0.85)"
            : "rgba(16, 185, 129, 0.15)",
          border: isVisible
            ? "1px solid rgba(229, 169, 60, 0.35)"
            : "1px solid rgba(16, 185, 129, 0.5)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: isVisible
            ? "0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(229, 169, 60, 0.15)"
            : "0 0 24px rgba(16, 185, 129, 0.3)",
        }}
      >
        {isVisible ? (
          <>
            <Eye
              className="h-4 w-4 text-[#E5A93C] transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="text-[#E5EAF3] font-medium hidden sm:inline group-hover:text-[#E5A93C] transition-colors">
              Hide Overlay
            </span>
          </>
        ) : (
          <>
            <EyeOff
              className="h-4 w-4 text-[#10B981] transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="text-[#10B981] font-semibold hidden sm:inline group-hover:text-emerald-300 transition-colors">
              Show Login Panel
            </span>
          </>
        )}

        {/* Ambient Ring Glow */}
        <span
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 ring-1 ring-[#E5A93C]/40"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
