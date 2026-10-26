"""
Test Suite for SwarnaNet Ingestion Pipeline
Validates normalization, deduplication, quarantine, schema constraints, and reports.
"""

import csv
import os
from datetime import datetime
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
NORMALIZED_CSV = PROJECT_DIR / "data" / "processed" / "mcx_gold_normalized.csv"
QUARANTINE_CSV = PROJECT_DIR / "data" / "processed" / "quarantine.csv"
VALIDATION_REPORT = PROJECT_DIR / "reports" / "ingestion_validation.md"
AUDIT_REPORT = PROJECT_DIR / "reports" / "dataset_audit.md"

EXPECTED_HEADERS = [
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

EXPECTED_CONTRACT_COUNTS = {
    "GOLDM": 612,
    "GOLDGUINEA": 879,
    "GOLDPETAL": 901,
    "GOLDTEN": 877,
}

EXPECTED_TOTAL_ACCEPTED = 3269
EXPECTED_TOTAL_DUPLICATES = 334
EXPECTED_TOTAL_SOURCE = 3603


def test_output_files_exist():
    """Verify that all required output files exist and are non-empty."""
    assert NORMALIZED_CSV.exists(), f"Missing {NORMALIZED_CSV}"
    assert NORMALIZED_CSV.stat().st_size > 0, "Normalized CSV is empty"
    
    assert QUARANTINE_CSV.exists(), f"Missing {QUARANTINE_CSV}"
    assert QUARANTINE_CSV.stat().st_size > 0, "Quarantine CSV is empty"
    
    assert VALIDATION_REPORT.exists(), f"Missing {VALIDATION_REPORT}"
    assert VALIDATION_REPORT.stat().st_size > 0, "Validation report is empty"
    
    assert AUDIT_REPORT.exists(), f"Missing {AUDIT_REPORT}"
    assert AUDIT_REPORT.stat().st_size > 0, "Audit report is empty"


def test_canonical_schema_and_counts():
    """Verify headers, total row counts, and per-contract counts."""
    with open(NORMALIZED_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))
        
    assert reader, "Normalized CSV has no records"
    assert list(reader[0].keys()) == EXPECTED_HEADERS, f"Headers mismatch: {list(reader[0].keys())}"
    assert len(reader) == EXPECTED_TOTAL_ACCEPTED, f"Expected {EXPECTED_TOTAL_ACCEPTED} rows, got {len(reader)}"
    
    counts = {}
    for r in reader:
        sym = r["Symbol"]
        counts[sym] = counts.get(sym, 0) + 1
        
    assert counts == EXPECTED_CONTRACT_COUNTS, f"Contract counts mismatch: {counts}"


def test_sorting_and_uniqueness():
    """Verify that records are strictly sorted ascending by Symbol, ExpiryDate, Date and have no duplicates."""
    with open(NORMALIZED_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))
        
    seen_keys = set()
    prev_sort_key = None
    
    for r in reader:
        sym = r["Symbol"]
        d = datetime.strptime(r["Date"], "%Y-%m-%d").date()
        exp = datetime.strptime(r["ExpiryDate"], "%Y-%m-%d").date()
        key = (sym, exp, d)
        
        assert key not in seen_keys, f"Duplicate key found in normalized data: {key}"
        seen_keys.add(key)
        
        if prev_sort_key is not None:
            assert key >= prev_sort_key, f"Sorting violation: {key} came after {prev_sort_key}"
        prev_sort_key = key


def test_zero_volume_and_missing_ohlc():
    """Verify that zero-volume rows preserve missing Open, High, Low and no values are fabricated."""
    with open(NORMALIZED_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))
        
    zero_vol_count = 0
    for r in reader:
        vol = int(r["Volume"])
        if vol == 0:
            zero_vol_count += 1
            assert r["Open"] == "", f"Fabricated Open for zero volume on {r}"
            assert r["High"] == "", f"Fabricated High for zero volume on {r}"
            assert r["Low"] == "", f"Fabricated Low for zero volume on {r}"
            assert r["Close"] != "", f"Missing settlement Close on {r}"
        else:
            assert r["Open"] != "", f"Missing Open for positive volume on {r}"
            assert r["High"] != "", f"Missing High for positive volume on {r}"
            assert r["Low"] != "", f"Missing Low for positive volume on {r}"
            assert r["Close"] != "", f"Missing Close on {r}"
            
            o = float(r["Open"])
            h = float(r["High"])
            l = float(r["Low"])
            assert h >= l, f"High < Low in {r}"
            assert l <= o <= h, f"Open outside [Low, High] in {r}"

    assert zero_vol_count == 202, f"Expected 202 zero volume rows, got {zero_vol_count}"


def test_settlement_close_outside_high_low():
    """Verify that settlement Close values outside High-Low range are retained (14 verified cases)."""
    with open(NORMALIZED_CSV, "r", encoding="utf-8") as f:
        reader = list(csv.DictReader(f))
        
    outside_hl_cases = []
    for r in reader:
        if r["Open"] != "":
            h = float(r["High"])
            l = float(r["Low"])
            c = float(r["Close"])
            if c < l or c > h:
                outside_hl_cases.append(r)
                
    assert len(outside_hl_cases) == 14, f"Expected 14 Close outside [L,H] cases, got {len(outside_hl_cases)}"
    
    # Verify all 14 cases occur on the contract expiry date
    for r in outside_hl_cases:
        assert r["Date"] == r["ExpiryDate"], f"Close outside [L,H] not on expiry date: {r}"


def test_quarantine_file_schema():
    """Verify quarantine CSV has valid header and zero quarantine rows for clean dataset."""
    with open(QUARANTINE_CSV, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
        
    assert len(lines) == 1, f"Expected header-only quarantine file, got {len(lines)} lines"
    expected_header = "Archive,SourceFile,SourceRow,Symbol,Date,ExpiryDate,Open,High,Low,Close,Volume,OpenInterest,QuarantineReason"
    assert lines[0] == expected_header, f"Quarantine header mismatch: {lines[0]}"


def test_report_contents():
    """Verify required content sections in validation and audit reports."""
    val_text = VALIDATION_REPORT.read_text(encoding="utf-8")
    assert "3,603" in val_text
    assert "3,269" in val_text
    assert "334" in val_text
    assert "14" in val_text
    assert "GOLDM" in val_text
    assert "GOLDGUINEA" in val_text
    assert "GOLDPETAL" in val_text
    assert "GOLDTEN" in val_text
    assert "mcx_gold_normalized.csv" in val_text
    assert "quarantine.csv" in val_text
    
    audit_text = AUDIT_REPORT.read_text(encoding="utf-8")
    assert "43" in audit_text
    assert "SHA-256" in audit_text
    assert "GOLDM_05OCT2025.csv" in audit_text
    assert "GOLDGUINEA_JUN2024.csv" in audit_text
    assert "GOLDPETAL_OCT2025.csv" in audit_text
    assert "GOLDTEN_OCT2026.csv" in audit_text
