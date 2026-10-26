"""
Unit Test Suite for SwarnaNet Feature Engineering & Cross-Contract Normalization
Validates pricing formulas, specifications, calendar math, pairwise alignment,
rolling statistics, look-ahead bias prevention, and error guards.
"""

import csv
import math
from datetime import date, datetime, timedelta
from pathlib import Path
import pytest

from src.pipeline.features import (
    MCX_CONTRACT_SPECS,
    ContractSpec,
    calculate_fine_gold_price_per_gram,
    calculate_fine_gold_price_per_10g,
    calculate_days_to_expiry,
    compute_pairwise_rolling_statistics,
    PairwisePoint,
)

PROJECT_DIR = Path(__file__).resolve().parent.parent
NORMALIZED_CSV = PROJECT_DIR / "data" / "processed" / "mcx_gold_normalized.csv"
FEATURES_CSV = PROJECT_DIR / "data" / "processed" / "mcx_gold_features.csv"
FEATURE_REPORT = PROJECT_DIR / "reports" / "feature_engineering.md"


# 1. Normalization formula for all four contracts
def test_normalization_formula_all_contracts():
    """Verify fine gold price formula on exact theoretical test vectors for all 4 contracts."""
    # GOLDM: 10g quotation basis, 995 purity
    spec_goldm = MCX_CONTRACT_SPECS["GOLDM"]
    close_m = 50000.00
    expected_m_gram = 50000.0 / (10.0 * 0.995)
    expected_m_10g = 10.0 * expected_m_gram
    assert math.isclose(calculate_fine_gold_price_per_gram(close_m, spec_goldm), expected_m_gram, rel_tol=1e-7)
    assert math.isclose(calculate_fine_gold_price_per_10g(close_m, spec_goldm), expected_m_10g, rel_tol=1e-7)

    # GOLDTEN: 10g quotation basis, 999 purity
    spec_goldten = MCX_CONTRACT_SPECS["GOLDTEN"]
    close_ten = 50000.00
    expected_ten_gram = 50000.0 / (10.0 * 0.999)
    expected_ten_10g = 10.0 * expected_ten_gram
    assert math.isclose(calculate_fine_gold_price_per_gram(close_ten, spec_goldten), expected_ten_gram, rel_tol=1e-7)
    assert math.isclose(calculate_fine_gold_price_per_10g(close_ten, spec_goldten), expected_ten_10g, rel_tol=1e-7)

    # GOLDGUINEA: 8g quotation basis, 999 purity
    spec_guinea = MCX_CONTRACT_SPECS["GOLDGUINEA"]
    close_guinea = 40000.00 # 5000 per g
    expected_guinea_gram = 40000.0 / (8.0 * 0.999)
    expected_guinea_10g = 10.0 * expected_guinea_gram
    assert math.isclose(calculate_fine_gold_price_per_gram(close_guinea, spec_guinea), expected_guinea_gram, rel_tol=1e-7)
    assert math.isclose(calculate_fine_gold_price_per_10g(close_guinea, spec_guinea), expected_guinea_10g, rel_tol=1e-7)

    # GOLDPETAL: 1g quotation basis, 999 purity
    spec_petal = MCX_CONTRACT_SPECS["GOLDPETAL"]
    close_petal = 5000.00
    expected_petal_gram = 5000.0 / (1.0 * 0.999)
    expected_petal_10g = 10.0 * expected_petal_gram
    assert math.isclose(calculate_fine_gold_price_per_gram(close_petal, spec_petal), expected_petal_gram, rel_tol=1e-7)
    assert math.isclose(calculate_fine_gold_price_per_10g(close_petal, spec_petal), expected_petal_10g, rel_tol=1e-7)


