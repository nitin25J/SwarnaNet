"""
Unit Test Suite for SwarnaNet Backtesting Engine
Validates signal timing, expiry handling, missing data guards, position closure,
transaction cost application, and chronological train/test separation.
"""

import csv
import json
import math
from datetime import date, timedelta
from pathlib import Path
import pytest

from src.backtest.engine import (
    BacktestConfig,
    PairedDailyData,
    run_backtest_simulation,
    calculate_period_metrics,
)

PROJECT_DIR = Path(__file__).resolve().parent.parent
TRADES_CSV = PROJECT_DIR / "data" / "processed" / "backtest_trades.csv"
EQUITY_CSV = PROJECT_DIR / "data" / "processed" / "backtest_equity.csv"
METRICS_JSON = PROJECT_DIR / "data" / "processed" / "backtest_metrics.json"
BACKTEST_REPORT = PROJECT_DIR / "reports" / "backtest_report.md"
EQUITY_PLOT = PROJECT_DIR / "reports" / "figures" / "backtest_equity_curve.png"


def create_synthetic_paired_point(
    day_idx: int,
    z_score: float,
    close_a: float = 40000.0,
    close_b: float = 5000.0,
    vol_a: int = 100,
    vol_b: int = 500,
    dte_a: int = 30,
    dte_b: int = 30,
) -> PairedDailyData:
    """Helper to generate deterministic synthetic paired observation."""
    d = date(2022, 1, 1) + timedelta(days=day_idx)
    d_str = d.strftime("%Y-%m-%d")
    return PairedDailyData(
        date_str=d_str,
        date_obj=d,
        z_score=z_score,
        spread=close_a - close_b * 8.0,
        price_a_10g=close_a * 1.25,
        price_b_10g=close_b * 10.0,
        close_a=close_a,
        close_b=close_b,
        open_a=close_a,
        open_b=close_b,
        volume_a=vol_a,
        volume_b=vol_b,
        expiry_a=(d + timedelta(days=dte_a)).strftime("%Y-%m-%d"),
        expiry_b=(d + timedelta(days=dte_b)).strftime("%Y-%m-%d"),
        dte_a=dte_a,
        dte_b=dte_b,
    )


# 1. Signal timing & lag-1 forward execution (no look-ahead)
def test_signal_timing_lag1():
    """Verify that signal at day t enters position strictly on day t+1 without look-ahead."""
    config = BacktestConfig(z_entry=1.5, z_exit=0.0)
    
    # Day 0: Z = 0 (no signal)
    # Day 1: Z = -2.0 (Long signal generated at close)
    # Day 2: Execution entry day at Day 2 prices
    # Day 3: Z = +0.5 (Exit signal generated at close)
    # Day 4: Execution exit day
    data = [
        create_synthetic_paired_point(0, z_score=0.0, close_a=40000.0, close_b=5000.0),
        create_synthetic_paired_point(1, z_score=-2.0, close_a=39900.0, close_b=5000.0),
        create_synthetic_paired_point(2, z_score=-1.8, close_a=39920.0, close_b=5000.0),
        create_synthetic_paired_point(3, z_score=0.5, close_a=40050.0, close_b=5000.0),
        create_synthetic_paired_point(4, z_score=0.2, close_a=40060.0, close_b=5000.0),
    ]

    trades, equity = run_backtest_simulation(data, config)
    assert len(trades) == 1
    t = trades[0]
    # Signal at Day 1 -> Entry date MUST be Day 2
    assert t.entry_date == data[2].date_str
    assert t.entry_price_a == data[2].close_a
    # Signal exit at Day 3 -> Exit date at Day 3 close
    assert t.exit_date == data[3].date_str
    assert t.direction == "Long Spread"


