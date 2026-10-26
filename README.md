# 🏛️ SwarnaNet — MCX Bullion Derivatives Intelligence Terminal

An institutional-grade Quantitative Trading & Commodity Derivatives Intelligence Terminal engineered for Indian bullion markets (**MCX — Multi Commodity Exchange of India**).

SwarnaNet normalizes discrete, non-fungible MCX gold contracts across varying quotation units, lot sizes, expiries, and fineness standards into a unified **Price Per Pure Gram (PPG)** relative-value curve with rigorous friction modeling (STT, CTT, stamp duty, slippage hurdles).

---

## 📐 Quantitative Core & Normalization Architecture

MCX lists gold contracts with differing lot sizes, quotation conventions, and metallurgical purity standards:

| Contract | Trading Unit | Quotation Unit | Purity (Fineness) | Expiry Cycle |
|---|---|---|---|---|
| **GOLDM (Gold Mini)** | 100 grams | Per 10 grams | **995 / 1000** (0.995 Fine) | 3rd – 5th of Month |
| **GOLDTEN** | 10 grams | Per 10 grams | **999 / 1000** (0.999 Fine) | 27th – 31st of Month |
| **GOLDGUINEA** | 8 grams | Per 8 grams | **999 / 1000** (0.999 Fine) | 27th – 31st of Month |
| **GOLDPETAL** | 1 gram | Per 1 gram | **999 / 1000** (0.999 Fine) | 27th – 31st of Month |

### Exact Normalization Formulas

- **For 999 Purity Contracts (GOLDTEN, GOLDGUINEA, GOLDPETAL):**
  $$\text{Price Per Pure Gram (PPG)} = \frac{\text{Quoted Price} / \text{Quotation Unit Grams}}{0.999}$$

- **For 995 Purity Contracts (GOLDM):**
  $$\text{Price Per Pure Gram (PPG)} = \frac{\text{Quoted Price} / 10\text{g}}{0.995}$$

- **Theoretical Metallurgical Parity:**
  $$\text{Par Ratio} = \frac{0.999}{0.995} \approx 1.0040201 \quad (+40.2 \text{ bps natural fineness premium})$$

- **Friction-Surviving Arbitrage Hurdle:**
  $$\text{Net Basis Disparity} > \text{Round-Trip STT/CTT} + \text{Exchange Turnover} + \text{Stamp Duty} + \text{Slippage} \approx 14\text{--}15 \text{ bps}$$

---

## 🖥️ Terminal Modules

1. **Terminal Header Bar**: Real-time Indian Standard Time (IST) market clock, MCX settlement mode indicator, verified EOD status pill, and automated Bhavcopy data audit drawer.
2. **Top KPI Metrics Bar**: Benchmark 0.999 pure gold price, peak cross-contract basis spread, net actionable mispricings surviving friction, and rolling 90-day correlation ($\rho \approx 0.999$).
3. **Relative Value Grid**: Real-time normalized comparison across all active contracts and expiries with spread disparity (bps), liquidity tiers, and executable mispricing classification.
4. **Term Structure & Calendar Carry Curve**: Multi-expiry carry curves with toggleable raw settlement vs roll-down adjusted curves and annualized carry yield (% Contango vs Backwardation).
5. **Walk-Forward Backtester & Attribution Engine**: Parameterized backtesting simulating friction hurdles, slippage penalties, capital allocation, and equity growth curves.
6. **Trader Alert Matrix**: Live signal feed filtering out friction-constrained market noise and prioritizing verified actionable cross-contract disparities.
7. **Bhavcopy Integrity Audit Drawer**: Slide-out verification dashboard displaying SHA-256 data integrity hashes, settlement price boundaries, lot multipliers, and record counts.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ & **npm**
- **Python** 3.10+
- (Optional) **Supabase** account for cloud database persistence

### Frontend Terminal Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the terminal.

### Python Backend & Quant Engine Tests
```bash
# Run the complete test suite (37 tests)
pytest tests/ -v
```

### TypeScript & Lint Verification
```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

---

## 📁 Repository Structure

```
SWARNANET/
├── data/                      # Verified MCX Bhavcopy EOD datasets
│   ├── clean/                 # Normalized and cleaned CSVs
│   └── raw/                   # Raw historical trade marks
├── frontend/                  # Next.js 15 + React 19 + Tailwind CSS Terminal UI
│   ├── src/app/               # App Router pages and API routes (/api/market-data, /api/refresh)
│   ├── src/components/        # Institutional terminal UI components
│   └── src/lib/               # Quantitative calculation engine & Supabase client
├── reports/                   # Phase audit and verification documentation
├── scripts/                   # Data refresh, bhavcopy scraping & database ingestion
├── src/                       # Python quantitative engines & validators
│   ├── backtest/              # Walk-forward backtester and friction models
│   ├── data_collection/       # MCX bhavcopy scrapers and parsers
│   └── pipeline/              # Ingestion, validation, and feature pipelines
├── supabase/                  # Database migrations and schema definitions
└── tests/                     # Comprehensive pytest test suite (37 test cases)
```

---

## 📄 License
MIT License. Engineered for institutional derivatives analysis and educational demonstration.
