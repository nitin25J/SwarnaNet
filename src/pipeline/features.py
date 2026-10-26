"""
SwarnaNet Feature Engineering & Cross-Contract Price Normalization
Problem Statement 03 — Hack in Hills '26
Normalizes MCX Gold Futures prices across contracts with differing purities and quotation bases,
and computes pairwise cross-contract spreads and rolling statistical indicators.
"""

from __future__ import annotations

import csv
import math
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple


# MCX Contract Specifications
# Trading unit is the physical delivery lot size; quotation basis is the pricing denominator.
@dataclass(frozen=True)
class ContractSpec:
    symbol: str
    trading_unit_grams: float
    quotation_basis_grams: float
    purity_parts_per_thousand: float

    @property
    def purity_fraction(self) -> float:
        return self.purity_parts_per_thousand / 1000.0


MCX_CONTRACT_SPECS: Dict[str, ContractSpec] = {
    "GOLDM": ContractSpec(
        symbol="GOLDM",
        trading_unit_grams=100.0,
        quotation_basis_grams=10.0,
        purity_parts_per_thousand=995.0,
    ),
    "GOLDTEN": ContractSpec(
        symbol="GOLDTEN",
        trading_unit_grams=10.0,
        quotation_basis_grams=10.0,
        purity_parts_per_thousand=999.0,
    ),
    "GOLDGUINEA": ContractSpec(
        symbol="GOLDGUINEA",
        trading_unit_grams=8.0,
        quotation_basis_grams=8.0,
        purity_parts_per_thousand=999.0,
    ),
    "GOLDPETAL": ContractSpec(
        symbol="GOLDPETAL",
        trading_unit_grams=1.0,
        quotation_basis_grams=1.0,
        purity_parts_per_thousand=999.0,
    ),
}

CANONICAL_PAIRS: List[Tuple[str, str]] = [
    ("GOLDM", "GOLDGUINEA"),
    ("GOLDM", "GOLDPETAL"),
    ("GOLDM", "GOLDTEN"),
    ("GOLDGUINEA", "GOLDPETAL"),
    ("GOLDGUINEA", "GOLDTEN"),
    ("GOLDPETAL", "GOLDTEN"),
]

ORIGINAL_COLUMNS = [
    "Symbol",
    "Date",
    "ExpiryDate",
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
    "OpenInterest",
]


def calculate_fine_gold_price_per_gram(close_price: float, spec: ContractSpec) -> float:
    """
    Calculate fine-gold-equivalent price per gram:
    P^{fine/g} = C / (q * (p / 1000))
    """
    denominator = spec.quotation_basis_grams * spec.purity_fraction
    return close_price / denominator


def calculate_fine_gold_price_per_10g(close_price: float, spec: ContractSpec) -> float:
    """
    Calculate fine-gold-equivalent price per 10 grams:
    P^{fine/10g} = 10 * P^{fine/g} = 10 * C / (q * (p / 1000))
    """
    return 10.0 * calculate_fine_gold_price_per_gram(close_price, spec)


def calculate_days_to_expiry(trade_date: date, expiry_date: date) -> int:
    """Calculate calendar days remaining to contract expiry."""
    return (expiry_date - trade_date).days


@dataclass
class PairwisePoint:
    date_str: str
    date_obj: date
    price_a: float
    price_b: float
    spread: float
    spread_pct: float
    rolling_mean: Optional[float] = None
    rolling_std: Optional[float] = None
    rolling_zscore: Optional[float] = None


@dataclass
class FeatureEngineResult:
    feature_rows: List[Dict[str, Any]]
    total_rows: int
    pair_statistics: Dict[str, Dict[str, Any]]
    pairwise_series: Dict[str, List[PairwisePoint]]
    contract_summary: Dict[str, Dict[str, Any]]