# 2. Expiry handling and forced position closure
def test_expiry_handling_and_forced_closure():
    """Verify forced exit prior to expiry and prevention of entry near expiry."""
    config = BacktestConfig(z_entry=1.5, z_exit=0.0, min_days_to_expiry_entry=5, forced_expiry_exit_days=1)

    # Test entry rejection when DTE <= 5
    data_near_exp = [
        create_synthetic_paired_point(0, z_score=-2.0, dte_a=4, dte_b=4),
        create_synthetic_paired_point(1, z_score=-2.0, dte_a=3, dte_b=3),
    ]
    trades_rejection, _ = run_backtest_simulation(data_near_exp, config)
    assert len(trades_rejection) == 0, "Trade opened despite DTE <= 5 near expiry!"

    # Test forced exit when DTE reaches 1
    data_forced_exit = [
        create_synthetic_paired_point(0, z_score=0.0, dte_a=10, dte_b=10),
        create_synthetic_paired_point(1, z_score=-2.0, dte_a=9, dte_b=9), # Entry signal
        create_synthetic_paired_point(2, z_score=-2.0, dte_a=8, dte_b=8), # Enters position
        create_synthetic_paired_point(3, z_score=-1.8, dte_a=1, dte_b=1), # Hits DTE=1 -> forced expiry exit!
        create_synthetic_paired_point(4, z_score=-1.8, dte_a=0, dte_b=0),
    ]
    trades_exp, _ = run_backtest_simulation(data_forced_exit, config)
    assert len(trades_exp) == 1
    assert trades_exp[0].exit_reason == "Expiry Close"


# 3. Missing data and zero-volume blocking
def test_missing_data_and_zero_volume_blocking():
    """Verify that positions cannot be entered on zero-volume days."""
    config = BacktestConfig(z_entry=1.5, z_exit=0.0)

    # Signal at Day 1, but Day 2 has zero volume in Contract A
    # Day 3 has zero volume in Contract B
    # Both days have zero volume -> entry must be completely blocked!
    data = [
        create_synthetic_paired_point(0, z_score=0.0, vol_a=100, vol_b=100),
        create_synthetic_paired_point(1, z_score=-2.0, vol_a=100, vol_b=100), # Signal
        create_synthetic_paired_point(2, z_score=-2.0, vol_a=0, vol_b=100),   # Next day has 0 volume!
        create_synthetic_paired_point(3, z_score=-2.0, vol_a=100, vol_b=0),   # Next day has 0 volume!
    ]
    trades, _ = run_backtest_simulation(data, config)
    # Entry must be blocked on all days with zero volume
    assert len(trades) == 0


# 4. Position closure and PnL calculation across Long and Short spreads
def test_position_closure_and_pnl_calculation():
    """Verify exact physical lot sizing and gross PnL calculation for Long and Short spreads."""
    config = BacktestConfig(z_entry=1.5, z_exit=0.0, contract_a_ratio=1.0, contract_b_ratio=8.0)

    # 1. Long Spread test: Long 1 GUINEA @ 40000, Short 8 PETAL @ 5000 (Spread = 40000 - 40000 = 0)
    # Exit: GUINEA @ 40200 (+200), PETAL @ 4980 (gain on short: (5000 - 4980)*8 = +160)
    # Total Gross PnL = +200 + 160 = +360
    data_long = [
        create_synthetic_paired_point(0, z_score=0.0),
        create_synthetic_paired_point(1, z_score=-2.0), # Long signal
        create_synthetic_paired_point(2, z_score=-1.8, close_a=40000.0, close_b=5000.0), # Entry
        create_synthetic_paired_point(3, z_score=0.5, close_a=40200.0, close_b=4980.0),  # Exit target
    ]
    trades_long, _ = run_backtest_simulation(data_long, config)
    assert len(trades_long) == 1
    assert math.isclose(trades_long[0].pnl_leg_a, 200.0)
    assert math.isclose(trades_long[0].pnl_leg_b, 160.0)
    assert math.isclose(trades_long[0].gross_pnl, 360.0)

    # 2. Short Spread test: Short 1 GUINEA @ 40200, Long 8 PETAL @ 4980
    # Exit: GUINEA @ 40000 (+200 on short), PETAL @ 5000 (+160 on long)
    # Total Gross PnL = +200 + 160 = +360
    data_short = [
        create_synthetic_paired_point(0, z_score=0.0),
        create_synthetic_paired_point(1, z_score=2.0), # Short signal
        create_synthetic_paired_point(2, z_score=1.8, close_a=40200.0, close_b=4980.0), # Entry
        create_synthetic_paired_point(3, z_score=-0.5, close_a=40000.0, close_b=5000.0),  # Exit target
    ]
    trades_short, _ = run_backtest_simulation(data_short, config)
    assert len(trades_short) == 1
    assert trades_short[0].direction == "Short Spread"
    assert math.isclose(trades_short[0].gross_pnl, 360.0)


