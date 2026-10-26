# 🏛️ SWARNANET: MCX Commodity Derivatives & Relative Value Terminal

An institutional-grade Quantitative Trading & Commodity Derivatives Intelligence Terminal engineered for Indian bullion markets (MCX - Multi Commodity Exchange of India).

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Vanilla Tailwind CSS**, featuring an institutional dark terminal design system (`#090D16`), real-time parity normalization across MCX Gold contracts (GOLDM, GOLDTEN, GOLDGUINEA, GOLDPETAL), interactive term structure carry curves, walk-forward friction backtesting, and low-noise actionable execution matrices.

---

## 🔒 Preserved Authentication Architecture & Shell Rules

The terminal strictly adheres to institutional security and session gatekeeping:
- **Default Landing**: The user lands directly on the **Institutional Login Interface** (`/` or `/login`).
- **Session Preservation**: Backed by secure client session storage (`auth_token`, `auth_user`) and dynamic session timeout tracking.
- **Evaluator / Demo Quick Bypass**: A dedicated **"Evaluator / Demo One-Click Access"** button enables judges, quant researchers, and evaluators to access the live terminal instantly with pre-authenticated credentials (`AV-MCX-9941` / `Dr. A. Sengupta`).
- **Sign Out & Lock Terminal**: The terminal header contains a prominent **"Lock Terminal"** button that purges session tokens and returns immediately to the login gateway.

---

## 📐 Quantitative Architecture & Valuation Engine

### Normalization Mechanics
MCX lists gold contracts with differing lot sizes, quotation units, and purity standards:
1. **GOLDM (Mini)**: 100g contract unit, quoted per 10g, **995 purity** (0.995 fine gold), expiry 3rd–5th.
2. **GOLDTEN**: 10g contract unit, quoted per 10g, **999 purity** (0.999 fine gold), expiry 27th–31st.
3. **GOLDGUINEA**: 8g contract unit, quoted per 8g, **999 purity**, expiry 27th–31st.
4. **GOLDPETAL**: 1g contract unit, quoted per 1g, **999 purity**, expiry 27th–31st.

#### Formulas
- **For 999 Purity**:
  $$\text{Price Per Pure Gram (PPG)} = \frac{\text{Quoted Price} / \text{Quotation Grams}}{0.999}$$
- **For 995 Purity (GOLDM)**:
  $$\text{Price Per Pure Gram (PPG)} = \frac{\text{Quoted Price} / 10\text{g}}{0.995}$$
- **Theoretical Parity Ratio**:
  $$\frac{0.999}{0.995} \approx 1.00402 \quad (\sim 0.402\% \text{ natural fineness premium})$$

---

## 🖥️ Terminal Modules Overview

### 1. Module A: Top KPI Summary Bar
- **Benchmark Pure Gram Price**: Real-time reference 0.999 pure gold price in ₹/g.
- **Max Cross-Contract Basis Spread**: Peak basis disparity across all active expiries (in ₹/g and basis points).
- **Net Actionable Mispricings**: Real-time count of cross-contract inefficiencies exceeding round-trip friction hurdles.
- **Active Rolling Correlation**: Continuous rolling correlation matrix between high-liquidity Mini and Ten contracts.

### 2. Module B: Cross-Contract Relative Value Grid
- Real-time normalization of settlement prices across all 4 MCX bullion contracts and discrete expiries.
- Dynamic calculation of Disparity Spreads (bps), Liquidity Tiers (High, Med, Thin), and Estimated Slippage Drag.
- Automated executable signals: `CHEAP / LONG`, `EXPENSIVE / SHORT`, and `FAIR / NO-TRADE`.
- **Interactive Inspector Drawer**: Clicking any contract row opens a deep mathematical audit modal illustrating conversion math, purity scalars, theoretical par comparison, and fee breakdown.

### 3. Module C: Term Structure & Carry Curve
- Term structure curve mapping discrete contract expiries to normalized pure gram valuations.
- **Interactive Toggle**: Switch between **Raw Settlement Curve** and **Roll-Down Adjusted Curve** (isolating calendar time decay from structural supply/demand shifts).
- Instant indicator of annualized carry yield (% Contango vs Backwardation).

### 4. Module D: Walk-Forward Backtester & Attribution Engine
- Real-time parameter calibration:
  - Slippage Depth Penalty slider (0.01% - 0.25%).
  - Round-trip Brokerage & STT/CTT friction controls (5 - 25 bps).
  - Entry/Exit Z-score threshold sensitivity controls ($\pm 1.5\sigma$ to $\pm 2.5\sigma$).
- Performance Attribution Breakdown:
  - **Strategy Alpha**: Net return derived from mispricing convergence.
  - **Underlying Beta**: Market drift contribution.
  - **Friction Drag**: Losses absorbed by spreads, exchange fees, and STT.
- Risk Metrics: Sharpe Ratio, Sortino Ratio, and Maximum Drawdown.
- **Institutional Discipline Banner**: When after-cost Sharpe falls below 0.20, the engine triggers an alert:
  > *"Edge does not survive real-world execution friction. Model enforces zero capital deployment."*

### 5. Module E: Low-Noise Trader Alert Matrix
- **Actionable Spreads**: High-conviction arbitrage pairs whose gross mispricing cleanly exceeds all exchange, regulatory, and slippage friction costs.
- **Suppressed Noise Log**: Sub-hurdle spreads transparently flagged and suppressed to prevent overtrading on thin contracts (e.g. GOLDPETAL / GOLDGUINEA).

---

## 🛠️ Running Locally

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Launch the development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```
