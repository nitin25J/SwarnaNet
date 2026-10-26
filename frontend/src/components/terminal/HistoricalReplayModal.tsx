"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";

interface HistoricalReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate?: (date: string) => void;
}

const HISTORICAL_DATES = [
  { date: "20-OCT-2026", label: "Oct 2026 EOD (Current Settlement)", events: 1420, peakDisparity: "38.4 bps", note: "GOLDM tender window kickoff" },
  { date: "15-SEP-2026", label: "Sep 2026 Expiry Rollover", events: 2180, peakDisparity: "49.1 bps", note: "High calendar roll divergence" },
  { date: "12-JUN-2026", label: "Jun 2026 Bullion Surge", events: 1840, peakDisparity: "62.3 bps", note: "US CPI volatility dislocation" },
  { date: "18-MAR-2026", label: "Mar 2026 Rate Decision Spike", events: 1950, peakDisparity: "41.7 bps", note: "Short-term funding rate squeeze" },
  { date: "10-DEC-2025", label: "Dec 2025 GOLDTEN Liquidity Launch", events: 1100, peakDisparity: "74.8 bps", note: "First 10-gram contract settlement" },
  { date: "02-JAN-2025", label: "Jan 2025 New Year Baseline", events: 980, peakDisparity: "28.5 bps", note: "Post-2025 baseline contract reference" },
];

export function HistoricalReplayModal({
  isOpen,
  onClose,
  onSelectDate,
}: HistoricalReplayModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("20-OCT-2026");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(35);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  if (!isOpen) return null;

  const activeDateInfo = HISTORICAL_DATES.find((d) => d.date === selectedDate) || HISTORICAL_DATES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101113]/85 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-[#181A1D] border border-[#34383D] shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#25292E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#222831] border border-[#34383D] text-[#D6D0C4]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-sans font-semibold text-[#F2F0EA]">Historical Order Book & Settlement Replay</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#222831] text-[#AEB4BD] border border-[#34383D] uppercase">
                  POST-2025
                </span>
              </div>
              <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                Reconstruct tick-level relative value disparities across MCX Bullion contracts
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

        {/* Date Selector Grid */}
        <div className="mt-4">
          <label className="text-xs font-mono text-[#686F79] uppercase tracking-wider block mb-2 font-semibold">
            Select Trading Session (Post-2025 GOLDTEN Inception):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HISTORICAL_DATES.map((item) => {
              const isSelected = selectedDate === item.date;
              return (
                <div
                  key={item.date}
                  onClick={() => {
                    setSelectedDate(item.date);
                    if (onSelectDate) onSelectDate(item.date);
                  }}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#24282D] border-[#8995A3]"
                      : "bg-[#1C1F22] border-[#292D32] hover:border-[#34383D] hover:bg-[#222529]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#F2F0EA]">{item.date}</span>
                    <span className="text-[10px] font-mono text-[#AEB4BD] bg-[#141619] px-1.5 py-0.5 rounded border border-[#25292E]">
                      Peak: {item.peakDisparity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9299A3] font-sans mt-1">{item.label}</p>
                  <span className="text-[10px] text-[#686F79] font-mono mt-1 block italic">{item.note}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Playback Scrubber & Controls */}
        <div className="mt-5 p-4 rounded-xl bg-[#141619] border border-[#292D32]">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#AEB4BD]" />
              <span className="text-[#F2F0EA] font-semibold">Session Clock: 09:00:00 ➔ 23:55:00 IST</span>
            </div>
            <span className="text-[#E6E1D6] font-semibold">{progressPercent.toFixed(0)}% Replayed</span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 w-full rounded-full bg-[#25292E] overflow-hidden mb-3">
            <div
              className="absolute top-0 left-0 bottom-0 bg-[#D6D0C4] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Transport Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  isPlaying
                    ? "bg-[#24282D] text-[#F2F0EA] border border-[#34383D]"
                    : "bg-[#D6D0C4] text-[#17191C] hover:bg-[#E5E0D6]"
                }`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                <span>{isPlaying ? "Pause Stream" : "Play Session"}</span>
              </button>

              <button
                type="button"
                onClick={() => setProgressPercent(0)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#9299A3] hover:text-[#F2F0EA] bg-[#111316] hover:bg-[#24282D] border border-[#292D32]"
                title="Reset to 09:00 AM Open"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>09:00</span>
              </button>
            </div>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 text-xs font-mono">
              <span className="text-[10px] text-[#686F79] mr-1">SPEED:</span>
              {[1, 5, 10, 60].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    playbackSpeed === s
                      ? "bg-[#D6D0C4] text-[#17191C]"
                      : "text-[#686F79] hover:text-[#9299A3] bg-[#111316]"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Summary */}
        <div className="mt-4 pt-3 border-t border-[#25292E] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#48B58A]">
            <CheckCircle2 className="h-4 w-4" />
            <span>Archive Integrity Verified: {activeDateInfo.events} ticks recorded</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#111316] text-[#F2F0EA] hover:bg-[#24282D] font-medium border border-[#292D32] hover:border-[#8995A3] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
