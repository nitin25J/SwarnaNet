# Phase 6: Automated Data Refresh & Supabase Synchronization Report

**Project:** SwarnaNet — Institutional MCX Bullion Derivatives Intelligence Terminal  
**Location:** `D:\SWARNANET`  
**Date:** 2026-10-26  
**Status:** **COMPLETE — PASS (All Verified Requirements Met, Scheduling Limitations Explicitly Documented)**

---

## 1. Executive Summary

Phase 6 implements a robust, 7-stage automated data refresh workflow that seamlessly integrates with SwarnaNet's existing ingestion, feature engineering, opportunity validation, and Supabase database infrastructure.

The refresh pipeline enforces strict idempotency, prevents duplicate ingestion, validates schema constraints and prices, recalculates cross-contract fine gold features and opportunity states without look-ahead bias, and safely synchronizes updates with Supabase PostgreSQL via idempotent upserts.

A persistent audit ledger (`data/processed/refresh_status.json`) tracks execution timestamps, latest settlement marks, record counts, and data source classifications. Practical scheduling mechanisms for local Windows execution and headless servers are implemented, and external cloud scheduling limitations are clearly documented.

---

## 2. Requirement Status Matrix

| Requirement | Description | Status | Verification Evidence |
| :---: | :--- | :---: | :--- |
| **REQ-1** | Inspect & reuse existing ingestion, feature, opportunity, and Supabase infrastructure. | **PASS** | Reused `features.py`, `opportunity.py`, and `seed_supabase.py` without code duplication. |
| **REQ-2** | Support genuine MCX EOD Bhavcopy data, validate required columns, dates, prices, volume, and quarantine corrupt rows. | **PASS** | `validate_and_normalize_record()` tested with valid & invalid rows; corrupt rows isolated to `quarantine.csv`. |
| **REQ-3** | Implement 7-stage pipeline order: Acquire $\rightarrow$ Validate $\rightarrow$ Deduplicate $\rightarrow$ Features $\rightarrow$ Opportunities $\rightarrow$ Supabase $\rightarrow$ Verify. | **PASS** | `src/pipeline/refresh.py` executes all 7 stages sequentially with complete audit tracking. |
| **REQ-4** | Safe, idempotent Supabase updates via primary key `(symbol, date, expiry_date)`. Zero leaked secrets or client mutations. | **PASS** | REST endpoint utilizes `Prefer: resolution=merge-duplicates`. Verified 3,269 canonical records preserved. |
| **REQ-5** | Practical scheduling mechanism and clear execution status exposure without false real-time claims. | **PASS** | Implemented CLI flags (`--run-once`, `--status`, `--schedule`, `--install-task`) and `GET /api/refresh`. Windows Task Scheduler command generated. |
| **REQ-6** | Efficient verification pass: regression test suite, idempotency verification, and production build checks. | **PASS** | 37/37 pytest tests passing; TypeScript 0 errors; ESLint 0 errors; repeated refresh yielded 0 duplicates. |
| **REQ-7** | Strict preservation: No fabricated data, no quantitative formula alteration, no unauthorized git operations. | **PASS** | Zero mock data introduced; parity formula ($999/995 \approx 1.00402$) and backtest engine preserved. |

---

## 3. Architecture & Modified Files

```
D:\SWARNANET
├── src/
│   └── pipeline/
│       ├── refresh.py                  [NEW] Core 7-stage Automated Refresh Engine
│       ├── features.py                 [REUSED] Feature Engineering & Parity Normalization
│       ├── opportunity.py              [REUSED] Opportunity Validation Engine
│       └── ingest.py                   [REUSED] Raw Bhavcopy Archive Ingestion
├── scripts/
│   ├── refresh_pipeline.py             [NEW] CLI & Background Daemon Scheduler
│   └── seed_supabase.py                [REUSED] Supabase Idempotent Seeding Module
├── data/
│   ├── incoming/                       [NEW] Automated Drop Directory for New Bhavcopy CSVs
│   └── processed/
│       ├── mcx_gold_normalized.csv     [CANONICAL] 3,269 Clean Observations (2020-01-01 to 2026-10-23)
│       ├── mcx_gold_features.csv       [CANONICAL] 3,269 Feature Rows Across 4 Contracts
│       ├── quarantine.csv              [CANONICAL] Isolated Corrupt Observation Records
│       └── refresh_status.json         [NEW] Persistent Audit Ledger of Latest Execution
├── frontend/src/app/api/
│   └── refresh/route.ts                [NEW] Real-Time API Endpoint (GET Status, POST Trigger)
└── tests/
    └── test_refresh_pipeline.py        [NEW] Automated Refresh & Idempotency Test Suite
```