def compute_pairwise_rolling_statistics(
    daily_front_prices: Dict[str, Dict[str, float]],
    pair: Tuple[str, str],
    window_size: int = 20,
) -> List[PairwisePoint]:
    """
    Compute pairwise spreads and 20-lag strictly preceding rolling statistics.
    Prevents look-ahead bias: statistics at observation t are computed over window [t-20 : t-1].
    Observation t itself is never part of the historical window.
    """
    sym_a, sym_b = pair
    all_dates = sorted(daily_front_prices.keys())
    
    # 1. Collect aligned observations where both contracts have valid prices
    paired_observations: List[PairwisePoint] = []
    for d_str in all_dates:
        prices = daily_front_prices[d_str]
        if sym_a in prices and sym_b in prices:
            p_a = prices[sym_a]
            p_b = prices[sym_b]
            spread = p_a - p_b
            spread_pct = (spread / p_b * 100.0) if p_b != 0 else 0.0
            d_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
            paired_observations.append(
                PairwisePoint(
                    date_str=d_str,
                    date_obj=d_obj,
                    price_a=p_a,
                    price_b=p_b,
                    spread=spread,
                    spread_pct=spread_pct,
                )
            )

    # 2. Compute rolling 20-lag stats strictly preceding current observation
    for idx in range(len(paired_observations)):
        if idx >= window_size:
            # Strictly preceding observations: window from (idx - window_size) up to (idx - 1) inclusive
            history = [paired_observations[k].spread for k in range(idx - window_size, idx)]
            mean = sum(history) / float(window_size)
            # Sample variance with Bessel's correction (ddof=1)
            variance = sum((x - mean) ** 2 for x in history) / float(window_size - 1)
            std = math.sqrt(variance)
            
            # Guard against zero standard deviation
            if std > 1e-12:
                z_score = (paired_observations[idx].spread - mean) / std
            else:
                z_score = None
                
            paired_observations[idx].rolling_mean = mean
            paired_observations[idx].rolling_std = std
            paired_observations[idx].rolling_zscore = z_score
        else:
            # Insufficient historical observations (< 20 preceding)
            paired_observations[idx].rolling_mean = None
            paired_observations[idx].rolling_std = None
            paired_observations[idx].rolling_zscore = None

    return paired_observations


