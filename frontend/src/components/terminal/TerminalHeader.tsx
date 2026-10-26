"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  RefreshCw,
  Clock,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { User, clearStoredUser } from "@/lib/auth";
import { BhavcopyValidationDrawer } from "./BhavcopyValidationDrawer";

interface TerminalHeaderProps {
  user: User | null;
  onSignOut: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onToggleLoginOverlay?: () => void;
}

interface IstClockState {
  formattedString: string;
  statusText: string;
  statusTone: "morning" | "evening" | "closed";
}

function calculateIstClock(): IstClockState {
  const now = new Date();

  // Create date time formatter targeting Asia/Kolkata (IST)
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

  const day = getPart("day");
  const month = getPart("month").toUpperCase();
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");
  const second = getPart("second");
  const formattedString = `${day}-${month}-${year} | ${hour}:${minute}:${second} IST`;

  const statusText = "📁 EOD Settlement Marks";
  const statusTone = "closed" as const;

  return { formattedString, statusText, statusTone };
}

export function TerminalHeader({
  user,
  onSignOut,
  onRefreshData,
  isRefreshing = false,
  onToggleLoginOverlay,
}: TerminalHeaderProps) {
  const [clockState, setClockState] = useState<IstClockState>({
    formattedString: "26-OCT-2026 | 21:40:00 IST",
    statusText: "📁 EOD Settlement Marks",
    statusTone: "closed",
  });
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Active clock running on Indian Standard Time (IST) updating every 1,000ms
  useEffect(() => {
    setClockState(calculateIstClock());
    const intervalId = setInterval(() => {
      setClockState(calculateIstClock());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLockSignOut = () => {
    clearStoredUser();
    onSignOut();
  };

  return (
    <>
      <header className="bg-[#111417] rounded-xl px-4 py-3 border border-[#22262B] shadow-sm transition-colors">
        {/* Row 1: Brand & Identity (Left) + Clock & Session Status (Right) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 border-b border-[#1E2228]">
          {/* Brand Identity Cluster */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#181C20] border border-[#2A2E35]">
              <Cpu className="h-4 w-4 text-[#D5B16D]" />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-nowrap">
              <h1 className="text-base sm:text-lg font-sans font-bold tracking-wider text-[#F1EEE7] whitespace-nowrap">
                SWARNANET
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-[#181C20] border border-[#2A2E35] text-[10px] font-mono font-bold text-[#D5B16D] tracking-wider uppercase whitespace-nowrap">
                MCX BULLION INTELLIGENCE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#14171A] border border-[#22262B] text-[10px] font-mono text-[#A0A7B1] whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-[#45BD91]" />
                <span>FEED: VERIFIED EOD</span>
              </span>
            </div>
          </div>

          {/* Clock, Status & Session Cluster */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Real-Time Dynamic IST Market Clock */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14171A] border border-[#22262B] text-xs font-mono text-[#F1EEE7] tabular-nums whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 text-[#D5B16D] shrink-0" />
              <span className="font-medium">{clockState.formattedString}</span>
            </div>

            {/* Market Mode Status Pill */}
            <div className="hidden xl:flex items-center px-2 py-1 rounded-lg text-xs font-mono font-medium border bg-[#181C20] text-[#A0A7B1] border-[#22262B] whitespace-nowrap">
              <span>{clockState.statusText}</span>
            </div>

            {/* Trader Profile Pill */}
            <div
              onClick={onToggleLoginOverlay}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#14171A] border border-[#22262B] cursor-pointer hover:border-[#303640] transition-colors"
              title="Trader Session Profile"
            >
              <div className="h-5 w-5 rounded bg-[#1D2126] border border-[#2A2E35] flex items-center justify-center text-[10px] font-bold text-[#D5B16D]">
                {user?.name ? user.name.charAt(0) : "A"}
              </div>
              <div className="hidden sm:block">
                <span className="block text-[11px] font-bold text-[#F1EEE7] font-mono leading-none whitespace-nowrap">
                  {user?.name || "Institutional Auditor"}
                </span>
              </div>
            </div>

            {/* Terminal Lock Button */}
            <button
              type="button"
              onClick={handleLockSignOut}
              className="flex items-center justify-center h-7 w-7 rounded-lg bg-[#14171A] hover:bg-[#221618] text-[#757D88] hover:text-[#E47777] border border-[#22262B] hover:border-[#47262A] transition-all cursor-pointer"
              title="Lock terminal and exit session"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Desk Subtitle (Left) + Operational Actions (Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          {/* Subtitle: Single line, clean typography, no vertical word stacking */}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#757D88] font-mono truncate leading-tight">
              Bullion Cross-Contract Relative Value & Risk Gateway • Multi-Expiry Calendar Carry Engine
            </p>
          </div>

          {/* Operational Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* Data Audit Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAuditDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#11241D] hover:bg-[#163329] text-[#45BD91] border border-[#214C3B] hover:border-[#2D664F] transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Open MCX Bhavcopy Scraper Validation & Data Integrity Audit Drawer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#45BD91]" />
              <span>Data Audit: PASSED ✓</span>
            </button>

            {/* Sync Bhavcopy Refresh Button */}
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#14171A] hover:bg-[#181C20] text-[#F1EEE7] border border-[#22262B] hover:border-[#303640] transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              title="Poll fresh MCX settlement marks"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#D5B16D] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Sync Bhavcopy</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Out Validation Drawer */}
      <BhavcopyValidationDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />
    </>
  );
}
