# SwarnaNet — Feature Engineering & Cross-Contract Price Normalization Report

**Problem Statement:** PS-03: Commodity Derivatives Intelligence (Hack in Hills '26)
**Execution Timestamp:** 2026-10-25 20:11:24
**Input Dataset:** `data/processed/mcx_gold_normalized.csv` (3,269 rows)
**Output Dataset:** `data/processed/mcx_gold_features.csv` (3,269 rows, 57 columns)

---

## 1. Executive Summary

Step 2 builds cross-contract price normalization and rolling statistical spread indicators across the four MCX Gold futures contracts (`GOLDM`, `GOLDGUINEA`, `GOLDPETAL`, `GOLDTEN`).

Key achievements:
1. **Quotation & Purity Harmonization:** Converted raw quotes across differing delivery units (100g, 10g, 8g, 1g) and purities (995 vs 999) into exact fine-gold-equivalent prices per gram and per 10 grams.
2. **Preservation of Market Truth:** Original 9 columns are 100% retained unchanged. Zero-volume observations retain missing OHLC without fabrication.
3. **Strict Prevention of Look-Ahead Bias:** Rolling 20-lag spread mean, standard deviation, and Z-scores are computed strictly using observations $[t-20 : t-1]$ preceding the current observation.
4. **Full Pairwise Coverage:** Evaluated all 6 canonical contract pairs, documenting exact overlapping dates and calendar expiry dynamics.

---

## 2. Verified MCX Contract Specifications & Quotation Basis

In MCX gold derivatives, the physical **trading unit** (lot size) is distinct from the **quotation basis** (the denominator of the quoted price). Conflating the two would distort prices by up to 100x.

| Contract Symbol | Physical Trading Unit | Price Quotation Basis ($q_i$) | Purity Fineness ($p_i$) | Purity Fraction | Quotation Multiplier |
|:---|---:|---:|---:|:---:|:---:|
| **GOLDM** | 100 g | Per 10 g | 995 / 1000 | 0.9950 | $\times 1.005025$ |
| **GOLDTEN** | 10 g | Per 10 g | 999 / 1000 | 0.9990 | $\times 1.001001$ |
| **GOLDGUINEA** | 8 g | Per 8 g | 999 / 1000 | 0.9990 | $\times 1.251251$ |
| **GOLDPETAL** | 1 g | Per 1 g | 999 / 1000 | 0.9990 | $\times 10.010010$ |

> **Specification Discrepancy Verification:** In the raw MCX files, `GOLDM` is quoted per 10g with 995 fineness, `GOLDTEN` per 10g with 999 fineness, `GOLDGUINEA` per 8g coin with 999 fineness, and `GOLDPETAL` per 1g with 999 fineness. Contract trading units (e.g. 100g for GOLDM) govern total contract lot value, not the price quote.

---

## 3. Mathematical Normalization Formula & Worked Examples

To compare contracts on an exact, economically equivalent basis, each recorded settlement Close $C_i$ is converted to fine gold:

### Formula
$$\text{Price per Gram of Fine Gold: } P_i^{fine/g} = \frac{C_i}{q_i \cdot (p_i / 1000)}$$

$$\text{Price per 10 Grams of Fine Gold: } P_i^{fine/10g} = 10 \cdot P_i^{fine/g} = \frac{10 \cdot C_i}{q_i \cdot (p_i / 1000)}$$

### Worked Examples on Market Data (2020-03-02 & 2026-10-05)

#### Example 1: 2020-03-02
- **GOLDM** ($C = ₹42,017.00$, $q = 10$, $p = 995$):
  $$P^{fine/g} = \frac{42,017}{10 \times 0.995} = ₹4,222.8141/g \implies P^{fine/10g} = ₹42,228.14$$
- **GOLDGUINEA** ($C = ₹33,983.00$, $q = 8$, $p = 999$):
  $$P^{fine/g} = \frac{33,983}{8 \times 0.999} = ₹4,252.1271/g \implies P^{fine/10g} = ₹42,521.27$$
- **GOLDPETAL** ($C = ₹4,212.00$, $q = 1$, $p = 999$):
  $$P^{fine/g} = \frac{4,212}{1 \times 0.999} = ₹4,216.2162/g \implies P^{fine/10g} = ₹42,162.16$$

#### Example 2: 2026-10-05 (All Four Contracts Active)
- **GOLDM** ($C = ₹146,900.00$): $P^{fine/10g} = \frac{146,900}{0.995} = ₹147,638.19$
- **GOLDGUINEA** ($C = ₹119,421.00$): $P^{fine/10g} = \frac{10 \times 119,421}{8 \times 0.999} = ₹149,425.67$
- **GOLDPETAL** ($C = ₹14,921.00$): $P^{fine/10g} = \frac{10 \times 14,921}{0.999} = ₹149,359.36$
- **GOLDTEN** ($C = ₹148,542.00$): $P^{fine/10g} = \frac{148,542}{0.999} = ₹148,690.69$

---

## 4. Derived Features Directory

| Feature Column | Data Type | Formula / Logic | Financial Interpretation |
|:---|:---:|:---|:---|
| `FineGoldPricePerGram` | Float (4 dec) | $C / (q \cdot p / 1000)$ | Absolute fine gold price per gram in rupees. |
| `FineGoldPricePer10g` | Float (2 dec) | $10 \cdot P^{fine/g}$ | Benchmark fine gold price per 10 grams. |
| `DaysToExpiry` | Integer | $ExpiryDate - Date$ | Calendar days remaining in contract life cycle. |
| `PostExpiryFlag` | Binary (0/1) | $1 \text{ if } Date > ExpiryDate \text{ else } 0$ | Data integrity flag for anomalous post-expiry trading. |
| `HasVolumeData` | Binary (0/1) | $1 \text{ if Volume populated else } 0$ | Data completeness indicator. |
| `HasOpenInterestData` | Binary (0/1) | $1 \text{ if OpenInterest populated else } 0$ | Market participation indicator. |
| `ZeroVolumeFlag` | Binary (0/1) | $1 \text{ if Volume } == 0 \text{ else } 0$ | Identifies non-traded / illiquid sessions. |
| `MissingOHLCFlag` | Binary (0/1) | $1 \text{ if Open/High/Low null else } 0$ | Identifies absence of intraday trade bounds. |
| `SettlementOnlyFlag` | Binary (0/1) | $1 \text{ if ZeroVolume and MissingOHLC else } 0$ | Flags prices established purely by exchange settlement. |
| `CloseOutsideHLFlag` | Binary (0/1) | $1 \text{ if Close } \notin [Low, High] \text{ else } 0$ | Flags expiry-day spot polling settlements. |
| `Spread_{A}_{B}` | Float (2 dec) | $P_{A,t}^{fine/10g} - P_{B,t}^{fine/10g}$ | Absolute cross-contract price spread. |
| `SpreadPct_{A}_{B}` | Float (4 dec) | $100 \times (P_A - P_B) / P_B$ | Percentage cross-contract basis premium/discount. |
| `SpreadMean20_{A}_{B}` | Float (2 dec) | $\frac{1}{20}\sum_{k=1}^{20} Spread_{t-k}$ | Strictly preceding 20-lag rolling spread baseline. |
| `SpreadStd20_{A}_{B}` | Float (2 dec) | $\sqrt{\frac{1}{19}\sum_{k=1}^{20} (Spread_{t-k} - \mu)^2}$ | Preceding 20-lag sample volatility of spread. |
| `SpreadZScore_{A}_{B}` | Float (4 dec) | $(Spread_t - \mu) / \sigma$ | Normalized statistical divergence indicator. |
| `Spread_vs_{SYM}` | Float (2 dec) | $P_{row}^{fine/10g} - P_{SYM,t}^{fine/10g}$ | Relative contract spread for current row. |
| `SpreadPct_vs_{SYM}` | Float (4 dec) | $100 \times (P_{row} - P_{SYM}) / P_{SYM}$ | Percentage relative basis for current row. |

---

## 5. Pairwise Overlapping Dates & Statistical Coverage

All 6 canonical contract pairs were evaluated across the 1,214 distinct trading days in the dataset:

| Contract Pair | Total Overlapping Dates | Warmup Days ($N<20$) | Usable Z-Score Obs | Historical Date Range | Mean Z-Score | Min Z-Score | Max Z-Score |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **GOLDM_GOLDGUINEA** | 427 | 20 | **407** | 2020-03-02 to 2026-10-05 | -0.031 | -10.708 | 4.468 |
| **GOLDM_GOLDPETAL** | 384 | 20 | **364** | 2020-03-02 to 2026-10-05 | 0.120 | -8.811 | 5.157 |
| **GOLDM_GOLDTEN** | 130 | 20 | **110** | 2026-04-06 to 2026-10-05 | -0.708 | -4.700 | 3.640 |
| **GOLDGUINEA_GOLDPETAL** | 661 | 20 | **641** | 2020-03-02 to 2026-10-23 | 0.179 | -6.523 | 11.373 |
| **GOLDGUINEA_GOLDTEN** | 125 | 20 | **105** | 2026-05-01 to 2026-10-23 | -0.961 | -4.706 | 2.786 |
| **GOLDPETAL_GOLDTEN** | 125 | 20 | **105** | 2026-05-01 to 2026-10-23 | -0.997 | -5.110 | 2.929 |

---

## 6. Rolling Window & Look-Ahead Bias Prevention Policy

### Look-Ahead Bias Prevention
In algorithmic trading and statistical feature engineering, computing a rolling metric that includes observation $t$ (e.g. `rolling(20).mean()` including current index) contaminates historical signals with future/concurrent information.

Our pipeline implements a **strict lag-1 shift policy**:
$$\mu_{t-20:t-1} = \frac{1}{20} \sum_{k=1}^{20} \text{Spread}_{t-k}$$
$$\sigma_{t-20:t-1} = \sqrt{\frac{1}{19} \sum_{k=1}^{20} (\text{Spread}_{t-k} - \mu_{t-20:t-1})^2}$$
$$Z_t = \frac{\text{Spread}_t - \mu_{t-20:t-1}}{\sigma_{t-20:t-1}}$$

### Mathematical Safeguards
1. **Warmup Window:** For the first 20 observations ($t < 20$), `SpreadMean20`, `SpreadStd20`, and `SpreadZScore` are strictly set to null (`""`).
2. **Zero Volatility Guard:** If $\sigma_{t-20:t-1} \le 10^{-12}$, the Z-score is set to null to avoid division by zero.
3. **Sample Standard Deviation:** We use Bessel's sample correction ($N-1 = 19$) to prevent downward bias in volatility estimates.
4. **Chronological Invariant:** Observations are strictly sorted ascending by date prior to window computation.

---

## 7. Expiry Dynamics & Economic Interpretation of Spreads

A vital domain insight is that **cross-contract price differences do not automatically reflect structural arbitrage opportunities**:

1. **Same-Expiry Pairs (e.g. GOLDGUINEA vs GOLDPETAL on June 30):**
   - When two contracts share the exact same expiry date, calendar carrying cost (financing, storage, contango) is zero.
   - The resulting spread isolates the **pure structural basis** (lot size convenience, physical denomination premium, retail friction).
   - In our empirical data, `GOLDGUINEA` vs `GOLDPETAL` has a mean spread of only +0.04% to +0.18%, demonstrating high physical pricing efficiency.
2. **Different-Expiry Pairs (e.g. GOLDM vs GOLDGUINEA):**
   - GOLDM expires in March, July, and October, while GOLDGUINEA expires in June and August.
   - On any given trading date, their active contracts differ in days to expiry (e.g. 25 days apart).
   - The observed spread therefore reflects a composite of the **cross-contract basis PLUS the term structure / calendar spread (cost of carry)** over $\Delta \text{DaysToExpiry}$.

---

## 8. Missing Data Treatment & Known Limitations

1. **Zero-Volume Observations (202 rows):**
   - Missing Open, High, and Low values remain null. They are never filled with Close.
   - These rows have `SettlementOnlyFlag = 1` and `ZeroVolumeFlag = 1`.
   - They are valid for settlement-based spread analysis, but must be excluded from intraday volatility modeling.
2. **Shorter GOLDTEN History:**
   - `GOLDTEN` trading begins on `2025-03-31` (404 trading dates), whereas `GOLDM`, `GOLDGUINEA`, and `GOLDPETAL` span from `2020-01-01`.
   - Any pairwise spread involving `GOLDTEN` is null prior to `2025-03-31`. Prices are **never forward-filled** across missing dates.
3. **Non-Synchronous Liquidity:**
   - On dates where one contract is actively traded and another has zero volume, the spread measures the difference between a traded price and an exchange theoretical settlement mark.

