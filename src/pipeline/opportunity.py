"""
SwarnaNet Opportunity Validation Engine
Problem Statement 03 — Hack in Hills '26: Commodity Derivatives Intelligence

Audits and validates cross-contract relative-value arbitrage opportunities across MCX gold futures.
Enforces physical parity normalization, strict zero look-ahead bias, explicit units (INR/10g & bps),
and transaction-cost hurdles to filter uneconomic noise from actionable alpha.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from src.pipeline.features import (
    ContractSpec,
    MCX_CONTRACT_SPECS,
    calculate_fine_gold_price_per_10g,
    calculate_fine_gold_price_per_gram,
)


class OpportunityState(str, Enum):
    """
    Explicit, mutually exclusive analytical opportunity states.
    These are analytical classifications, not automated trade execution triggers.
    """
    VALIDATED_CANDIDATE = "VALIDATED_CANDIDATE"       # Checks pass; Net Edge > 0 after all costs
    FRICTION_CONSTRAINED = "FRICTION_CONSTRAINED"     # Gross Edge > 0, but Net Edge <= 0 (swallowed by fees/slippage)
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"           # Missing observations, DTE <= 5 tender window, or history < 20 days
    INVALID = "INVALID"                               # Non-positive prices, bad quotation specs, or zero purity
    NO_OPPORTUNITY = "NO_OPPORTUNITY"                 # Data valid, but |Z| <= threshold (in statistical equilibrium)


@dataclass(frozen=True)
class OpportunityValidationConfig:
    """Configurable hurdles and thresholds for opportunity validation."""
    z_entry_threshold: float = 1.5            # Min Z-score magnitude to qualify for statistical disparity
    z_exit_target: float = 0.0                # Target convergence Z-score (historical mean)
    baseline_friction_bps: float = 15.0       # Exchange turnover + CTT + GST + brokerage + 1-tick slippage
    low_friction_bps: float = 6.0             # Maker rebate / subsidized fee structure
    high_friction_bps: float = 30.0           # Conservative crossing of wide bid-ask spread
    min_days_to_expiry: int = 5               # Tender delivery window buffer (DTE <= 5 rejected/constrained)
    min_rolling_history_days: int = 20        # Minimum look-back observations required for Z-score calculation


@dataclass
class OpportunityValidationResult:
    """Detailed audit trail and mathematical breakdown for an opportunity check."""
    pair_name: str
    date_str: str
    symbol_a: str
    symbol_b: str
    expiry_a: str
    expiry_b: str
    days_to_expiry_a: int
    days_to_expiry_b: int
    raw_close_a: float
    raw_close_b: float
    norm_price_a_10g: float
    norm_price_b_10g: float
    benchmark_par_10g: float
    spread_inr_10g: float
    rolling_mean_10g: Optional[float]
    rolling_std_10g: Optional[float]
    z_score: Optional[float]
    signal_direction: str                     # 'LONG_A_SHORT_B', 'SHORT_A_LONG_B', or 'FLAT'
    gross_edge_inr_10g: float                 # INR per 10 grams of 100% fine gold
    gross_edge_bps: float                     # Basis points relative to benchmark par
    friction_hurdle_bps: float                # Selected transaction cost hurdle in bps
    friction_cost_inr_10g: float              # Transaction cost in INR per 10 grams
    net_edge_bps: float                       # Gross Edge Bps - Friction Hurdle Bps
    net_edge_inr_10g: float                   # Gross Edge INR - Friction Cost INR
    state: OpportunityState
    rejection_reasons: List[str] = field(default_factory=list)
    audit_notes: List[str] = field(default_factory=list)

    @property
    def is_actionable(self) -> bool:
        return self.state == OpportunityState.VALIDATED_CANDIDATE


def validate_single_contract_quote(
    symbol: str,
    raw_close: float,
    quotation_base_grams: float,
    purity_parts_per_thousand: float,
) -> Tuple[bool, Optional[float], List[str]]:
    """
    Validate raw contract parameters and compute 100% fine-gold price per 10g.
    Rejects zero or negative prices, quotation bases, or purities.
    """
    errors: List[str] = []
    if raw_close is None or math.isnan(raw_close) or raw_close <= 0:
        errors.append(f"{symbol}: Close price must be positive (received {raw_close})")
    if quotation_base_grams <= 0:
        errors.append(f"{symbol}: Quotation base must be positive (received {quotation_base_grams})")
    if purity_parts_per_thousand <= 0 or purity_parts_per_thousand > 1000:
        errors.append(f"{symbol}: Purity must be in (0, 1000] (received {purity_parts_per_thousand})")

    if errors:
        return False, None, errors

    # Exact canonical fine-gold formula: P^{fine/10g} = 10 * C / (q * (p / 1000))
    purity_frac = purity_parts_per_thousand / 1000.0
    fine_price_10g = 10.0 * (raw_close / (quotation_base_grams * purity_frac))
    return True, fine_price_10g, []


def validate_arbitrage_opportunity(
    symbol_a: str,
    symbol_b: str,
    date_str: str,
    raw_close_a: float,
    raw_close_b: float,
    expiry_a: str,
    expiry_b: str,
    dte_a: int,
    dte_b: int,
    z_score: Optional[float],
    rolling_mean_10g: Optional[float],
    rolling_std_10g: Optional[float],
    history_length: int = 20,
    config: Optional[OpportunityValidationConfig] = None,
) -> OpportunityValidationResult:
    """
    Core Opportunity Validation Engine.
    Evaluates inputs against data validity, normalization, look-ahead, and economic friction.
    """
    cfg = config or OpportunityValidationConfig()
    pair_name = f"{symbol_a}_{symbol_b}"
    rejections: List[str] = []
    notes: List[str] = []

    spec_a = MCX_CONTRACT_SPECS.get(symbol_a)
    spec_b = MCX_CONTRACT_SPECS.get(symbol_b)

    if not spec_a or not spec_b:
        return OpportunityValidationResult(
            pair_name=pair_name,
            date_str=date_str,
            symbol_a=symbol_a,
            symbol_b=symbol_b,
            expiry_a=expiry_a,
            expiry_b=expiry_b,
            days_to_expiry_a=dte_a,
            days_to_expiry_b=dte_b,
            raw_close_a=raw_close_a,
            raw_close_b=raw_close_b,
            norm_price_a_10g=0.0,
            norm_price_b_10g=0.0,
            benchmark_par_10g=0.0,
            spread_inr_10g=0.0,
            rolling_mean_10g=None,
            rolling_std_10g=None,
            z_score=None,
            signal_direction="FLAT",
            gross_edge_inr_10g=0.0,
            gross_edge_bps=0.0,
            friction_hurdle_bps=cfg.baseline_friction_bps,
            friction_cost_inr_10g=0.0,
            net_edge_bps=-cfg.baseline_friction_bps,
            net_edge_inr_10g=0.0,
            state=OpportunityState.INVALID,
            rejection_reasons=[f"Unrecognized contract specification: {symbol_a} or {symbol_b}"],
        )

    # 1. Input Data Validation & Fine-Gold Normalization
    ok_a, norm_a, errs_a = validate_single_contract_quote(
        symbol_a, raw_close_a, spec_a.quotation_basis_grams, spec_a.purity_parts_per_thousand
    )
    ok_b, norm_b, errs_b = validate_single_contract_quote(
        symbol_b, raw_close_b, spec_b.quotation_basis_grams, spec_b.purity_parts_per_thousand
    )

    if not ok_a or not ok_b:
        return OpportunityValidationResult(
            pair_name=pair_name,
            date_str=date_str,
            symbol_a=symbol_a,
            symbol_b=symbol_b,
            expiry_a=expiry_a,
            expiry_b=expiry_b,
            days_to_expiry_a=dte_a,
            days_to_expiry_b=dte_b,
            raw_close_a=raw_close_a,
            raw_close_b=raw_close_b,
            norm_price_a_10g=norm_a or 0.0,
            norm_price_b_10g=norm_b or 0.0,
            benchmark_par_10g=0.0,
            spread_inr_10g=0.0,
            rolling_mean_10g=None,
            rolling_std_10g=None,
            z_score=None,
            signal_direction="FLAT",
            gross_edge_inr_10g=0.0,
            gross_edge_bps=0.0,
            friction_hurdle_bps=cfg.baseline_friction_bps,
            friction_cost_inr_10g=0.0,
            net_edge_bps=-cfg.baseline_friction_bps,
            net_edge_inr_10g=0.0,
            state=OpportunityState.INVALID,
            rejection_reasons=errs_a + errs_b,
        )

    norm_a_val = norm_a  # type: float
    norm_b_val = norm_b  # type: float
    benchmark_par = norm_b_val  # Use leg B as parity benchmark reference
    spread_inr = norm_a_val - norm_b_val

    # 2. Check for Missing / Insufficient Data or Tender Window
    if history_length < cfg.min_rolling_history_days:
        rejections.append(
            f"Insufficient rolling history: {history_length} days available < {cfg.min_rolling_history_days} days required"
        )
    if z_score is None or math.isnan(z_score) or rolling_std_10g is None or rolling_std_10g <= 0:
        rejections.append("Z-score unavailable or rolling standard deviation is zero/undefined")

    # Expiry tender delivery buffer check (MCX physical delivery starts 5 days before expiry)
    min_dte = min(dte_a, dte_b)
    if min_dte <= cfg.min_days_to_expiry:
        rejections.append(
            f"Tender period constraint: DTE = {min_dte} days <= {cfg.min_days_to_expiry} days threshold (risk of forced physical delivery charges)"
        )

    # Expiry matching check (if expiries differ significantly, calendar carry contaminates the spread)
    if expiry_a != expiry_b:
        notes.append(f"Calendar carry risk: Expiries differ ({expiry_a} vs {expiry_b}); spread reflects contango/backwardation.")

    if rejections:
        return OpportunityValidationResult(
            pair_name=pair_name,
            date_str=date_str,
            symbol_a=symbol_a,
            symbol_b=symbol_b,
            expiry_a=expiry_a,
            expiry_b=expiry_b,
            days_to_expiry_a=dte_a,
            days_to_expiry_b=dte_b,
            raw_close_a=raw_close_a,
            raw_close_b=raw_close_b,
            norm_price_a_10g=round(norm_a_val, 2),
            norm_price_b_10g=round(norm_b_val, 2),
            benchmark_par_10g=round(benchmark_par, 2),
            spread_inr_10g=round(spread_inr, 2),
            rolling_mean_10g=round(rolling_mean_10g, 2) if rolling_mean_10g is not None else None,
            rolling_std_10g=round(rolling_std_10g, 2) if rolling_std_10g is not None else None,
            z_score=round(z_score, 4) if z_score is not None else None,
            signal_direction="FLAT",
            gross_edge_inr_10g=0.0,
            gross_edge_bps=0.0,
            friction_hurdle_bps=cfg.baseline_friction_bps,
            friction_cost_inr_10g=0.0,
            net_edge_bps=-cfg.baseline_friction_bps,
            net_edge_inr_10g=0.0,
            state=OpportunityState.INSUFFICIENT_DATA,
            rejection_reasons=rejections,
            audit_notes=notes,
        )

    # 3. Statistical Signal Evaluation (Gross Edge Calculation)
    mean_val = rolling_mean_10g if rolling_mean_10g is not None else 0.0
    z_val = z_score if z_score is not None else 0.0

    if z_val > cfg.z_entry_threshold:
        # Spread is abnormally high -> Short Spread: Short A (expensive), Long B (cheap)
        signal_direction = "SHORT_A_LONG_B"
        # Gross edge is expected reversion to mean: Spread_t - Mean
        gross_edge_inr = max(0.0, spread_inr - mean_val)
    elif z_val < -cfg.z_entry_threshold:
        # Spread is abnormally low -> Long Spread: Long A (cheap), Short B (expensive)
        signal_direction = "LONG_A_SHORT_B"
        # Gross edge is expected reversion to mean: Mean - Spread_t
        gross_edge_inr = max(0.0, mean_val - spread_inr)
    else:
        # Within equilibrium band: no statistical opportunity
        signal_direction = "FLAT"
        gross_edge_inr = 0.0

    # Convert gross edge to basis points relative to benchmark price
    gross_edge_bps = (gross_edge_inr / benchmark_par * 10000.0) if benchmark_par > 0 else 0.0

    # 4. Transaction Cost & Friction Hurdle Application
    friction_bps = cfg.baseline_friction_bps
    friction_cost_inr = benchmark_par * (friction_bps / 10000.0)

    # 5. Net Edge Calculation
    net_edge_bps = gross_edge_bps - friction_bps
    net_edge_inr = gross_edge_inr - friction_cost_inr

    # 6. Explicit State Classification
    if signal_direction == "FLAT":
        state = OpportunityState.NO_OPPORTUNITY
        notes.append(f"|Z|={abs(z_val):.2f} <= {cfg.z_entry_threshold:.2f}: Spread is within normal statistical equilibrium.")
    elif net_edge_bps > 0 and net_edge_inr > 0:
        state = OpportunityState.VALIDATED_CANDIDATE
        notes.append(f"Validated economic arbitrage candidate: Net edge = +{net_edge_bps:.1f} bps (+₹{net_edge_inr:.2f}/10g).")
    else:
        state = OpportunityState.FRICTION_CONSTRAINED
        rejections.append(
            f"Friction barrier: Gross edge of {gross_edge_bps:.1f} bps (₹{gross_edge_inr:.2f}/10g) does not cover {friction_bps:.1f} bps (₹{friction_cost_inr:.2f}/10g) round-trip friction. Net Edge = {net_edge_bps:.1f} bps."
        )

    return OpportunityValidationResult(
        pair_name=pair_name,
        date_str=date_str,
        symbol_a=symbol_a,
        symbol_b=symbol_b,
        expiry_a=expiry_a,
        expiry_b=expiry_b,
        days_to_expiry_a=dte_a,
        days_to_expiry_b=dte_b,
        raw_close_a=raw_close_a,
        raw_close_b=raw_close_b,
        norm_price_a_10g=round(norm_a_val, 2),
        norm_price_b_10g=round(norm_b_val, 2),
        benchmark_par_10g=round(benchmark_par, 2),
        spread_inr_10g=round(spread_inr, 2),
        rolling_mean_10g=round(mean_val, 2),
        rolling_std_10g=round(rolling_std_10g, 2) if rolling_std_10g is not None else None,
        z_score=round(z_val, 4),
        signal_direction=signal_direction,
        gross_edge_inr_10g=round(gross_edge_inr, 2),
        gross_edge_bps=round(gross_edge_bps, 1),
        friction_hurdle_bps=round(friction_bps, 1),
        friction_cost_inr_10g=round(friction_cost_inr, 2),
        net_edge_bps=round(net_edge_bps, 1),
        net_edge_inr_10g=round(net_edge_inr, 2),
        state=state,
        rejection_reasons=rejections,
        audit_notes=notes,
    )