---

## 4. Actual Data Source & Date Coverage

- **Official Source**: MCX India End-of-Day (EOD) Bhavcopy settlement marks.
- **Data Classification**: `HISTORICAL_EOD_SETTLEMENT` (strictly labeled as post-market settlement marks; no false real-time or streaming claims).
- **Date Range Covered**: `2020-01-01` to `2026-10-23` (Latest available official Bhavcopy in canonical repository).
- **Active Contracts Monitored (as of 2026-10-23)**:
  1. `GOLDGUINEA` (Expiry: `2026-10-30`, Settlement: ₹1,13,168.00 / 8g, 999 Purity)
  2. `GOLDPETAL` (Expiry: `2026-10-30`, Settlement: ₹14,155.00 / 1g, 999 Purity)
  3. `GOLDTEN` (Expiry: `2026-10-30`, Settlement: ₹1,40,832.00 / 10g, 999 Purity)
  4. `GOLDTEN` (Expiry: `2026-11-30`, Settlement: ₹1,42,260.00 / 10g, 999 Purity)
  *(Note: `GOLDM` October contract matured on `2026-10-05` at ₹1,46,900.00 / 10g, 995 Purity, preserved for historical cycle carry).*
- **Web Portal Connectivity Check**: The MCX public portal (`https://www.mcxindia.com/market-data/bhavcopy`) was queried during refresh execution. Because the public portal returns HTTP 403 / anti-bot challenge for automated headless GET requests, the pipeline gracefully reports:
  `MCX public portal check: HTTPError (Online portal requires CAPTCHA/session; falling back to verified canonical data store)`
  **Zero synthetic or fabricated prices are generated.**

---

## 5. Refresh & Deduplication Counts

Execution audit from the latest verification pass:

| Metric | Recorded Value | Description |
| :--- | :---: | :--- |
| **Total Canonical Observations** | `3,269` | Exact total clean rows in `mcx_gold_normalized.csv` |
| **Total Candidate Rows Evaluated** | `3,269` | Source observations parsed and validated |
| **New Records Appended** | `0` | Zero duplicate records created on repeated execution |
| **Duplicates Reconciled** | `3,269` | Idempotent reconciliation against composite key `(Symbol, Date, ExpiryDate)` |
| **Quarantined Records** | `0` | Zero corrupt rows in canonical dataset |
| **Features Recomputed** | `3,269` | All 57 feature columns updated synchronously |
| **Opportunity Pairs Evaluated** | `2` | Active pairs on latest date (`GUINEA vs PETAL`, `TEN vs PETAL`) |
| **Actionable Candidates** | `0` | Net edge does not breach 15.0 bps transaction hurdle |
| **Friction Constrained Opportunities** | `1` | Gross edge (6.4 bps) swallowed by round-trip transaction friction |
| **Execution Status** | `SUCCESS` | All 7 stages completed without error |

---

## 6. Supabase Write & Reconciliation Evidence

- **Database Endpoint**: `https://djhtcatcmsantpgqgglf.supabase.co/rest/v1/mcx_normalized_observations`
- **Conflict Resolution Key**: `ON CONFLICT (symbol, date, expiry_date)` with HTTP header `Prefer: resolution=merge-duplicates`.
- **Database Record Verification**:
  ```powershell
  # Verified via GET /api/bhavcopy-audit
  {
      "source": "SUPABASE_POSTGRES",
      "supabaseRecordCount": 3269,
      "auditReport": { "auditStatus": "PASSED" }
  }
  ```
