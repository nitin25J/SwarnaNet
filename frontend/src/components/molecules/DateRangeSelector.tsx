"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, Check, X, ChevronRight, Clock } from "lucide-react";

export type DateRangeOption = "30d" | "6m" | "1y" | "ytd" | "2y" | "custom";

interface DateRangeSelectorProps {
  value: DateRangeOption;
  onChange: (range: DateRangeOption, customDates?: { start: string; end: string }) => void;
  customDates?: { start: string; end: string };
}

const RANGES: { id: DateRangeOption; label: string }[] = [
  { id: "30d", label: "Last 30 Days" },
  { id: "6m", label: "Last 6 Mo" },
  { id: "1y", label: "1 Year" },
  { id: "ytd", label: "YTD 2026" },
  { id: "2y", label: "All History (2Y)" },
];

export function DateRangeSelector({ value, onChange, customDates }: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState(customDates?.start || "2026-09-01");
  const [endDate, setEndDate] = useState(customDates?.end || "2026-09-17");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onChange("custom", { start: startDate, end: endDate });
    setIsCalendarOpen(false);
  };

  const handlePresetSelect = (presetId: DateRangeOption) => {
    onChange(presetId);
    setIsCalendarOpen(false);
  };

  return (
    <div className="relative inline-flex items-center z-50" ref={popoverRef}>
      <div className="flex items-center gap-1 rounded-xl border border-[#292D32] bg-[#111316] p-1">
        {/* Interactive Calendar Button */}
        <button
          type="button"
          onClick={() => setIsCalendarOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            isCalendarOpen || value === "custom"
              ? "bg-[#D6D0C4] text-[#17191C] border-[#8995A3] shadow-sm"
              : "text-[#9299A3] hover:text-[#F2F0EA] hover:bg-[#24282D] border-transparent"
          }`}
          title="Open interactive calendar picker"
          aria-label="Open custom calendar picker"
        >
          <CalendarIcon className={`h-3.5 w-3.5 ${isCalendarOpen || value === "custom" ? "text-[#17191C]" : "text-[#D6D0C4]"}`} />
          <span className="hidden sm:inline">
            {value === "custom" ? `${startDate.slice(5)} to ${endDate.slice(5)}` : "Calendar"}
          </span>
        </button>

        <div className="h-4 w-[1px] bg-[#292D32] my-auto mx-0.5 hidden sm:block" />

        {/* Quick Range Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {RANGES.map((r) => {
            const isActive = value === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onChange(r.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#D6D0C4] text-[#17191C] border border-[#8995A3] shadow-sm"
                    : "text-[#9299A3] hover:text-[#F2F0EA] hover:bg-[#24282D]"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Calendar Popover Dropdown */}
      {isCalendarOpen && (
        <div className="absolute top-full right-0 mt-2 z-[100] w-80 sm:w-96 rounded-2xl border border-[#34383D] bg-[#181A1D] p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#25292E]">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#D6D0C4]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F2F0EA]">
                Date Range Picker · 2026
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(false)}
              className="rounded-lg p-1 text-[#9299A3] hover:bg-[#24282D] hover:text-[#F2F0EA] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Presets Grid */}
          <div className="my-3">
            <p className="text-[11px] font-semibold text-[#9299A3] mb-2">Quick FinTech Presets:</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handlePresetSelect("30d")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111316] hover:bg-[#24282D] border border-[#292D32] text-left text-xs text-[#F2F0EA] transition-colors"
              >
                <span>Last 30 Days</span>
                {value === "30d" && <Check className="h-3 w-3 text-[#D6D0C4]" />}
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect("6m")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111316] hover:bg-[#24282D] border border-[#292D32] text-left text-xs text-[#F2F0EA] transition-colors"
              >
                <span>Last 6 Mo (Apr-Sep)</span>
                {value === "6m" && <Check className="h-3 w-3 text-[#D6D0C4]" />}
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect("ytd")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111316] hover:bg-[#24282D] border border-[#292D32] text-left text-xs text-[#F2F0EA] transition-colors"
              >
                <span>YTD 2026</span>
                {value === "ytd" && <Check className="h-3 w-3 text-[#D6D0C4]" />}
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect("2y")}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111316] hover:bg-[#24282D] border border-[#292D32] text-left text-xs text-[#F2F0EA] transition-colors"
              >
                <span>All History (2 Years)</span>
                {value === "2y" && <Check className="h-3 w-3 text-[#D6D0C4]" />}
              </button>
            </div>
          </div>

          {/* Custom Date Range Inputs Form */}
          <form onSubmit={handleApplyCustom} className="space-y-3 pt-2 border-t border-[#25292E]">
            <p className="text-[11px] font-semibold text-[#9299A3]">Custom Date Interval:</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-[#9299A3] mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-[#292D32] bg-[#111316] px-2 py-1.5 text-xs text-[#F2F0EA] focus:border-[#8995A3] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#9299A3] mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max="2026-12-31"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-[#292D32] bg-[#111316] px-2 py-1.5 text-xs text-[#F2F0EA] focus:border-[#8995A3] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="flex items-center gap-1 text-[10px] text-[#48B58A]">
                <Clock className="h-3 w-3" /> Fiscal 2026 Active
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="px-2.5 py-1 text-xs text-[#9299A3] hover:text-[#F2F0EA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D6D0C4] hover:bg-[#E5E0D6] text-[#17191C] text-xs font-bold transition-colors border border-[#8995A3]"
                >
                  <span>Apply Range</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

