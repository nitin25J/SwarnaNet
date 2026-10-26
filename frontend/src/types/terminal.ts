/**
 * SWARNANET: MCX Commodity Intelligence
 * Quantitative Trading & Bullion Derivatives Type Definitions
 */

export type McxContractSymbol = "GOLDM" | "GOLDTEN" | "GOLDGUINEA" | "GOLDPETAL";

export type PurityGrade = 995 | 999;

export type LiquidityTier = "High" | "Med" | "Thin";

export type ArbitrageVerdict = "CHEAP / LONG" | "EXPENSIVE / SHORT" | "FAIR / NO-TRADE";

export interface McxContractSpec {
  symbol: McxContractSymbol;
  name: string;
  lotUnitGrams: number;
  quotationBaseGrams: number;
  purity: PurityGrade;
  purityFactor: number; // 0.995 or 0.999
  expiryPattern: string;
  tradingUnit: string;
  liquidityTier: LiquidityTier;
  baseSlippageBps: number;
  description: string;
}

export type OpportunityState =
  | "VALIDATED_CANDIDATE"
  | "FRICTION_CONSTRAINED"
  | "INSUFFICIENT_DATA"
  | "INVALID"
  | "NO_OPPORTUNITY";

export interface McxContractQuote {
  symbol: McxContractSymbol;
  contractName: string;
  expiryDate: string; // Discrete expiry format e.g. "05NOV2026"
  expiryTimestamp: number;
  daysToExpiry: number;
  quotationBaseGrams: number;
  purity: PurityGrade;
  settlementPrice: number; // Official MCX Settlement in INR
  prevSettlementPrice: number;
  changeInr: number;
  changePct: number;
  normalizedPpg: number; // Normalized Price Per Pure Gram (₹/g)
  theoreticalParPpg: number; // Par value relative to 0.999 benchmark
  disparitySpreadInr: number; // (Normalized - Par) in ₹/g
  disparitySpreadBps: number; // In basis points
  liquidityTier: LiquidityTier;
  estimatedSlippageBps: number;
  totalRoundTripFrictionBps: number;
  grossEdgeInr?: number;
  grossEdgeBps?: number;
  frictionCostInr?: number;
  netEdgeBps: number; // Disparity Bps - Friction Bps
  netEdgeInr?: number;
  verdict: ArbitrageVerdict;
  opportunityState?: OpportunityState;
  openInterest: number;
  volumeLots: number;
  bestBidPpg: number;
  bestAskPpg: number;
  isTenderActive: boolean; // True if daysToExpiry <= 5
  tenderWarningBadge?: string;
}

export type McxContract = McxContractQuote;

export interface TopKpiMetrics {
  benchmarkPureGramPrice: number; // ₹/g for 0.999 pure gold
  benchmarkChangeBps: number;
  maxBasisSpreadInr: number; // Peak disparity in ₹/g
  maxBasisSpreadBps: number;
  maxBasisPair: string; // e.g. "GOLDM vs GOLDTEN"
  actionableMispricingsCount: number;
  totalMonitoredContracts: number;
  activeRollingCorrelation: number; // e.g. 0.9984
  correlationPair: string;
  roundTripHurdleBps: number;
  feedLatencyMs: number;
  bhavcopyDate: string;
}

export interface TermStructurePoint {
  expiryDate: string;
  daysToExpiry: number;
  symbol: McxContractSymbol;
  rawPpg: number;
  rollDownAdjustedPpg: number;
  carryYieldAnnualizedPct: number;
  impliedRepoPct: number;
}

export interface BacktestParams {
  slippageDepthBps: number; // 1 to 25 bps (0.01% - 0.25%)
  roundTripFrictionBps: number; // 5 to 25 bps (STT/CTT, Brokerage, Stamp, Turnover)
  entryZScore: number; // e.g. 1.8
  exitZScore: number; // e.g. 0.4
  capitalAllocatedLakhs: number; // In INR Lakhs
}

export interface PerformanceAttribution {
  totalReturnPct: number;
  strategyAlphaPct: number;
  goldBenchmarkBetaPct: number;
  frictionDragPct: number;
  sharpeRatio: number; // After-cost annualized
  sortinoRatio: number;
  maxDrawdownPct: number;
  winRatePct: number;
  profitFactor: number;
  tradeCount: number;
  averageTradeDurationDays: number;
  isDisciplineViolation: boolean; // Sharpe < 0.20
}

export interface EquityCurvePoint {
  date: string;
  strategyEquity: number;
  benchmarkGold: number;
  drawdownPct: number;
  zScore: number;
}

export interface ActionableAlert {
  id: string;
  timestamp: string;
  legLongSymbol: McxContractSymbol;
  legLongExpiry: string;
  legLongPpg: number;
  legShortSymbol: McxContractSymbol;
  legShortExpiry: string;
  legShortPpg: number;
  grossSpreadInr: number;
  grossSpreadBps: number;
  daysBetweenMaturities: number;
  annualizedCarryRatePct: number;
  calendarCarryInr: number;
  calendarCarryBps: number;
  netBasisSpreadInr: number;
  netBasisSpreadBps: number;
  roundTripFrictionBps: number;
  netEdgeBps: number;
  netConvergenceExpectedInr: number;
  convictionLevel: "HIGH CONVICTION" | "MEDIUM SPREAD" | "TACTICAL";
  status: "ACTIVE_EDGE" | "CONVERGED" | "EXPIRING_SOON" | "FRICTION_CONSTRAINED";
  opportunityState?: OpportunityState;
  executionWindow: string;
  tenderWindowStatus: string;
}

export interface SuppressedNoiseAlert {
  id: string;
  timestamp: string;
  pair: string;
  rawDisparityBps: number;
  daysBetweenMaturities?: number;
  annualizedCarryRatePct?: number;
  calendarCarryBps?: number;
  netBasisSpreadBps?: number;
  isCalendarCarryFiltered?: boolean;
  slippageDragBps: number;
  frictionHurdleBps: number;
  netPnlExpectedBps: number;
  suppressionReason: string;
  contractPurity: string;
  liquidityTier: LiquidityTier;
  opportunityState?: OpportunityState;
  tenderWindowStatus?: string;
}

export interface BhavcopyAuditReport {
  auditStatus: "PASSED" | "FAILED";
  requestedDate: string; // e.g. "20/10/2026"
  returnedDate: string; // e.g. "10/20/2026"
  holidayWeekendBackfillVerified: boolean;
  symbolSanitizationLogs: Array<{
    rawSymbol: string;
    sanitizedSymbol: string;
    paddingRemoved: number;
    status: string;
  }>;
  expiryMappingMode: string;
  fillPriceFlag: string;
  checksumSha256: string;
  totalRecordsParsed: number;
  verifiedAtIst: string;
}