- **Security & Least Privilege**:
  - Browser code never accesses the `service_role` key or raw database connection strings.
  - Read access is governed by Supabase RLS policies (`Allow public read access`).
  - Write operations are restricted strictly to server-side pipeline tasks.

---

## 7. Idempotency & Regression Test Results

### A. Python Regression Suite (`pytest tests/ -v`)
All 37 unit and integration tests passed in 3.23 seconds:
- `test_backtest.py`: 11 passed (signal timing, cost application, P&L attribution, train/test split)
- `test_features.py`: 9 passed (normalization formulas, purity ratios, zero look-ahead bias)
- `test_ingestion.py`: 7 passed (canonical schema, sorting, missing OHLC, quarantine log)
- `test_opportunity.py`: 6 passed (net edge vs friction, units INR/10g & bps, equilibrium)
- `test_refresh_pipeline.py`: 4 passed (7-stage execution, idempotency, quarantine logic, status ledger)

**Result:** `37 passed in 3.23s` (100% Green).

### B. Consecutive Idempotency Run Check
Running `python scripts/refresh_pipeline.py --run-once` consecutively confirmed:
- Run 1 Canonical Count: `3,269`
- Run 2 Canonical Count: `3,269`
- New Records Added: `0`
- Duplicates Reconciled: `3,269`
- Status: `SUCCESS`

### C. Frontend Code Checks
- `npx tsc --noEmit`: **PASS (0 errors)**
- `npm run lint`: **PASS (0 errors, 0 warnings in refresh route)**
- `npm run build`: **PASS (13 static/dynamic routes compiled successfully)**

---

## 8. Scheduling Capabilities & Limitations

### Practical Local Scheduling (Implemented & Verified)
1. **Windows Task Scheduler (Target System):**
   ```cmd
   schtasks /Create /SC DAILY /TN "SwarnaNet_EOD_Refresh" /TR "\"D:\PROGRAMING FILE\IDE\Python setup\python.exe\" \"D:\SWARNANET\scripts\refresh_pipeline.py\" --run-once" /ST 20:30 /F
   ```
   - Triggers daily at 20:30 IST immediately following MCX settlement rate finalization.
   - Runs independently of whether the frontend browser window is open.

2. **Standalone Daemon Mode:**
   ```bash
   python scripts/refresh_pipeline.py --schedule 24
   ```
   - Runs an in-process timer executing the 7-stage refresh every 24 hours.

### Scheduling Limitations & Blockers (Documented Honestly)
- **Cloud Cron / Serverless Worker**: Because SwarnaNet is currently hosted locally on `D:\SWARNANET` without an active external Cloud Composer, AWS EventBridge, or GitHub Actions workflow runner deployed, fully automated serverless cloud scheduling is marked **BLOCKED (Requires Cloud Hosting Infrastructure)**.
- **MCX Web Scraping Restrictions**: Official MCX India bulk bhavcopy downloads employ Cloudflare bot mitigation and dynamic CSRF tokens. Live programmatic scraping directly from MCX India requires either an official paid data feed provider, a headless Selenium/Playwright session with CAPTCHA solving, or dropping daily Bhavcopy CSV files into `data/incoming/`.

---

## 9. Exact Commands for Running & Verifying a Refresh

### 1. Trigger Full Refresh (CLI)
```cmd
python scripts/refresh_pipeline.py --run-once
```

### 2. Check Persistent Ledger Status (CLI)
```cmd
python scripts/refresh_pipeline.py --status
```

### 3. Ingest Incremental Bhavcopy Drop (CLI)
```cmd
python scripts/refresh_pipeline.py --incremental "data/incoming/mcx_eod_20261026.csv"
```

### 4. Query Refresh Status API (HTTP)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/refresh" | ConvertTo-Json -Depth 3
```

### 5. Run Full Test Suite
```cmd
pytest tests/ -v
```

---

## 10. Conclusion

Phase 6 is **100% COMPLETE**. The automated MCX EOD data refresh pipeline is fully functional, verified against authentic datasets, and documented.

**Per instructions, work stops after Phase 6. Do not begin Phase 7.**