# 2. Correct handling of quotation basis and purity
def test_quotation_basis_and_purity_handling():
    """Verify that physical lot size is not conflated with quotation basis and purity is applied once."""
    spec_goldm = MCX_CONTRACT_SPECS["GOLDM"]
    # Physical lot size is 100g, but quote is per 10g
    assert spec_goldm.trading_unit_grams == 100.0
    assert spec_goldm.quotation_basis_grams == 10.0
    assert spec_goldm.purity_parts_per_thousand == 995.0

    # Ensure purity correction is exactly 995/1000
    assert math.isclose(spec_goldm.purity_fraction, 0.995)

    # An identical 999-purity price across GUINEA (8g) and PETAL (1g) must yield identical fine 10g price
    p_1g = 5000.0
    p_8g = 5000.0 * 8.0
    norm_guinea = calculate_fine_gold_price_per_10g(p_8g, MCX_CONTRACT_SPECS["GOLDGUINEA"])
    norm_petal = calculate_fine_gold_price_per_10g(p_1g, MCX_CONTRACT_SPECS["GOLDPETAL"])
    assert math.isclose(norm_guinea, norm_petal, rel_tol=1e-7)


# 3. Expiry-date preservation and days-to-expiry calculations
def test_expiry_date_preservation_and_days_to_expiry():
    """Verify days to expiry calendar difference and post-expiry flag logic."""
    d1 = date(2026, 10, 1)
    exp1 = date(2026, 10, 30)
    assert calculate_days_to_expiry(d1, exp1) == 29

    # Expiry day itself
    assert calculate_days_to_expiry(exp1, exp1) == 0

    # Past expiry day (anomalous scenario)
    d_past = date(2026, 10, 31)
    assert calculate_days_to_expiry(d_past, exp1) == -1

    # Verify actual features CSV
    with open(FEATURES_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    for r in reader:
        d = datetime.strptime(r["Date"], "%Y-%m-%d").date()
        exp = datetime.strptime(r["ExpiryDate"], "%Y-%m-%d").date()
        dte = int(r["DaysToExpiry"])
        assert dte == (exp - d).days
        if dte < 0:
            assert r["PostExpiryFlag"] == "1"
        else:
            assert r["PostExpiryFlag"] == "0"


# 4. Pairwise date alignment and missing contract observations
def test_pairwise_date_alignment_and_missing_contract_observations():
    """Verify that spreads are strictly computed only when both contracts trade on that date."""
    with open(FEATURES_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    # In 2020, GOLDTEN did not trade. Verify GOLDM_GOLDTEN spreads are empty on 2020 dates.
    rows_2020 = [r for r in reader if r["Date"].startswith("2020-")]
    assert len(rows_2020) > 0

    for r in rows_2020:
        assert r["Spread_GOLDM_GOLDTEN"] == ""
        assert r["SpreadPct_GOLDM_GOLDTEN"] == ""
        assert r["SpreadZScore_GOLDM_GOLDTEN"] == ""
        assert r["Spread_GOLDGUINEA_GOLDTEN"] == ""
        assert r["Spread_GOLDPETAL_GOLDTEN"] == ""

    # In 2026, when GOLDM and GOLDTEN both trade, spread is populated
    rows_2026_shared = [r for r in reader if r["Date"] == "2026-10-05"]
    assert len(rows_2026_shared) > 0
    sample_2026 = rows_2026_shared[0]
    assert sample_2026["Spread_GOLDM_GOLDTEN"] != ""
    assert sample_2026["SpreadPct_GOLDM_GOLDTEN"] != ""


# 5. Rolling mean, standard deviation, and Z-score
def test_rolling_mean_std_and_zscore():
    """Verify exact rolling mean, sample standard deviation (ddof=1), and Z-score calculations."""
    daily_prices = {}
    base_date = date(2024, 1, 1)

    # Generate 30 consecutive trading observations
    # Spreads: 100, 102, 104, ... 158
    for i in range(30):
        d_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_prices[d_str] = {
            "A": 50000.0 + (i * 2.0),
            "B": 49900.0,
        }

    points = compute_pairwise_rolling_statistics(daily_prices, ("A", "B"), window_size=20)
    assert len(points) == 30

    # Observation 20 (index 20) has exactly 20 preceding items (indices 0..19)
    # History spreads: 100, 102, 104, ..., 138 (arithmetic progression)
    expected_history = [100.0 + 2.0 * k for k in range(20)]
    expected_mean = sum(expected_history) / 20.0 # 119.0
    expected_var = sum((x - expected_mean) ** 2 for x in expected_history) / 19.0
    expected_std = math.sqrt(expected_var)

    current_spread = points[20].spread # 140.0
    expected_z = (current_spread - expected_mean) / expected_std

    assert points[20].rolling_mean is not None
    assert math.isclose(points[20].rolling_mean, expected_mean, rel_tol=1e-7)
    assert math.isclose(points[20].rolling_std, expected_std, rel_tol=1e-7)
    assert math.isclose(points[20].rolling_zscore, expected_z, rel_tol=1e-7)


# 6. Prevention of look-ahead bias
def test_prevention_of_look_ahead_bias():
    """Verify that observation t does NOT influence rolling mean or std at t."""
    daily_prices_base = {}
    daily_prices_shock = {}
    base_date = date(2024, 1, 1)

    # 25 dates
    for i in range(25):
        d_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_prices_base[d_str] = {"A": 50000.0, "B": 49000.0}
        # In shocked dataset, apply massive price spike at index 20
        if i == 20:
            daily_prices_shock[d_str] = {"A": 999999.0, "B": 49000.0}
        else:
            daily_prices_shock[d_str] = {"A": 50000.0, "B": 49000.0}

    points_base = compute_pairwise_rolling_statistics(daily_prices_base, ("A", "B"), window_size=20)
    points_shock = compute_pairwise_rolling_statistics(daily_prices_shock, ("A", "B"), window_size=20)

    # At index 20, the rolling mean and std MUST BE IDENTICAL because the window covers [0..19]
    assert points_base[20].rolling_mean == points_shock[20].rolling_mean
    assert points_base[20].rolling_std == points_shock[20].rolling_std

    # But at index 21, the shock has entered the historical window [1..20], so they must differ
    assert points_base[21].rolling_mean != points_shock[21].rolling_mean


# 7. Insufficient rolling history and zero standard deviation
def test_insufficient_rolling_history_and_zero_std():
    """Verify None/empty outputs during warmup and when variance is zero."""
    daily_prices = {}
    base_date = date(2024, 1, 1)

    # Constant spread: std = 0
    for i in range(30):
        d_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_prices[d_str] = {"A": 50000.0, "B": 49000.0} # spread constantly 1000.0

    points = compute_pairwise_rolling_statistics(daily_prices, ("A", "B"), window_size=20)

    # Warmup period (<20 preceding)
    for i in range(20):
        assert points[i].rolling_mean is None
        assert points[i].rolling_std is None
        assert points[i].rolling_zscore is None

    # After warmup, std is 0 -> Z-score must be None to prevent division by zero
    for i in range(20, 30):
        assert points[i].rolling_mean == 1000.0
        assert points[i].rolling_std == 0.0
        assert points[i].rolling_zscore is None


# 8. Missing OHLC values and settlement-only rows
def test_missing_ohlc_and_settlement_only_rows():
    """Verify that 202 zero-volume rows retain empty OHLC and correct SettlementOnlyFlag."""
    with open(FEATURES_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    settlement_only_rows = [r for r in reader if r["SettlementOnlyFlag"] == "1"]
    assert len(settlement_only_rows) == 202

    for r in settlement_only_rows:
        assert r["Volume"] == "0"
        assert r["ZeroVolumeFlag"] == "1"
        assert r["MissingOHLCFlag"] == "1"
        assert r["Open"] == ""
        assert r["High"] == ""
        assert r["Low"] == ""
        assert r["Close"] != ""
        assert r["FineGoldPricePer10g"] != ""


# 9. Protection against invalid or zero spread denominators
def test_protection_against_invalid_or_zero_spread_denominators():
    """Verify that percentage spread calculation handles zero or missing denominator safely."""
    daily_prices = {
        "2024-01-01": {"A": 50000.0, "B": 0.0}, # zero denominator
        "2024-01-02": {"A": 50000.0, "B": 50000.0},
    }
    points = compute_pairwise_rolling_statistics(daily_prices, ("A", "B"), window_size=20)
    assert len(points) == 2
    # At date 1, denominator is 0, percentage spread must be 0.0 (or guarded against exception)
    assert points[0].spread_pct == 0.0
    assert points[1].spread_pct == 0.0
