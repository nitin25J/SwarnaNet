"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Sliders,
  Target,
  History,
  Bell,
  LineChart,
  Folder,
  FileSpreadsheet,
  Calendar,
  Bot,
  Calculator,
  Search,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

export type NavViewId =
  | "dashboard"
  | "arbitrage_monitor"
  | "spread_analyzer"
  | "frictions_studio"
  | "performance_attribution"
  | "backtester"
  | "alerts_hub"
  | "term_structure";

export type ModalViewId =
  | "my_strategies"
  | "eod_bhavcopies"
  | "historical_replays"
  | "arbitrage_bot"
  | "margin_calculator";

interface InstitutionalSidebarProps {
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  onOpenModal: (modalId: ModalViewId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  alertCount?: number;
}

export function InstitutionalSidebar({
  activeView,
  onSelectView,
  onOpenModal,
  isCollapsed,
  onToggleCollapse,
  alertCount = 3,
}: InstitutionalSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const [isFileSectionOpen, setIsFileSectionOpen] = useState(true);
  const [isTradingAppsSectionOpen, setIsTradingAppsSectionOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search bar, and '[' or Ctrl+B to toggle broader/narrower
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName || "";
      if (
        (e.key === "[" && !["INPUT", "TEXTAREA"].includes(activeTag)) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b")
      ) {
        e.preventDefault();
        onToggleCollapse();
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        if (isCollapsed) onToggleCollapse();
        setTimeout(() => searchInputRef.current?.focus(), 150);
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed, onToggleCollapse]);

  const handleMicToggle = () => {
    setIsMicActive((prev) => !prev);
    if (!isMicActive) {
      setSearchQuery("GOLDTEN 31DEC");
      setTimeout(() => setIsMicActive(false), 2400);
    }
  };

  const coreNavItems = [
    {
      id: "dashboard" as NavViewId,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: "LIVE",
    },
    {
      id: "arbitrage_monitor" as NavViewId,
      label: "Live Arbitrage Monitor",
      icon: ArrowLeftRight,
      badge: "4 PAIRS",
    },
    {
      id: "spread_analyzer" as NavViewId,
      label: "Spread Analyzer",
      icon: TrendingUp,
      badge: "BPS",
    },
    {
      id: "frictions_studio" as NavViewId,
      label: "Frictions & Execution",
      icon: Sliders,
      badge: "STT",
    },
    {
      id: "performance_attribution" as NavViewId,
      label: "Performance Attribution",
      icon: Target,
      badge: "ALPHA",
    },
    {
      id: "backtester" as NavViewId,
      label: "Historical Backtester",
      icon: History,
      badge: "OOS",
    },
    {
      id: "alerts_hub" as NavViewId,
      label: "Low-Noise Alerts",
      icon: Bell,
      badgeCount: alertCount,
    },
    {
      id: "term_structure" as NavViewId,
      label: "Term Structure & Curves",
      icon: LineChart,
      badge: "CARRY",
    },
  ];

  const fileNavItems = [
    {
      id: "my_strategies" as ModalViewId,
      label: "My Strategies",
      icon: Folder,
      type: "modal" as const,
    },
    {
      id: "eod_bhavcopies" as ModalViewId,
      label: "EOD Bhavcopies",
      icon: FileSpreadsheet,
      type: "drawer" as const,
      auditBadge: "AUDIT ✓",
    },
    {
      id: "historical_replays" as ModalViewId,
      label: "Historical Replays",
      icon: Calendar,
      type: "modal" as const,
      badge: "2025+",
    },
  ];

  const tradingAppItems = [
    {
      id: "arbitrage_bot" as ModalViewId,
      label: "Arbitrage Alert Bot",
      icon: Bot,
      type: "modal" as const,
      badge: "ACTIVE",
    },
    {
      id: "margin_calculator" as ModalViewId,
      label: "Risk Margin Calculator",
      icon: Calculator,
      type: "modal" as const,
      badge: "TENDER",
    },
  ];

  // Filtering based on search query
  const q = searchQuery.toLowerCase().trim();
  const filteredCoreItems = coreNavItems.filter((item) =>
    !q ? true : item.label.toLowerCase().includes(q)
  );
  const filteredFileItems = fileNavItems.filter((item) =>
    !q ? true : item.label.toLowerCase().includes(q)
  );
  const filteredTradingAppItems = tradingAppItems.filter((item) =>
    !q ? true : item.label.toLowerCase().includes(q)
  );

  return (
    <aside
      className={`terminal-sidebar-container relative z-40 flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 select-none bg-[#151719] border-r border-[#34383D] ${isCollapsed ? "w-[68px]" : "w-[260px]"
        }`}
    >
      {/* 1. Header with Single Unified Toggle Icon */}
      <div
        className={`border-b border-[#34383D] flex items-center transition-all ${isCollapsed ? "h-[62px] justify-center p-2" : "h-[62px] justify-between px-4 py-3"
          }`}
      >
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-sm tracking-tight text-[#F2F0EA]">SWARNANET</span>
              <span className="px-1.5 py-0.2 rounded bg-[#222831] border border-[#34383D] text-[9px] font-mono font-medium text-[#C4C7CC]">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A0A7B1] mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#45BD91]" />
              <span>MCX EOD // VERIFIED</span>
            </div>
          </div>
        )}