# 5. Cost application tiers
def test_cost_application_tiers():
    """Verify transaction cost deduction across Low (6bps), Mod (15bps), and High (30bps) tiers."""
    config = BacktestConfig(z_entry=1.5, z_exit=0.0)
    data = [
        create_synthetic_paired_point(0, z_score=0.0),
        create_synthetic_paired_point(1, z_score=-2.0),
        create_synthetic_paired_point(2, z_score=-1.8, close_a=40000.0, close_b=5000.0), # Entry: 40000 + 40000 = 80000
        create_synthetic_paired_point(3, z_score=0.5, close_a=40000.0, close_b=5000.0),  # Exit: 40000 + 40000 = 80000
    ]
    trades, _ = run_backtest_simulation(data, config)
    assert len(trades) == 1
    t = trades[0]
    # Total turnover = 80000 + 80000 = 160000
    expected_turnover = 160000.0
    assert math.isclose(t.turnover, expected_turnover)
    assert math.isclose(t.cost_low, expected_turnover * (config.cost_tier_low_bps / 10000.0))
    assert math.isclose(t.cost_mod, expected_turnover * (config.cost_tier_mod_bps / 10000.0))
    assert math.isclose(t.cost_high, expected_turnover * (config.cost_tier_high_bps / 10000.0))
    assert math.isclose(t.net_pnl_mod, t.gross_pnl - t.cost_mod)


# 6. Chronological train/test separation
def test_chronological_train_test_separation():
    """Verify strict chronological assignment to in-sample vs out-of-sample partitions."""
    config = BacktestConfig(split_date_in_sample="2023-12-31")
    assert TRADES_CSV.exists()

    with open(TRADES_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))

    assert len(reader) > 0
    for r in reader:
        entry_d = r["entry_date"]
        is_in_sample = (r["is_in_sample"].lower() == "true")
        if entry_d <= config.split_date_in_sample:
            assert is_in_sample is True
        else:
            assert is_in_sample is False