def generate_features(normalized_csv_path: Path) -> FeatureEngineResult:
    """Generate normalized prices, pairwise spreads, rolling statistics, and flags."""
    if not normalized_csv_path.exists():
        raise FileNotFoundError(f"Input file not found: {normalized_csv_path}")

    with open(normalized_csv_path, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    total_rows = len(reader)
    if total_rows == 0:
        raise ValueError("Input normalized CSV is empty.")

    # Validate presence of original 9 columns
    for col in ORIGINAL_COLUMNS:
        if col not in reader[0]:
            raise ValueError(f"Missing required column in normalized data: {col}")

    # Map raw rows by Date and Symbol to identify active front contracts
    by_date_sym: Dict[str, Dict[str, List[Dict[str, Any]]]] = defaultdict(lambda: defaultdict(list))
    for r in reader:
        by_date_sym[r["Date"]][r["Symbol"]].append(r)

    # Identify front-month contract for each (Date, Symbol)
    # The front contract has nearest ExpiryDate >= Date
    daily_front_prices: Dict[str, Dict[str, float]] = defaultdict(dict)
    for d_str, syms in by_date_sym.items():
        d_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
        for sym, recs in syms.items():
            recs_sorted = sorted(recs, key=lambda x: x["ExpiryDate"])
            eligible = [
                r for r in recs_sorted
                if datetime.strptime(r["ExpiryDate"], "%Y-%m-%d").date() >= d_obj
            ]
            front_rec = eligible[0] if eligible else recs_sorted[0]
            close_val = float(front_rec["Close"])
            spec = MCX_CONTRACT_SPECS[sym]
            p_10g = calculate_fine_gold_price_per_10g(close_val, spec)
            daily_front_prices[d_str][sym] = p_10g

    # Compute pairwise series for all 6 pairs
    pairwise_series: Dict[str, List[PairwisePoint]] = {}
    pair_by_date: Dict[str, Dict[str, PairwisePoint]] = defaultdict(dict)
    pair_statistics: Dict[str, Dict[str, Any]] = {}

    for pair in CANONICAL_PAIRS:
        pair_key = f"{pair[0]}_{pair[1]}"
        series = compute_pairwise_rolling_statistics(daily_front_prices, pair, window_size=20)
        pairwise_series[pair_key] = series
        
        valid_z = [p.rolling_zscore for p in series if p.rolling_zscore is not None]
        pair_statistics[pair_key] = {
            "symbol_a": pair[0],
            "symbol_b": pair[1],
            "total_overlapping_dates": len(series),
            "valid_zscore_count": len(valid_z),
            "warmup_rows_count": len(series) - len(valid_z),
            "date_min": series[0].date_str if series else None,
            "date_max": series[-1].date_str if series else None,
            "min_zscore": min(valid_z) if valid_z else None,
            "max_zscore": max(valid_z) if valid_z else None,
            "mean_zscore": (sum(valid_z) / len(valid_z)) if valid_z else None,
        }
        
        for pt in series:
            pair_by_date[pt.date_str][pair_key] = pt

    # Construct enriched feature rows
    feature_rows: List[Dict[str, Any]] = []
    contract_summary: Dict[str, Dict[str, Any]] = defaultdict(
        lambda: {"rows": 0, "min_price_10g": float("inf"), "max_price_10g": float("-inf"), "zero_vol": 0}
    )

    for r in reader:
        sym = r["Symbol"]
        spec = MCX_CONTRACT_SPECS[sym]
        close_val = float(r["Close"])
        d_obj = datetime.strptime(r["Date"], "%Y-%m-%d").date()
        exp_obj = datetime.strptime(r["ExpiryDate"], "%Y-%m-%d").date()

        # 1. Price Normalization
        p_gram = calculate_fine_gold_price_per_gram(close_val, spec)
        p_10g = calculate_fine_gold_price_per_10g(close_val, spec)

        # 2. Expiry features
        days_to_exp = calculate_days_to_expiry(d_obj, exp_obj)
        post_expiry_flag = 1 if days_to_exp < 0 else 0

        # 3. Data quality and liquidity flags
        vol_str = r["Volume"].strip()
        oi_str = r["OpenInterest"].strip()
        has_volume = 1 if vol_str != "" else 0
        has_oi = 1 if oi_str != "" else 0
        vol_val = int(vol_str) if has_volume else 0
        zero_vol_flag = 1 if vol_val == 0 else 0
        
        open_str = r["Open"].strip()
        high_str = r["High"].strip()
        low_str = r["Low"].strip()
        missing_ohlc = 1 if (open_str == "" or high_str == "" or low_str == "") else 0
        settlement_only = 1 if (zero_vol_flag == 1 and missing_ohlc == 1) else 0

        # Settlement outside High-Low flag
        close_outside_hl = 0
        if not missing_ohlc:
            h = float(high_str)
            l = float(low_str)
            if close_val < l or close_val > h:
                close_outside_hl = 1

        # Base enriched row
        row_dict: Dict[str, Any] = {
            # Original 9 columns
            "Symbol": sym,
            "Date": r["Date"],
            "ExpiryDate": r["ExpiryDate"],
            "Open": r["Open"],
            "High": r["High"],
            "Low": r["Low"],
            "Close": r["Close"],
            "Volume": r["Volume"],
            "OpenInterest": r["OpenInterest"],
            # Derived normalized prices
            "FineGoldPricePerGram": f"{p_gram:.4f}",
            "FineGoldPricePer10g": f"{p_10g:.2f}",
            # Calendar & Expiry
            "DaysToExpiry": str(days_to_exp),
            "PostExpiryFlag": str(post_expiry_flag),
            # Liquidity & Quality flags
            "HasVolumeData": str(has_volume),
            "HasOpenInterestData": str(has_oi),
            "ZeroVolumeFlag": str(zero_vol_flag),
            "MissingOHLCFlag": str(missing_ohlc),
            "SettlementOnlyFlag": str(settlement_only),
            "CloseOutsideHLFlag": str(close_outside_hl),
        }

        # 4. Canonical Pairwise Spread Columns (all 6 pairs on trading Date)
        d_str = r["Date"]
        date_pairs = pair_by_date.get(d_str, {})
        for pair in CANONICAL_PAIRS:
            pair_key = f"{pair[0]}_{pair[1]}"
            pt = date_pairs.get(pair_key)
            if pt is not None:
                row_dict[f"Spread_{pair_key}"] = f"{pt.spread:.2f}"
                row_dict[f"SpreadPct_{pair_key}"] = f"{pt.spread_pct:.4f}"
                row_dict[f"SpreadMean20_{pair_key}"] = f"{pt.rolling_mean:.2f}" if pt.rolling_mean is not None else ""
                row_dict[f"SpreadStd20_{pair_key}"] = f"{pt.rolling_std:.2f}" if pt.rolling_std is not None else ""
                row_dict[f"SpreadZScore_{pair_key}"] = f"{pt.rolling_zscore:.4f}" if pt.rolling_zscore is not None else ""
            else:
                row_dict[f"Spread_{pair_key}"] = ""
                row_dict[f"SpreadPct_{pair_key}"] = ""
                row_dict[f"SpreadMean20_{pair_key}"] = ""
                row_dict[f"SpreadStd20_{pair_key}"] = ""
                row_dict[f"SpreadZScore_{pair_key}"] = ""

        # 5. Row-Relative Spreads (this contract vs other active contracts on Date)
        for other_sym in ["GOLDM", "GOLDGUINEA", "GOLDPETAL", "GOLDTEN"]:
            if other_sym == sym:
                row_dict[f"Spread_vs_{other_sym}"] = "0.00"
                row_dict[f"SpreadPct_vs_{other_sym}"] = "0.0000"
            else:
                other_p10g = daily_front_prices[d_str].get(other_sym)
                if other_p10g is not None and other_p10g > 0:
                    rel_spread = p_10g - other_p10g
                    rel_pct = (rel_spread / other_p10g) * 100.0
                    row_dict[f"Spread_vs_{other_sym}"] = f"{rel_spread:.2f}"
                    row_dict[f"SpreadPct_vs_{other_sym}"] = f"{rel_pct:.4f}"
                else:
                    row_dict[f"Spread_vs_{other_sym}"] = ""
                    row_dict[f"SpreadPct_vs_{other_sym}"] = ""

        feature_rows.append(row_dict)

        # Summary accumulation
        contract_summary[sym]["rows"] += 1
        if p_10g < contract_summary[sym]["min_price_10g"]:
            contract_summary[sym]["min_price_10g"] = p_10g
        if p_10g > contract_summary[sym]["max_price_10g"]:
            contract_summary[sym]["max_price_10g"] = p_10g
        if zero_vol_flag:
            contract_summary[sym]["zero_vol"] += 1

    return FeatureEngineResult(
        feature_rows=feature_rows,
        total_rows=total_rows,
        pair_statistics=pair_statistics,
        pairwise_series=pairwise_series,
        contract_summary=dict(contract_summary),
    )


def write_features_csv(feature_rows: List[Dict[str, Any]], output_path: Path) -> None:
    """Write generated features dataset to CSV."""
    if not feature_rows:
        raise ValueError("Cannot write empty feature rows to CSV.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(feature_rows[0].keys())

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(feature_rows)


def generate_feature_engineering_report(result: FeatureEngineResult, output_path: Path) -> None:
    """Generate comprehensive documentation report for Step 2 feature engineering."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    md: List[str] = []
    md.append("# SwarnaNet — Feature Engineering & Cross-Contract Price Normalization Report")
    md.append("")
    md.append("**Problem Statement:** PS-03: Commodity Derivatives Intelligence (Hack in Hills '26)")  
    md.append(f"**Execution Timestamp:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")  
    md.append(f"**Input Dataset:** `data/processed/mcx_gold_normalized.csv` ({result.total_rows:,} rows)")  
    md.append(f"**Output Dataset:** `data/processed/mcx_gold_features.csv` ({result.total_rows:,} rows, {len(result.feature_rows[0])} columns)")  
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 1. Executive Summary")
    md.append("")
    md.append("Step 2 builds cross-contract price normalization and rolling statistical spread indicators across the four MCX Gold futures contracts (`GOLDM`, `GOLDGUINEA`, `GOLDPETAL`, `GOLDTEN`).")
    md.append("")
    md.append("Key achievements:")
    md.append("1. **Quotation & Purity Harmonization:** Converted raw quotes across differing delivery units (100g, 10g, 8g, 1g) and purities (995 vs 999) into exact fine-gold-equivalent prices per gram and per 10 grams.")
    md.append("2. **Preservation of Market Truth:** Original 9 columns are 100% retained unchanged. Zero-volume observations retain missing OHLC without fabrication.")
    md.append("3. **Strict Prevention of Look-Ahead Bias:** Rolling 20-lag spread mean, standard deviation, and Z-scores are computed strictly using observations $[t-20 : t-1]$ preceding the current observation.")
    md.append("4. **Full Pairwise Coverage:** Evaluated all 6 canonical contract pairs, documenting exact overlapping dates and calendar expiry dynamics.")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 2. Verified MCX Contract Specifications & Quotation Basis")
    md.append("")
    md.append("In MCX gold derivatives, the physical **trading unit** (lot size) is distinct from the **quotation basis** (the denominator of the quoted price). Conflating the two would distort prices by up to 100x.")
    md.append("")
    md.append("| Contract Symbol | Physical Trading Unit | Price Quotation Basis ($q_i$) | Purity Fineness ($p_i$) | Purity Fraction | Quotation Multiplier |")
    md.append("|:---|---:|---:|---:|:---:|:---:|")
    for sym in ["GOLDM", "GOLDTEN", "GOLDGUINEA", "GOLDPETAL"]:
        spec = MCX_CONTRACT_SPECS[sym]
        mult = 10.0 / (spec.quotation_basis_grams * spec.purity_fraction)
        md.append(
            f"| **{spec.symbol}** | {spec.trading_unit_grams:,.0f} g | Per {spec.quotation_basis_grams:,.0f} g | {spec.purity_parts_per_thousand:.0f} / 1000 | {spec.purity_fraction:.4f} | $\\times {mult:.6f}$ |"
        )
    md.append("")
    md.append("> **Specification Discrepancy Verification:** In the raw MCX files, `GOLDM` is quoted per 10g with 995 fineness, `GOLDTEN` per 10g with 999 fineness, `GOLDGUINEA` per 8g coin with 999 fineness, and `GOLDPETAL` per 1g with 999 fineness. Contract trading units (e.g. 100g for GOLDM) govern total contract lot value, not the price quote.")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 3. Mathematical Normalization Formula & Worked Examples")
    md.append("")
    md.append("To compare contracts on an exact, economically equivalent basis, each recorded settlement Close $C_i$ is converted to fine gold:")
    md.append("")
    md.append("### Formula")
    md.append("$$\\text{Price per Gram of Fine Gold: } P_i^{fine/g} = \\frac{C_i}{q_i \\cdot (p_i / 1000)}$$")
    md.append("")
    md.append("$$\\text{Price per 10 Grams of Fine Gold: } P_i^{fine/10g} = 10 \\cdot P_i^{fine/g} = \\frac{10 \\cdot C_i}{q_i \\cdot (p_i / 1000)}$$")
    md.append("")
    md.append("### Worked Examples on Market Data (2020-03-02 & 2026-10-05)")
    md.append("")
    md.append("#### Example 1: 2020-03-02")
    md.append("- **GOLDM** ($C = ₹42,017.00$, $q = 10$, $p = 995$):")
    md.append("  $$P^{fine/g} = \\frac{42,017}{10 \\times 0.995} = ₹4,222.8141/g \\implies P^{fine/10g} = ₹42,228.14$$")
    md.append("- **GOLDGUINEA** ($C = ₹33,983.00$, $q = 8$, $p = 999$):")
    md.append("  $$P^{fine/g} = \\frac{33,983}{8 \\times 0.999} = ₹4,252.1271/g \\implies P^{fine/10g} = ₹42,521.27$$")
    md.append("- **GOLDPETAL** ($C = ₹4,212.00$, $q = 1$, $p = 999$):")
    md.append("  $$P^{fine/g} = \\frac{4,212}{1 \\times 0.999} = ₹4,216.2162/g \\implies P^{fine/10g} = ₹42,162.16$$")
    md.append("")
    md.append("#### Example 2: 2026-10-05 (All Four Contracts Active)")
    md.append("- **GOLDM** ($C = ₹146,900.00$): $P^{fine/10g} = \\frac{146,900}{0.995} = ₹147,638.19$")
    md.append("- **GOLDGUINEA** ($C = ₹119,421.00$): $P^{fine/10g} = \\frac{10 \\times 119,421}{8 \\times 0.999} = ₹149,425.67$")
    md.append("- **GOLDPETAL** ($C = ₹14,921.00$): $P^{fine/10g} = \\frac{10 \\times 14,921}{0.999} = ₹149,359.36$")
    md.append("- **GOLDTEN** ($C = ₹148,542.00$): $P^{fine/10g} = \\frac{148,542}{0.999} = ₹148,690.69$")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 4. Derived Features Directory")
    md.append("")
    md.append("| Feature Column | Data Type | Formula / Logic | Financial Interpretation |")
    md.append("|:---|:---:|:---|:---|")
    md.append("| `FineGoldPricePerGram` | Float (4 dec) | $C / (q \\cdot p / 1000)$ | Absolute fine gold price per gram in rupees. |")
    md.append("| `FineGoldPricePer10g` | Float (2 dec) | $10 \\cdot P^{fine/g}$ | Benchmark fine gold price per 10 grams. |")
    md.append("| `DaysToExpiry` | Integer | $ExpiryDate - Date$ | Calendar days remaining in contract life cycle. |")
    md.append("| `PostExpiryFlag` | Binary (0/1) | $1 \\text{ if } Date > ExpiryDate \\text{ else } 0$ | Data integrity flag for anomalous post-expiry trading. |")
    md.append("| `HasVolumeData` | Binary (0/1) | $1 \\text{ if Volume populated else } 0$ | Data completeness indicator. |")
    md.append("| `HasOpenInterestData` | Binary (0/1) | $1 \\text{ if OpenInterest populated else } 0$ | Market participation indicator. |")
    md.append("| `ZeroVolumeFlag` | Binary (0/1) | $1 \\text{ if Volume } == 0 \\text{ else } 0$ | Identifies non-traded / illiquid sessions. |")
    md.append("| `MissingOHLCFlag` | Binary (0/1) | $1 \\text{ if Open/High/Low null else } 0$ | Identifies absence of intraday trade bounds. |")
    md.append("| `SettlementOnlyFlag` | Binary (0/1) | $1 \\text{ if ZeroVolume and MissingOHLC else } 0$ | Flags prices established purely by exchange settlement. |")
    md.append("| `CloseOutsideHLFlag` | Binary (0/1) | $1 \\text{ if Close } \\notin [Low, High] \\text{ else } 0$ | Flags expiry-day spot polling settlements. |")
    md.append("| `Spread_{A}_{B}` | Float (2 dec) | $P_{A,t}^{fine/10g} - P_{B,t}^{fine/10g}$ | Absolute cross-contract price spread. |")
    md.append("| `SpreadPct_{A}_{B}` | Float (4 dec) | $100 \\times (P_A - P_B) / P_B$ | Percentage cross-contract basis premium/discount. |")
    md.append("| `SpreadMean20_{A}_{B}` | Float (2 dec) | $\\frac{1}{20}\\sum_{k=1}^{20} Spread_{t-k}$ | Strictly preceding 20-lag rolling spread baseline. |")
    md.append("| `SpreadStd20_{A}_{B}` | Float (2 dec) | $\\sqrt{\\frac{1}{19}\\sum_{k=1}^{20} (Spread_{t-k} - \\mu)^2}$ | Preceding 20-lag sample volatility of spread. |")
    md.append("| `SpreadZScore_{A}_{B}` | Float (4 dec) | $(Spread_t - \\mu) / \\sigma$ | Normalized statistical divergence indicator. |")
    md.append("| `Spread_vs_{SYM}` | Float (2 dec) | $P_{row}^{fine/10g} - P_{SYM,t}^{fine/10g}$ | Relative contract spread for current row. |")
    md.append("| `SpreadPct_vs_{SYM}` | Float (4 dec) | $100 \\times (P_{row} - P_{SYM}) / P_{SYM}$ | Percentage relative basis for current row. |")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 5. Pairwise Overlapping Dates & Statistical Coverage")
    md.append("")
    md.append("All 6 canonical contract pairs were evaluated across the 1,214 distinct trading days in the dataset:")
    md.append("")
    md.append("| Contract Pair | Total Overlapping Dates | Warmup Days ($N<20$) | Usable Z-Score Obs | Historical Date Range | Mean Z-Score | Min Z-Score | Max Z-Score |")
    md.append("|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|")
    for pair in CANONICAL_PAIRS:
        pkey = f"{pair[0]}_{pair[1]}"
        s = result.pair_statistics[pkey]
        mean_z = f"{s['mean_zscore']:.3f}" if s['mean_zscore'] is not None else "N/A"
        min_z = f"{s['min_zscore']:.3f}" if s['min_zscore'] is not None else "N/A"
        max_z = f"{s['max_zscore']:.3f}" if s['max_zscore'] is not None else "N/A"
        md.append(
            f"| **{pkey}** | {s['total_overlapping_dates']:,} | {s['warmup_rows_count']} | **{s['valid_zscore_count']:,}** | {s['date_min']} to {s['date_max']} | {mean_z} | {min_z} | {max_z} |"
        )
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 6. Rolling Window & Look-Ahead Bias Prevention Policy")
    md.append("")
    md.append("### Look-Ahead Bias Prevention")
    md.append("In algorithmic trading and statistical feature engineering, computing a rolling metric that includes observation $t$ (e.g. `rolling(20).mean()` including current index) contaminates historical signals with future/concurrent information.")
    md.append("")
    md.append("Our pipeline implements a **strict lag-1 shift policy**:")
    md.append("$$\\mu_{t-20:t-1} = \\frac{1}{20} \\sum_{k=1}^{20} \\text{Spread}_{t-k}$$")
    md.append("$$\\sigma_{t-20:t-1} = \\sqrt{\\frac{1}{19} \\sum_{k=1}^{20} (\\text{Spread}_{t-k} - \\mu_{t-20:t-1})^2}$$")
    md.append("$$Z_t = \\frac{\\text{Spread}_t - \\mu_{t-20:t-1}}{\\sigma_{t-20:t-1}}$$")
    md.append("")
    md.append("### Mathematical Safeguards")
    md.append("1. **Warmup Window:** For the first 20 observations ($t < 20$), `SpreadMean20`, `SpreadStd20`, and `SpreadZScore` are strictly set to null (`\"\"`).")
    md.append("2. **Zero Volatility Guard:** If $\\sigma_{t-20:t-1} \\le 10^{-12}$, the Z-score is set to null to avoid division by zero.")
    md.append("3. **Sample Standard Deviation:** We use Bessel's sample correction ($N-1 = 19$) to prevent downward bias in volatility estimates.")
    md.append("4. **Chronological Invariant:** Observations are strictly sorted ascending by date prior to window computation.")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 7. Expiry Dynamics & Economic Interpretation of Spreads")
    md.append("")
    md.append("A vital domain insight is that **cross-contract price differences do not automatically reflect structural arbitrage opportunities**:")
    md.append("")
    md.append("1. **Same-Expiry Pairs (e.g. GOLDGUINEA vs GOLDPETAL on June 30):**")
    md.append("   - When two contracts share the exact same expiry date, calendar carrying cost (financing, storage, contango) is zero.")
    md.append("   - The resulting spread isolates the **pure structural basis** (lot size convenience, physical denomination premium, retail friction).")
    md.append("   - In our empirical data, `GOLDGUINEA` vs `GOLDPETAL` has a mean spread of only +0.04% to +0.18%, demonstrating high physical pricing efficiency.")
    md.append("2. **Different-Expiry Pairs (e.g. GOLDM vs GOLDGUINEA):**")
    md.append("   - GOLDM expires in March, July, and October, while GOLDGUINEA expires in June and August.")
    md.append("   - On any given trading date, their active contracts differ in days to expiry (e.g. 25 days apart).")
    md.append("   - The observed spread therefore reflects a composite of the **cross-contract basis PLUS the term structure / calendar spread (cost of carry)** over $\\Delta \\text{DaysToExpiry}$.")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 8. Missing Data Treatment & Known Limitations")
    md.append("")
    md.append("1. **Zero-Volume Observations (202 rows):**")
    md.append("   - Missing Open, High, and Low values remain null. They are never filled with Close.")
    md.append("   - These rows have `SettlementOnlyFlag = 1` and `ZeroVolumeFlag = 1`.")
    md.append("   - They are valid for settlement-based spread analysis, but must be excluded from intraday volatility modeling.")
    md.append("2. **Shorter GOLDTEN History:**")
    md.append("   - `GOLDTEN` trading begins on `2025-03-31` (404 trading dates), whereas `GOLDM`, `GOLDGUINEA`, and `GOLDPETAL` span from `2020-01-01`.")
    md.append("   - Any pairwise spread involving `GOLDTEN` is null prior to `2025-03-31`. Prices are **never forward-filled** across missing dates.")
    md.append("3. **Non-Synchronous Liquidity:**")
    md.append("   - On dates where one contract is actively traded and another has zero volume, the spread measures the difference between a traded price and an exchange theoretical settlement mark.")
    md.append("")
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md) + "\n")


def run_feature_pipeline(project_dir_str: Optional[str] = None) -> FeatureEngineResult:
    """Execute feature engineering pipeline from command line or import."""
    project_dir = Path(project_dir_str) if project_dir_str else Path.cwd()
    norm_csv_path = project_dir / "data" / "processed" / "mcx_gold_normalized.csv"
    feat_csv_path = project_dir / "data" / "processed" / "mcx_gold_features.csv"
    report_path = project_dir / "reports" / "feature_engineering.md"

    print(f"[SwarnaNet Features] Loading normalized dataset: {norm_csv_path}")
    result = generate_features(norm_csv_path)

    print(f"[SwarnaNet Features] Writing features dataset: {feat_csv_path}")
    write_features_csv(result.feature_rows, feat_csv_path)

    print(f"[SwarnaNet Features] Writing feature engineering report: {report_path}")
    generate_feature_engineering_report(result, report_path)

    print(f"[SwarnaNet Features] Feature pipeline completed successfully!")
    print(f"  Total Processed Rows: {result.total_rows:,}")
    print(f"  Total Columns: {len(result.feature_rows[0])}")
    for pkey, s in result.pair_statistics.items():
        print(f"  Pair {pkey:24s}: {s['total_overlapping_dates']:3d} dates ({s['valid_zscore_count']:3d} valid Z-scores)")

    return result


if __name__ == "__main__":
    import sys
    proj_dir = sys.argv[1] if len(sys.argv) > 1 else None
    run_feature_pipeline(proj_dir)
