"""
SWARNANET: Automated Refresh Pipeline Tests
Phase 6: Automated Data Refresh

Tests:
- 7-stage refresh workflow execution
- Idempotency & deduplication on repeated refresh passes
- Input schema validation & quarantine of malformed observations
- Refresh status JSON ledger integrity
"""

import json
from pathlib import Path
import pytest

from src.pipeline.refresh import (
    RefreshConfig,
    execute_refresh,
    validate_and_normalize_record,
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "processed"
NORMALIZED_CSV = DATA_DIR / "mcx_gold_normalized.csv"
FEATURES_CSV = DATA_DIR / "mcx_gold_features.csv"
QUARANTINE_CSV = DATA_DIR / "quarantine.csv"
STATUS_JSON = DATA_DIR / "refresh_status.json"


@pytest.fixture
def refresh_cfg():
    return RefreshConfig(
        project_dir=PROJECT_ROOT,
        normalized_csv_path=NORMALIZED_CSV,
        features_csv_path=FEATURES_CSV,
        quarantine_csv_path=QUARANTINE_CSV,
        status_json_path=STATUS_JSON,
        incoming_dir=PROJECT_ROOT / "data" / "incoming",
        dry_run=True,  # Safety: tests run in dry-run mode
    )


def test_refresh_pipeline_execution(refresh_cfg):
    """Verify that execute_refresh runs all 7 stages and produces valid counts."""
    result = execute_refresh(refresh_cfg)
    assert result.status in ("SUCCESS", "NO_NEW_DATA")
    assert result.total_canonical_records == 3269
    assert result.latest_eod_date == "2026-10-23"
    assert result.features_computed_count == 3269
    assert result.opportunities_evaluated_count >= 1
    assert result.new_records_added == 0
    assert result.duplicates_reconciled == 3269


def test_refresh_idempotency(refresh_cfg):
    """Verify that executing refresh consecutively does not create duplicate records."""
    res1 = execute_refresh(refresh_cfg)
    res2 = execute_refresh(refresh_cfg)

    assert res1.total_canonical_records == res2.total_canonical_records == 3269
    assert res2.new_records_added == 0
    assert res2.duplicates_reconciled == 3269


def test_quarantine_validation_on_invalid_row():
    """Verify that corrupt or unrecognized symbols are quarantined with an explicit reason."""
    bad_symbol_row = {
        "Symbol": "SILVERMIC",
        "Date": "2026-10-23",
        "ExpiryDate": "2026-10-30",
        "Close": "85000",
        "Volume": "100",
    }
    is_ok, norm, quar = validate_and_normalize_record(bad_symbol_row, "TEST_STREAM")
    assert is_ok is False
    assert norm is None
    assert quar is not None
    assert "Unrecognized contract symbol" in quar["QuarantineReason"]

    negative_price_row = {
        "Symbol": "GOLDPETAL",
        "Date": "2026-10-23",
        "ExpiryDate": "2026-10-30",
        "Close": "-100.0",
        "Volume": "10",
    }
    is_ok2, norm2, quar2 = validate_and_normalize_record(negative_price_row, "TEST_STREAM")
    assert is_ok2 is False
    assert "strictly positive float" in quar2["QuarantineReason"]


def test_refresh_status_json_ledger():
    """Verify that refresh_status.json has valid keys, dates, and non-empty ISO timestamps."""
    assert STATUS_JSON.exists(), f"Missing status ledger: {STATUS_JSON}"
    with open(STATUS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    required_keys = [
        "timestamp_iso",
        "status",
        "latest_eod_date",
        "total_canonical_records",
        "new_records_added",
        "duplicates_reconciled",
        "features_computed_count",
        "opportunities_evaluated_count",
        "actionable_candidates_count",
        "friction_constrained_count",
        "supabase_synced",
        "data_source_description",
    ]
    for k in required_keys:
        assert k in data, f"Missing key in refresh status ledger: {k}"

    assert data["latest_eod_date"] == "2026-10-23"
    assert data["total_canonical_records"] == 3269
    assert data["status"] == "SUCCESS"