# 7. Backtest artifacts exist and valid
def test_backtest_artifacts_exist():
    """Verify that all generated backtest files exist and contain valid schema."""
    assert TRADES_CSV.exists() and TRADES_CSV.stat().st_size > 0
    assert EQUITY_CSV.exists() and EQUITY_CSV.stat().st_size > 0
    assert METRICS_JSON.exists() and METRICS_JSON.stat().st_size > 0
    assert BACKTEST_REPORT.exists() and BACKTEST_REPORT.stat().st_size > 0
    assert EQUITY_PLOT.exists() and EQUITY_PLOT.stat().st_size > 0

    with open(METRICS_JSON, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    assert "in_sample" in metrics
    assert "out_of_sample" in metrics
    assert "full_dataset" in metrics
    assert metrics["full_dataset"]["total_trades"] == 42


# 8. Daily Mark-to-Market reconciliation with trade-level PnL
def test_daily_equity_trade_pnl_reconciliation():
    """Verify that cumulative daily mark-to-market equity PnL exactly equals trade-level PnL (0.00 discrepancy)."""
    with open(TRADES_CSV, "r", encoding="utf-8") as f:
        trades = list(csv.DictReader(f))
    with open(EQUITY_CSV, "r", encoding="utf-8") as f:
        equity = list(csv.DictReader(f))

    trade_gross_sum = sum(float(t["gross_pnl"]) for t in trades)
    daily_gross_sum = sum(float(e["daily_gross_pnl"]) for e in equity)
    assert math.isclose(trade_gross_sum, daily_gross_sum, abs_tol=1e-4), (
        f"Gross PnL mismatch: trades={trade_gross_sum}, equity={daily_gross_sum}"
    )

    trade_net_sum = sum(float(t["net_pnl_mod"]) for t in trades)
    daily_net_sum = sum(float(e["daily_net_pnl_mod"]) for e in equity)
    assert math.isclose(trade_net_sum, daily_net_sum, abs_tol=1e-4), (
        f"Net PnL mismatch: trades={trade_net_sum}, equity={daily_net_sum}"
    )


# 9. No pre-entry price movement credited on entry day
def test_pre_entry_movement_timing():
    """Verify that a position entered on day t+1 receives 0.0 PnL on entry day (no unearned pre-entry gain)."""
    config = BacktestConfig(z_entry=1.5, z_exit=0.0)
    # Day 0: flat (Z=0)
    # Day 1: signal generated (Z=-2.0). Price A moves from 40000 to 40100 on Day 2.
    # Day 2: entry day at close. Trade enters at 40100. Price movement 40000 -> 40100 MUST NOT be credited!
    data = [
        create_synthetic_paired_point(0, z_score=0.0, close_a=40000.0, close_b=5000.0),
        create_synthetic_paired_point(1, z_score=-2.0, close_a=40000.0, close_b=5000.0),
        create_synthetic_paired_point(2, z_score=-1.8, close_a=40100.0, close_b=5000.0),
        create_synthetic_paired_point(3, z_score=0.5, close_a=40200.0, close_b=5000.0),
    ]
    trades, equity = run_backtest_simulation(data, config)
    assert len(trades) == 1
    # Day 2 is the entry day: daily gross pnl must be 0.0
    day2_equity = [e for e in equity if e.date_str == data[2].date_str][0]
    assert math.isclose(day2_equity.daily_gross_pnl, 0.0), (
        f"Pre-entry price movement was credited on entry day: {day2_equity.daily_gross_pnl}"
    )
    # Total trade gross PnL = 40200 - 40100 = 100
    assert math.isclose(trades[0].gross_pnl, 100.0)
    assert math.isclose(sum(e.daily_gross_pnl for e in equity), 100.0)


# 10. Net Sharpe ratio genuinely represents net returns with transaction costs
def test_net_sharpe_ratio_authenticity():
    """Verify that Net Sharpe ratio reflects transaction costs and is negative for unprofitable strategy."""
    with open(METRICS_JSON, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    full = metrics["full_dataset"]
    # Strategy loses -10,380.76 net; therefore net Sharpe ratio must be negative
    assert full["net_pnl_mod"] < 0, "Net PnL should be negative after costs"
    assert full["sharpe_ratio_annualized"] < 0, (
        f"Net Sharpe ratio should be negative for net losing strategy, got {full['sharpe_ratio_annualized']}"
    )


# 11. Report and JSON metrics consistency
def test_report_and_metrics_consistency():
    """Verify that reports/backtest_report.md executive summary and tables agree with backtest_metrics.json."""
    with open(METRICS_JSON, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    with open(BACKTEST_REPORT, "r", encoding="utf-8") as f:
        report_text = f.read()

    full_net_str = f"₹{metrics['full_dataset']['net_pnl_mod']:,.2f}"
    is_net_str = f"₹{metrics['in_sample']['net_pnl_mod']:,.2f}"
    oos_net_str = f"₹{metrics['out_of_sample']['net_pnl_mod']:,.2f}"

    assert full_net_str in report_text, f"Full net PnL {full_net_str} not in report"
    assert is_net_str in report_text, f"In-sample net PnL {is_net_str} not in report"
    assert oos_net_str in report_text, f"Out-of-sample net PnL {oos_net_str} not in report"
    # Ensure contradictory draft figure -5,545.12 is completely gone
    assert "-5,545.12" not in report_text, "Conflicting draft figure -5,545.12 still present in report!"
