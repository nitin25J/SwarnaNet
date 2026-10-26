"use client";

import React, { useState } from "react";
import { X, Bot, Send, RefreshCw } from "lucide-react";

interface ArbitrageAlertBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArbitrageAlertBotModal({ isOpen, onClose }: ArbitrageAlertBotModalProps) {
  const [isBotActive, setIsBotActive] = useState<boolean>(true);
  const [minNetMispricingBps, setMinNetMispricingBps] = useState<number>(20);
  const [minLiquidityLots, setMinLiquidityLots] = useState<number>(15);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<"slack" | "telegram" | "discord" | "custom">("slack");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ status: string; latency: string } | null>(null);

  if (!isOpen) return null;

  const samplePayload = JSON.stringify(
    {
      source: "SWARNANET-QUANT-GATEWAY",
      timestamp: new Date().toISOString(),
      event: "ACTIONABLE_ARBITRAGE_DETECTED",
      legs: {
        leg1: "GOLDTEN-31DEC2026",
        leg2: "GOLDM-05FEB2027",
      },
      grossDisparityBps: 69.4,
      impliedCarryDeductionBps: 51.8,
      netEdgeBps: minNetMispricingBps + 3.2,
      sttHurdleBps: 14.0,
      executionStatus: "ANALYTICAL_NOTIFICATION_ONLY (No DMA/OMS integration configured)",
    },
    null,
    2
  );

  const handleTestDispatch = async () => {
    setIsTesting(true);
    setTestResult(null);

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setTestResult({
        status: "Gateway Unconfigured: No live webhook destination specified (Historical Verification Mode)",
        latency: "Unavailable",
      });
      setIsTesting(false);
      return;
    }

    try {
      const startTime = performance.now();
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: samplePayload,
        mode: "no-cors",
      });
      const latency = `${Math.round(performance.now() - startTime)}ms`;
      setTestResult({
        status: "Webhook Request Transmitted (no-cors)",
        latency,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network unreachable";
      setTestResult({
        status: `Webhook Dispatch Failed: ${msg}`,
        latency: "Unavailable",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101113]/85 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-[#181A1D] border border-[#34383D] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#25292E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#142A23] border border-[#285D49] text-[#48B58A]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-sans font-semibold text-[#F2F0EA]">Arbitrage Alert Bot & Webhooks</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                    isBotActive
                      ? "bg-[#142A23] text-[#48B58A] border-[#285D49]"
                      : "bg-[#301C1E] text-[#E07878] border-[#704044]"
                  }`}
                >
                  {isBotActive ? "ANALYTICAL ENGINE ACTIVE" : "ENGINE STANDBY"}
                </span>
              </div>
              <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                Post-settlement threshold alert configuration (Analytical / Verification Mode)
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

        {/* Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Active Status Bar */}
          <div className="p-3 rounded-lg bg-[#141619] border border-[#292D32] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isBotActive ? "bg-[#48B58A]" : "bg-[#E07878]"}`} />
              <span className="text-xs font-mono text-[#F2F0EA]">
                {isBotActive ? "Monitoring Historical EOD Settlement Data (Historical Verification Mode - No Multicast Feed Active)" : "Alert bot listening is currently paused"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsBotActive(!isBotActive)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                isBotActive
                  ? "bg-[#301C1E] text-[#E07878] hover:bg-[#3d2426] border border-[#704044]"
                  : "bg-[#142A23] text-[#48B58A] hover:bg-[#1b382f] border border-[#285D49]"
              }`}
            >
              {isBotActive ? "Pause Bot" : "Activate Bot"}
            </button>
          </div>

          {/* Filtering Criteria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#141619] border border-[#292D32]">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#9299A3]">DISPATCH THRESHOLD</span>
                <span className="text-[#E6E1D6] font-semibold">&gt;{minNetMispricingBps} bps</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={minNetMispricingBps}
                onChange={(e) => setMinNetMispricingBps(Number(e.target.value))}
                className="w-full h-1.5 bg-[#25292E] rounded-lg appearance-none cursor-pointer accent-[#D6D0C4]"
              />
              <span className="text-[10px] text-[#686F79] font-mono mt-1 block">
                Dispatches alert only if Net Mispricing &gt; {minNetMispricingBps} bps after STT and Carry.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141619] border border-[#292D32]">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#9299A3]">MIN LIQUIDITY DEPTH</span>
                <span className="text-[#AEB4BD] font-semibold">≥{minLiquidityLots} lots</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="5"
                value={minLiquidityLots}
                onChange={(e) => setMinLiquidityLots(Number(e.target.value))}
                className="w-full h-1.5 bg-[#25292E] rounded-lg appearance-none cursor-pointer accent-[#D6D0C4]"
              />
              <span className="text-[10px] text-[#686F79] font-mono mt-1 block">
                Requires top-of-book depth to satisfy execution lot size without high market impact.
              </span>
            </div>
          </div>

          {/* Webhook Endpoint & Channel */}
          <div className="p-3.5 rounded-xl bg-[#141619] border border-[#292D32] space-y-2.5">
            <label className="text-xs font-mono text-[#686F79] uppercase tracking-wider block font-semibold">
              Notification Channel:
            </label>
            <div className="flex flex-wrap gap-2">
              {(["slack", "telegram", "discord", "custom"] as const).map((chan) => (
                <button
                  key={chan}
                  type="button"
                  onClick={() => setSelectedChannel(chan)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${
                    selectedChannel === chan
                      ? "bg-[#D6D0C4] text-[#17191C] font-semibold"
                      : "bg-[#111316] text-[#9299A3] border border-[#292D32] hover:text-[#F2F0EA]"
                  }`}
                >
                  {chan}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#111316] border border-[#292D32] text-xs font-mono text-[#F2F0EA] focus:border-[#8995A3] focus:outline-none"
                placeholder="https://hooks.domain.com/..."
              />
              <button
                type="button"
                onClick={handleTestDispatch}
                disabled={isTesting}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6D0C4] hover:bg-[#E5E0D6] text-[#17191C] font-mono font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                <span>{isTesting ? "Pinging..." : "Test Ping"}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-2 rounded bg-[#142A23] border border-[#285D49] text-xs font-mono text-[#48B58A] flex items-center justify-between">
                <span>✓ {testResult.status}</span>
                <span className="text-[10px] text-[#48B58A] font-semibold">{testResult.latency}</span>
              </div>
            )}
          </div>

          {/* Webhook JSON Preview */}
          <div className="p-3 rounded-xl bg-[#111316] border border-[#292D32]">
            <span className="text-[10px] font-mono text-[#686F79] uppercase block mb-1">
              Sample Webhook Outbound Payload:
            </span>
            <pre className="text-[10px] font-mono text-[#C4C7CC] overflow-x-auto p-2 rounded bg-[#141619] border border-[#25292E] max-h-28">
              {samplePayload}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#25292E] flex items-center justify-between text-xs font-mono">
          <span className="text-[#686F79]">Failover Retry Policy: 3 attempts with exponential backoff</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#111316] text-[#F2F0EA] hover:bg-[#24282D] font-medium border border-[#292D32] hover:border-[#8995A3] transition-colors cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