        {/* Single unified icon button that handles BOTH expansion and shrink */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex items-center justify-center rounded-lg bg-[#1C1F22] hover:bg-[#24282D] transition-colors cursor-pointer active:scale-95 border border-[#34383D] hover:border-[#4A5058] ${isCollapsed
              ? "h-9 w-9 text-[#D6D0C4] hover:text-[#F2F0EA]"
              : "h-8 w-8 text-[#C4C7CC] hover:text-[#F2F0EA]"
            }`}
          title={isCollapsed ? "Expand Sidebar (260px) - Key: [" : "Shrink Sidebar (68px) - Key: ["}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-[#D6D0C4]" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 2. Quick Search & Filter Bar */}
      {!isCollapsed && (
        <div className="p-3 border-b border-[#292D32]">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#9299A3] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick filter... (/ to search)"
              className="w-full pl-8 pr-14 py-1.5 rounded-lg bg-[#111316] border border-[#34383D] text-xs font-sans text-[#F2F0EA] placeholder:text-[#9299A3] focus:border-[#8995A3] focus:outline-none focus:ring-1 focus:ring-[#8995A3] transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#9299A3] hover:text-[#F2F0EA] p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`p-1 rounded transition-colors ${isMicActive ? "text-[#D6D0C4]" : "text-[#9299A3] hover:text-[#F2F0EA]"
                    }`}
                  title="Simulate Voice Input Search"
                >
                  {isMicActive ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>
          {isMicActive && (
            <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-[#D6D0C4] px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D6D0C4]" />
              <span>Listening for prompt...</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Navigation List (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Category A: Core Terminal Modules */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 terminal-nav-section-title flex items-center justify-between text-[#9299A3]">
              <span>CORE TERMINAL</span>
              <span className="text-[9px] text-[#686F79]">{filteredCoreItems.length}</span>
            </div>
          )}

          <nav className="space-y-1">
            {filteredCoreItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`terminal-nav-item w-full flex items-center rounded-lg p-2.5 cursor-pointer relative ${isActive ? "active" : ""
                    } ${isCollapsed ? "justify-center" : "justify-between"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#17191B]" : "text-[#B0B5BC]"}`} />
                    {!isCollapsed && <span className="nav-label truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                        <span
                          className={`nav-badge px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${isActive
                              ? "bg-[#17191B] text-[#F1EEE7] border border-[#2D3237]"
                              : "bg-[#2B2417] text-[#D5B16D] border border-[#5C4B2C]"
                            }`}
                        >
                          {item.badgeCount}
                        </span>
                      ) : item.badge ? (
                        <span
                          className={`nav-badge px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${isActive
                              ? "bg-[#17191B] text-[#F1EEE7] border border-[#2D3237] font-semibold"
                              : "bg-[#1D2023] text-[#858D97] border border-[#2D3237]"
                            }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Category B: "File / Data Management" (Collapsible) */}
        <div>
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsFileSectionOpen(!isFileSectionOpen)}
              className="w-full px-2 mb-1.5 terminal-nav-section-title flex items-center justify-between text-[#9299A3] hover:text-[#F2F0EA] cursor-pointer"
            >
              <span>FILE & DATA</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isFileSectionOpen ? "" : "-rotate-90"}`} />
            </button>
          ) : (
            <div className="h-[1px] bg-[#292D32] my-2 mx-1" />
          )}

          {(isFileSectionOpen || isCollapsed) && (
            <nav className="space-y-1">
              {filteredFileItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenModal(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`terminal-nav-item w-full flex items-center rounded-lg p-2.5 cursor-pointer hover:text-[#F2F0EA] ${isCollapsed ? "justify-center" : "justify-between"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-[#B0B5BC]" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.auditBadge ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#142A23] text-[#45BD91] border border-[#285D49]">
                            {item.auditBadge}
                          </span>
                        ) : item.badge ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#1D2023] text-[#858D97] border border-[#2D3237]">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Category C: "Trading Apps / Utilities" (Collapsible) */}
        <div>
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsTradingAppsSectionOpen(!isTradingAppsSectionOpen)}
              className="w-full px-2 mb-1.5 terminal-nav-section-title flex items-center justify-between text-[#858D97] hover:text-[#F1EEE7] cursor-pointer"
            >
              <span>TRADING APPS</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isTradingAppsSectionOpen ? "" : "-rotate-90"}`} />
            </button>
          ) : (
            <div className="h-[1px] bg-[#2D3237] my-2 mx-1" />
          )}

          {(isTradingAppsSectionOpen || isCollapsed) && (
            <nav className="space-y-1">
              {filteredTradingAppItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenModal(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`terminal-nav-item w-full flex items-center rounded-lg p-2.5 cursor-pointer hover:text-[#F1EEE7] ${isCollapsed ? "justify-center" : "justify-between"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-[#B0B5BC]" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#1D2023] text-[#858D97] border border-[#2D3237]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* 4. Bottom System Status Bar */}
      <div className="p-3 border-t border-[#2D3237] bg-[#151719] overflow-hidden">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[10px] font-mono text-[#858D97]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#45BD91]" />
              <span>ENGINE: READY</span>
            </div>
            <span className="text-[#5E6570]">v2.8.4</span>
          </div>
        ) : (
          <div className="flex justify-center py-0.5">
            <span className="h-2 w-2 rounded-full bg-[#45BD91]" title="System Engine Ready" />
          </div>
        )}
      </div>
    </aside>
  );
}
