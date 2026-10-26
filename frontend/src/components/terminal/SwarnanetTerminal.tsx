"use client";

import React, { useState, useMemo, useCallback } from "react";
import { TerminalHeader } from "./TerminalHeader";
import { TopKpiBar } from "./TopKpiBar";
import { RelativeValueGrid } from "./RelativeValueGrid";
import { TermStructureChart } from "./TermStructureChart";
import { BacktestAttribution } from "./BacktestAttribution";
import { TraderAlertMatrix } from "./TraderAlertMatrix";
import {
  InstitutionalSidebar,
  NavViewId,
  ModalViewId,
} from "./InstitutionalSidebar";
import { MyStrategiesModal } from "./MyStrategiesModal";
import { HistoricalReplayModal } from "./HistoricalReplayModal";
import { ArbitrageAlertBotModal } from "./ArbitrageAlertBotModal";
import { MarginRiskCalculatorModal } from "./MarginRiskCalculatorModal";
import { BhavcopyValidationDrawer } from "./BhavcopyValidationDrawer";
import { LiveArbitrageMonitorView } from "./LiveArbitrageMonitorView";
import { SpreadAnalyzerView } from "./SpreadAnalyzerView";
import {
  getParsedMcxContracts,
  getTopKpiMetrics,
  getTermStructureData,
  getTraderAlertMatrix,
} from "@/lib/swarnanetEngine";
import { BacktestParams } from "@/types/terminal";
import { User, getStoredUser } from "@/lib/auth";
import { SignInCard } from "@/components/auth/SignInCard";
import { X, Sliders, Target, History, Bell, LineChart } from "lucide-react";

interface SwarnanetTerminalProps {
  onSignOut: () => void;
}

