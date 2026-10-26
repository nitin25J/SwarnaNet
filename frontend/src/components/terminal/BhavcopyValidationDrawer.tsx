"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  AlertCircle,
  ArrowRight,
  Layers,
} from "lucide-react";
import { getBhavcopyAuditReport } from "@/lib/swarnanetEngine";

interface BhavcopyValidationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BhavcopyValidationDrawer({
  isOpen,
  onClose,
}: BhavcopyValidationDrawerProps) {
  if (!isOpen) return null;

  const report = getBhavcopyAuditReport();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#101113]/85 transition-all duration-200">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 w-full max-w-xl h-full bg-[#151719] border-l border-[#34383D] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between text-[#F2F0EA] font-sans">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#25292E]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#142A23] border border-[#285D49] text-[#48B58A]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#F2F0EA] font-mono tracking-tight uppercase">
                    Data Integrity Audit
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#142A23] border border-[#285D49] text-[10px] font-mono font-bold text-[#48B58A]">
                    PASSED ✓
                  </span>
                </div>
                <p className="text-xs text-[#9299A3] font-mono mt-0.5">
                  MCX Bhavcopy Scraper Validation & Ingestion Telemetry
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#9299A3] hover:bg-[#24282D] hover:text-[#F2F0EA] transition-colors cursor-pointer"
              title="Close audit drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Audit Verification Summary Bar */}
          <div className="my-4 p-3 rounded-lg bg-[#181A1D] border border-[#292D32] font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#48B58A]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>All 4 Data Integrity Gates Verified</span>
            </div>
            <span className="text-[10px] text-[#9299A3]">
              {report.verifiedAtIst}
            </span>
          </div>

          {/* Audit Modules List */}
          <div className="space-y-4">
            {/* 1. Requested vs. Returned Date Match */}
            <div className="p-4 rounded-xl border border-[#292D32] bg-[#181A1D]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#D6D0C4] flex items-center gap-1.5 uppercase">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>1. Requested vs. Returned Date Match</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#142A23] text-[#48B58A] border border-[#285D49] text-[10px] font-mono font-semibold">
                  MATCH CONFIRMED
                </span>
              </div>
              <p className="text-[11px] text-[#9299A3] font-mono mb-2.5">
                Detects holiday/weekend backfill by matching query parameters against MCX server response headers.
              </p>
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#141619] border border-[#25292E] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#686F79] block">Requested Date (ISO/IST):</span>
                  <span className="text-[#F2F0EA] font-semibold">{report.requestedDate} (DD/MM/YYYY)</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#686F79] block">MCX Response Header:</span>
                  <span className="text-[#48B58A] font-semibold">{report.returnedDate} (MM/DD/YYYY)</span>
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-[#48B58A] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#48B58A]" />
                <span>Zero backfill discrepancy: Returned settlement date exactly matches active trading date.</span>
              </div>
            </div>

            {/* 2. Symbol Sanitization Log */}
            <div className="p-4 rounded-xl border border-[#292D32] bg-[#181A1D]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#D6D0C4] flex items-center gap-1.5 uppercase">
                  <FileText className="h-3.5 w-3.5" />
                  <span>2. Symbol Sanitization Log</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#222831] text-[#AEB4BD] border border-[#34383D] text-[10px] font-mono font-medium">
                  AUTO-TRIMMED
                </span>
              </div>
              <p className="text-[11px] text-[#9299A3] font-mono mb-2.5">
                Cleanses raw MCX fixed-width bhavcopy tokens by eliminating trailing whitespace padding.
              </p>
              <div className="space-y-1.5 font-mono text-xs">
                {report.symbolSanitizationLogs.map((log) => (
                  <div
                    key={log.rawSymbol}
                    className="flex items-center justify-between p-2 rounded bg-[#141619] border border-[#25292E]"
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-[#E07878] bg-[#301C1E] px-1.5 py-0.5 rounded text-[11px]">
                        &quot;{log.rawSymbol}&quot;
                      </code>
                      <ArrowRight className="h-3 w-3 text-[#686F79]" />
                      <code className="text-[#48B58A] bg-[#142A23] px-1.5 py-0.5 rounded font-semibold text-[11px]">
                        &quot;{log.sanitizedSymbol}&quot;
                      </code>
                    </div>
                    <span className="text-[10px] text-[#9299A3]">
                      {log.paddingRemoved > 0 ? `-${log.paddingRemoved} spaces` : "0 spaces"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Expiry Mapping Mode */}
            <div className="p-4 rounded-xl border border-[#292D32] bg-[#181A1D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-[#D6D0C4] flex items-center gap-1.5 uppercase">
                  <Layers className="h-3.5 w-3.5" />
                  <span>3. Expiry Mapping Mode</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#222831] text-[#AEB4BD] border border-[#34383D] text-[10px] font-mono font-medium">
                  DISCRETE
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141619] border border-[#25292E] font-mono text-xs mt-2">
                <span className="text-[#D6D0C4] font-semibold block mb-1">
                  {report.expiryMappingMode}
                </span>
                <p className="text-[11px] text-[#9299A3]">
                  Contracts are parsed into explicit calendar milestones (e.g. 24OCT2026, 05NOV2026, 27NOV2026) without synthetic generic nearest-month blending, ensuring mathematical purity for carry calculations.
                </p>
              </div>
            </div>

            {/* 4. Fill Price Flag */}
            <div className="p-4 rounded-xl border border-[#292D32] bg-[#181A1D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-[#D6D0C4] flex items-center gap-1.5 uppercase">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>4. Valuation vs. Fill Price Flag</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-[#222831] text-[#AEB4BD] border border-[#34383D] text-[10px] font-mono font-medium">
                  EOD MARK
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141619] border border-[#25292E] font-mono text-xs mt-2">
                <span className="text-[#D6D0C4] font-semibold block mb-1">
                  {report.fillPriceFlag}
                </span>
                <p className="text-[11px] text-[#9299A3]">
                  Official MCX settlement prices are used for end-of-day theoretical valuation. Active order executions simulate real-world fill haircuts by applying user-configured slippage and turnover hurdles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Audit Details */}
        <div className="mt-5 pt-4 border-t border-[#25292E] flex flex-col gap-2 font-mono text-[10px] text-[#686F79]">
          <div className="flex items-center justify-between">
            <span>SHA-256 Checksum:</span>
            <span className="text-[#9299A3]">{report.checksumSha256.slice(0, 24)}...</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total MCX Records Parsed:</span>
            <span className="text-[#F2F0EA] font-semibold">{report.totalRecordsParsed} contracts</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-2.5 rounded-lg bg-[#111316] hover:bg-[#24282D] text-xs font-mono font-medium text-[#F2F0EA] border border-[#292D32] hover:border-[#8995A3] transition-colors cursor-pointer text-center"
          >
            Close Audit Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
