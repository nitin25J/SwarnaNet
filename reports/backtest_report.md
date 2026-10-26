# SwarnaNet — Strategy Research & Historical Backtesting Report

**Problem Statement:** PS-03: Commodity Derivatives Intelligence (Hack in Hills '26)
**Execution Timestamp:** 2026-10-26 01:30:15
**Target Pair:** `GOLDGUINEA` (1 lot = 8g) vs `GOLDPETAL` (8 lots = 8g)
**Sample Split:** In-Sample ($\le$ 2023-12-31) | Out-of-Sample ($>$ 2023-12-31)

---

## 1. Executive Summary & Core Research Findings

This study formulates and historically stress-tests a **relative-value statistical arbitrage hypothesis** between MCX Gold futures contracts (`GOLDGUINEA` vs `GOLDPETAL`).

### Key Empirical Conclusions
1. **Statistical Mean Reversion is Valid in Raw Prices:** In gross frictionless terms, the normalized spread demonstrates robust mean-reverting behavior: **61.9% gross win rate**, and **83.3% of entered trades successfully reached the mean-reversion target**.
2. **Falsification of Executable Retail Edge:** When realistic transaction costs (exchange turnover fees, CTT, GST, brokerage, and bid-ask slippage) are incorporated, **net PnL becomes negative across all parameter thresholds**: ₹-4,540.41 in-sample and ₹-5,840.35 out-of-sample (₹-10,380.76 total net loss at baseline 15 bps round-trip friction).
3. **Root Cause:** The absolute price basis between 8g coins and 1g petals is extremely tight (~₹30 to ₹60 per 10g, or <0.1% of notional value). The gross reversion amplitude is smaller than the round-trip friction of executing two separate illiquid futures contracts.
4. **Research Integrity:** We explicitly reject false claims of profitability and report the exact market microstructure constraints that prevent executable retail arbitrage.

---

## 2. Research Hypothesis & Economic Rationale

### Theoretical Premise
Both `GOLDGUINEA` (8-gram coin contract) and `GOLDPETAL` (1-gram bar contract) represent deliverable physical gold of **identical 999 fineness** traded on the Multi Commodity Exchange of India (MCX). Under the Law of One Price:
$$P_{GUINEA}^{fine/g} \approx P_{PETAL}^{fine/g}$$

### Why Spreads Diverge Temporarily
- **Retail Denomination Friction:** GOLDPETAL has high retail participation due to low capital requirements (~₹15,000 margin per lot), causing transient speculative demand shocks.
- **Execution Illiquidity:** GOLDGUINEA has lower trading frequency, leading to settlement price lags relative to active intraday retail petal flows.
- **Market-Making Imbalance:** When transient inventory imbalances push the rolling Z-score beyond $\pm 1.5\sigma$, economic arbitrage should pull the spread back to historical parity.

### Why GOLDGUINEA vs GOLDPETAL Was Selected Over Other Pairs
1. **Identical Purity (999):** Eliminates metallurgical discount uncertainty.
2. **Matching Expiry Dates:** Across 8 of the 10 contract cycles (`2020-06-30`, `2020-08-31`, `2021-06-30`, `2021-08-31`, `2022-06-30`, `2022-08-30`, `2023-06-30`, `2023-08-31`, `2026-10-30`), both contracts expire on the exact same date. **Calendar carry (cost of financing, contango/backwardation) is exactly zero**, isolating pure physical basis.
3. **Contrast with GOLDM:** GOLDM expires in March, July, and October, whereas GOLDGUINEA and GOLDPETAL expire in June and August. Comparing GOLDM against other contracts contaminates the spread with calendar carry over the 25–60 day expiry divergence.
4. **Natural Physical Quantization:** 1 lot of GOLDGUINEA (8g) exactly equals 8 lots of GOLDPETAL (8 × 1g = 8g), enabling an exact market-neutral physical hedge.

### Falsification Criteria
The research hypothesis is falsified if:
- The spread diverges persistently across contract delivery cycles.
- Transaction costs exceed the gross mean-reversion profit per trade.
- Forced expiry closures occur frequently before mean reversion is achieved.

---

## 3. Backtest Methodology & Prevention of Look-Ahead Bias

### Chronological In-Sample / Out-of-Sample Split
- **In-Sample Research Period:** `2020-03-30` to `2023-12-31` (496 trading days, 30 trades). Parameters ($Z_{entry}=1.5, Z_{exit}=0.0, Z_{stop}=3.5$) were fixed using only this period.
- **Out-of-Sample Validation Period:** `2024-01-01` to `2026-10-23` (145 trading days, 12 trades). Evaluated without parameter re-tuning.

### Signal Generation & Execution Timing
1. **Lag-1 Execution:** At the close of trading day $t$, signal is determined using $Z_t$.
2. **Forward Entry at Day $t+1$:** Trade is executed on day $t+1$. Future price information is strictly inaccessible at signal time.
3. **Zero-Volume Execution Filter:** If day $t+1$ exhibits `Volume == 0` for either contract, entry is blocked. Trades are never filled on non-trading days.
4. **Forced Expiry Liquidation:** All open positions are unconditionally closed when $DaysToExpiry \le 1$ to prevent physical delivery or auction penalties.
5. **No Forward-Filling:** Missing observations remain null; no synthetic prices are fabricated.

---

## 4. Performance Summary: In-Sample vs. Out-of-Sample

| Metric | In-Sample (2020 - 2023) | Out-of-Sample (2024 - 2026) | Full Dataset (2020 - 2026) |
|:---|:---:|:---:|:---:|
| **Total Trading Days** | 496 | 145 | 641 |
| **Total Executed Trades** | 30 | 12 | 42 |
| **Long Spread Trades** | 14 | 6 | 20 |
| **Short Spread Trades** | 16 | 6 | 22 |
| **Gross PnL (Frictionless)** | **₹2,963.00** | **₹2,068.00** | **₹5,031.00** |
| **Gross Win Rate** | 60.0% | 66.7% | 61.9% |
| **Gross Profit Factor** | 7.97 | 999.00 | 12.84 |
| **Average Holding Period** | 5.4 days | 3.9 days | 5.0 days |
| **Market Exposure** | 28.2% | 26.9% | 27.9% |
| **Net PnL (Low Friction - 6 bps)** | ₹-38.36 | ₹-1,095.34 | ₹-1,133.70 |
| **Net PnL (Baseline Cost - 15 bps)** | **₹-4,540.41** | **₹-5,840.35** | **₹-10,380.76** |
| **Net Win Rate (Baseline Cost)** | 16.7% | 8.3% | 14.3% |
| **Net PnL (High Slippage - 30 bps)** | ₹-12,043.82 | ₹-13,748.70 | ₹-25,792.52 |
| **Max Drawdown (Baseline Cost)** | ₹4,859.91 (2.43%) | ₹10,528.98 (5.26%) | ₹10,528.98 (5.26%) |
| **Annualized Sharpe Ratio (Net)** | -1.12 | -3.50 | -1.79 |

---

## 5. Trade Exit Breakdown

| Exit Category | Description | In-Sample Count | Out-of-Sample Count | Total Count | % of All Exits |
|:---|:---|:---:|:---:|:---:|:---:|
| **Mean Reversion Target** | Spread converged back to rolling mean ($Z=0$) | 24 | 11 | **35** | 83.3% |
| **Stop Loss** | Stop loss triggered ($|Z|>3.5$) | 5 | 1 | **6** | 14.3% |
| **Time Stop** | Stop loss triggered ($|Z|>3.5$) | 1 | 0 | **1** | 2.4% |

---

## 6. Sensitivity Analysis Across Friction Scenarios

Because relative-value pairs require trading two separate contracts simultaneously, execution friction is doubled:

| Cost Scenario | Assumptions | Turnover Cost per Trade | Total Net PnL (Full) | Net Win Rate | Tradability Verdict |
|:---|:---|:---:|:---:|:---:|:---|
| **Gross (Frictionless)** | Theoretical exchange settlement marks | ₹0.00 | **+₹5,031.00** | 61.9% | Unrealistic benchmark |
| **Low Cost (6 bps RT)** | Institutional maker rebates, zero slippage | ~₹73.00 | **₹-1,133.70** | ~43.0% | Marginally negative |
| **Baseline Cost (15 bps RT)** | Brokerage, MCX CTT (0.01%), GST, 1-tick slippage | ~₹183.00 | **₹-10,380.76** | 14.3% | **Unprofitable after friction** |
| **High Friction (30 bps RT)** | Conservative crossing of 2–3 tick bid-ask spread | ~₹367.00 | **₹-25,792.52** | <25.0% | Severe cost drag |

---

## 7. Comparison with Appropriate Baselines

1. **Zero-Trade Cash Baseline:** Holds ₹200,000 in cash. Net PnL = ₹0.00, Max Drawdown = 0.00%. The strategy underperformed cash on a net basis due to transaction cost drag.
2. **Directional Gold Buy-and-Hold:** Buying physical gold in March 2020 (~₹42,000/10g) and holding to October 2026 (~₹148,000/10g) appreciated over +250%. The pairs trading strategy is market-neutral (Beta $\approx 0$), avoiding gold price directional risk, but failed to generate positive alpha after friction.

---

## 8. Unresolved Real-World Limitations & Microstructure Realities

1. **Settlement Prices vs. Executable Quotes:** Historical backtests use daily settlement Close prices. On days with low volume in GOLDGUINEA, settlement prices reflect exchange theoretical polling marks rather than executable bid-ask liquidity.
2. **Physical Delivery Mechanics:** MCX gold contracts enter a tender/delivery period 5 days before expiry with substantial physical delivery handling charges. Forced liquidation 1–5 days before expiry is mandatory for cash-settled speculators.
3. **Non-Synchronous Trading:** GOLDPETAL trades actively until 11:30 PM IST, whereas GOLDGUINEA can have hours of dormancy, leading to apparent spread anomalies that cannot be simultaneously executed in practice.