export function SwarnanetTerminal({ onSignOut }: SwarnanetTerminalProps) {
  const [currentUser] = useState<User | null>(() => getStoredUser());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isLoginOverlayOpen, setIsLoginOverlayOpen] = useState(false);

  // Active Navigation View State & Sidebar Rail Collapse
  const [activeView, setActiveView] = useState<NavViewId>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal / Drawer States
  const [isStrategiesModalOpen, setIsStrategiesModalOpen] = useState(false);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [isAlertBotModalOpen, setIsAlertBotModalOpen] = useState(false);
  const [isMarginRiskModalOpen, setIsMarginRiskModalOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Backtest & Sensitivity Controls State
  const [backtestParams, setBacktestParams] = useState<BacktestParams>({
    slippageDepthBps: 5,
    roundTripFrictionBps: 14,
    entryZScore: 1.8,
    exitZScore: 0.4,
    capitalAllocatedLakhs: 50,
  });

  // Reactive Market Data Calculations
  const contracts = useMemo(() => {
    return getParsedMcxContracts(
      backtestParams.slippageDepthBps,
      backtestParams.roundTripFrictionBps
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backtestParams.slippageDepthBps, backtestParams.roundTripFrictionBps, refreshCount]);

  const kpiMetrics = useMemo(() => {
    return getTopKpiMetrics(
      contracts,
      backtestParams.roundTripFrictionBps + backtestParams.slippageDepthBps * 0.4
    );
  }, [contracts, backtestParams]);

  const termStructureData = useMemo(() => {
    return getTermStructureData(contracts);
  }, [contracts]);

  const { actionableAlerts, suppressedNoiseAlerts } = useMemo(() => {
    return getTraderAlertMatrix(
      contracts,
      backtestParams.slippageDepthBps,
      backtestParams.roundTripFrictionBps
    );
  }, [contracts, backtestParams]);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshCount((prev) => prev + 1);
    setIsRefreshing(false);
  }, []);

  // Modal Opener Routing Handler
  const handleOpenModal = useCallback((modalId: ModalViewId) => {
    switch (modalId) {
      case "my_strategies":
        setIsStrategiesModalOpen(true);
        break;
      case "eod_bhavcopies":
        setIsAuditDrawerOpen(true);
        break;
      case "historical_replays":
        setIsReplayModalOpen(true);
        break;
      case "arbitrage_bot":
        setIsAlertBotModalOpen(true);
        break;
      case "margin_calculator":
        setIsMarginRiskModalOpen(true);
        break;
      default:
        break;
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0D0F11] text-[#F1EEE7] selection:bg-[#D5B16D] selection:text-[#0D0F11] overflow-x-clip flex flex-row">


      {/* =========================================================================
          INSTITUTIONAL LEFT-HAND SIDEBAR NAVIGATION PANEL
          ========================================================================= */}
      <InstitutionalSidebar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenModal={handleOpenModal}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        alertCount={actionableAlerts.length}
      />

      {/* =========================================================================
          MAIN TERMINAL VIEWPORT (Scrolls over stationary background)
          ========================================================================= */}
      <main className="relative z-10 flex-1 min-w-0 max-w-[1720px] mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Terminal Master Header */}
        <div>
          <TerminalHeader
            user={currentUser}
            onSignOut={onSignOut}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
            onToggleLoginOverlay={() => setIsLoginOverlayOpen((prev) => !prev)}
          />
        </div>

        {/* Sticky Top KPI Summary Bar (Always visible across all views) */}
        <div className="sticky top-0 z-30 pt-2 pb-2.5 -mx-2 px-2 bg-[#0D0F11]/95 backdrop-blur-sm border-b border-[#22262B] transition-colors">
          <TopKpiBar metrics={kpiMetrics} isUpdating={isRefreshing} />
        </div>

        {/* =========================================================================
            DYNAMIC VIEW ROUTING ENGINE
            ========================================================================= */}
        {activeView === "dashboard" && (
          <>
            {/* Module B: Cross-Contract Relative Value Grid */}
            <div>
              <RelativeValueGrid contracts={contracts} />
            </div>

            {/* Two Column Layout: Module C (Carry Curve) + Module E (Alert Matrix) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-7">
                <TermStructureChart data={termStructureData} />
              </div>
              <div className="xl:col-span-5">
                <TraderAlertMatrix
                  actionableAlerts={actionableAlerts}
                  suppressedNoiseAlerts={suppressedNoiseAlerts}
                />
              </div>
            </div>

            {/* Module D: Walk-Forward Backtester & Attribution Engine */}
            <div>
              <BacktestAttribution onParamsChange={setBacktestParams} />
            </div>
          </>
        )}

        {activeView === "arbitrage_monitor" && (
          <div>
            <LiveArbitrageMonitorView contracts={contracts} />
          </div>
        )}

        {activeView === "spread_analyzer" && (
          <div>
            <SpreadAnalyzerView contracts={contracts} />
          </div>
        )}

        {activeView === "frictions_studio" && (
          <div className="space-y-5">
            <div className="bg-[#181A1D] rounded-xl p-5 border border-[#34383D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#222831] text-[#D6D0C4] border border-[#34383D]">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-semibold text-[#F2F0EA]">Execution Friction & Market Impact Studio</h2>
                  <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                    Calibrate Slippage Depth Penalty (0.01% - 0.25%), STT/CTT tax hurdles & venue clearing fees
                  </p>
                </div>
              </div>
            </div>
            <BacktestAttribution onParamsChange={setBacktestParams} />
          </div>
        )}

        {activeView === "performance_attribution" && (
          <div className="space-y-5">
            <div className="bg-[#181A1D] rounded-xl p-5 border border-[#34383D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#222831] text-[#D6D0C4] border border-[#34383D]">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-semibold text-[#F2F0EA]">Alpha vs. Beta Performance Attribution</h2>
                  <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                    Decompose returns into Strategy Alpha (basis convergence) vs. Gold Beta Drift vs. Friction Drag
                  </p>
                </div>
              </div>
            </div>
            <BacktestAttribution onParamsChange={setBacktestParams} />
          </div>
        )}

        {activeView === "backtester" && (
          <div className="space-y-5">
            <div className="bg-[#181A1D] rounded-xl p-5 border border-[#34383D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#222831] text-[#D6D0C4] border border-[#34383D]">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-semibold text-[#F2F0EA]">Walk-Forward Backtest Simulator</h2>
                  <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                    Out-of-sample parameter robustness, Sharpe/Sortino ratios & zero-edge discipline enforcement
                  </p>
                </div>
              </div>
            </div>
            <BacktestAttribution onParamsChange={setBacktestParams} />
          </div>
        )}

        {activeView === "alerts_hub" && (
          <div className="space-y-5">
            <div className="bg-[#181A1D] rounded-xl p-5 border border-[#34383D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#222831] text-[#D6D0C4] border border-[#34383D]">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-semibold text-[#F2F0EA]">Institutional Low-Noise Alert Hub</h2>
                  <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                    Actionable alpha spreads vs. noise filtered out by transaction hurdles and calendar carry
                  </p>
                </div>
              </div>
            </div>
            <TraderAlertMatrix
              actionableAlerts={actionableAlerts}
              suppressedNoiseAlerts={suppressedNoiseAlerts}
            />
          </div>
        )}

        {activeView === "term_structure" && (
          <div className="space-y-5">
            <div className="bg-[#181A1D] rounded-xl p-5 border border-[#34383D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#222831] text-[#D6D0C4] border border-[#34383D]">
                  <LineChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-semibold text-[#F2F0EA]">MCX Bullion Term Structure & Contango Carry Curve</h2>
                  <p className="text-xs font-mono text-[#9299A3] mt-0.5">
                    Compare observed Bhavcopy settlement vs. roll-down carry adjusted curve (+5.25% annualized carry rate)
                  </p>
                </div>
              </div>
            </div>
            <TermStructureChart data={termStructureData} />
          </div>
        )}

        {/* Quantitative Terminal Telemetry Bar */}
        <div className="bg-[#181A1C] border border-[#2D3237] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#858D97]">
          <div className="flex items-center gap-3">
            <span className="text-[#45BD91] flex items-center gap-1.5 font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#45BD91]" />
              <span>SWARNANET QUANT ENGINE ACTIVE</span>
            </span>
            <span className="hidden sm:inline text-[#2D3237]">|</span>
            <span>Bhavcopy Snapshot: MCX Gold Oct 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[#858D97]">
            <span>Theoretical Par Ratio: 999/995 = 1.00402</span>
            <span>Friction Model: STT + CTT + Slippage</span>
          </div>
        </div>
      </main>

      {/* =========================================================================
          INTERACTIVE OVERLAYS & MODALS
          ========================================================================= */}
      {/* 1. Strategy Presets Modal */}
      <MyStrategiesModal
        isOpen={isStrategiesModalOpen}
        onClose={() => setIsStrategiesModalOpen(false)}
        currentParams={backtestParams}
        onApplyParams={(newParams) => setBacktestParams(newParams)}
      />

      {/* 2. Historical Replay Modal */}
      <HistoricalReplayModal
        isOpen={isReplayModalOpen}
        onClose={() => setIsReplayModalOpen(false)}
      />

      {/* 3. Arbitrage Alert Bot Modal */}
      <ArbitrageAlertBotModal
        isOpen={isAlertBotModalOpen}
        onClose={() => setIsAlertBotModalOpen(false)}
      />

      {/* 4. Risk Margin Calculator Modal */}
      <MarginRiskCalculatorModal
        isOpen={isMarginRiskModalOpen}
        onClose={() => setIsMarginRiskModalOpen(false)}
        contracts={contracts}
      />

      {/* 5. Bhavcopy Scraper Validation & Audit Drawer */}
      <BhavcopyValidationDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />

      {/* 6. Trader Authentication / Login Overlay with Hide/Show Toggle */}
      {isLoginOverlayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101112]/90 animate-fade-in"
          onClick={() => setIsLoginOverlayOpen(false)}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLoginOverlayOpen(false)}
              className="absolute -top-3.5 -right-3.5 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-[#181A1C] border border-[#2D3237] text-[#B0B5BC] hover:text-[#F1EEE7] hover:border-[#8EA8C5] transition-colors cursor-pointer"
              title="Hide Login Overlay"
            >
              <X className="h-4 w-4" />
            </button>
            <SignInCard
              onLoginSuccess={() => {
                setIsLoginOverlayOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
