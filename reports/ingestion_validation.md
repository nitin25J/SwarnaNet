# SwarnaNet — Ingestion Pipeline Validation Report

**Problem Statement:** PS-03 (Hack in Hills '26)
**Execution Timestamp:** 2026-10-25 19:11:52
**Source Data Mode:** Direct In-Memory ZIP Streaming (Zero Disk Extraction)

---

## 1. Pipeline Execution & Reconciliation Summary

The ingestion pipeline has executed successfully with full source-to-target reconciliation:

$$\text{Source Rows (3,603)} = \text{Accepted Rows (3,269)} + \text{Duplicate Rows (334)} + \text{Quarantined Rows (0)}$$

| Metric | Count | Reconciliation Status |
|:---|:---:|:---:|
| **Source ZIP Archives** | 4 | Verified (1 archive per contract) |
| **Source CSV Files** | 43 | Verified (Matches expected 43 files) |
| **Total Source Rows Read** | 3,603 | 100% Reconciled |
| **Accepted Output Rows** | 3,269 | Written to `data/processed/mcx_gold_normalized.csv` |
| **Exact Duplicate Rows Deduplicated** | 334 | Reconciled under documented identity rule |
| **Quarantined Records** | 0 | Written to `data/processed/quarantine.csv` |

---

## 2. Row Reconciliation by Contract

| Contract Symbol | CSV Files | Source Rows | Accepted Rows | Duplicate Rows | Quarantined Rows | Net Retention Rate |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **GOLDM** | 11 | 742 | 612 | 130 | 0 | 82.5% |
| **GOLDGUINEA** | 11 | 1,004 | 879 | 125 | 0 | 87.5% |
| **GOLDPETAL** | 11 | 980 | 901 | 79 | 0 | 91.9% |
| **GOLDTEN** | 10 | 877 | 877 | 0 | 0 | 100.0% |
| **Total** | **43** | **3,603** | **3,269** | **334** | **0** | **90.7%** |

---

## 3. Contract Date Ranges & Expiry Coverage

Each contract type encompasses exactly 10 distinct contract expiries (40 distinct contracts across the dataset):

| Contract Symbol | Distinct Expiries | Trading Date Range | Active Trading Days | Expiries List |
|:---|:---:|:---:|:---:|:---|
| **GOLDM** | 10 | 2020-01-01 to 2026-10-05 | 612 | 2020-03-05, 2020-07-03, 2021-03-05, 2021-07-05, 2022-03-04, 2022-07-05, 2023-03-03, 2023-07-05, 2024-03-05, 2026-10-05 |
| **GOLDGUINEA** | 10 | 2020-03-02 to 2026-10-23 | 879 | 2020-06-30, 2020-08-31, 2021-06-30, 2021-08-31, 2022-06-30, 2022-08-30, 2023-06-30, 2023-08-31, 2024-03-28, 2026-10-30 |
| **GOLDPETAL** | 10 | 2020-03-02 to 2026-10-23 | 901 | 2020-06-30, 2020-08-31, 2021-06-30, 2021-08-31, 2022-06-30, 2022-08-30, 2023-06-30, 2023-08-31, 2024-06-28, 2026-10-30 |
| **GOLDTEN** | 10 | 2025-03-31 to 2026-10-23 | 877 | 2025-06-30, 2025-08-29, 2025-10-31, 2025-11-28, 2026-01-30, 2026-02-27, 2026-05-29, 2026-07-31, 2026-10-30, 2026-11-30 |

---

## 4. Detailed Expiry Coverage (All 40 Contracts)

| Contract Symbol | Expiry Date | First Trading Date | Last Trading Date | Trading Days | Zero Vol Days | Close Outside [L,H] |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GOLDGUINEA` | `2020-06-30` | 2020-03-02 | 2020-06-30 | 83 | 23 | 1 |
| `GOLDGUINEA` | `2020-08-31` | 2020-05-01 | 2020-08-31 | 87 | 21 | 1 |
| `GOLDGUINEA` | `2021-06-30` | 2021-03-01 | 2021-06-30 | 87 | 22 | 0 |
| `GOLDGUINEA` | `2021-08-31` | 2021-05-03 | 2021-08-31 | 87 | 14 | 1 |
| `GOLDGUINEA` | `2022-06-30` | 2022-03-01 | 2022-06-30 | 87 | 20 | 1 |
| `GOLDGUINEA` | `2022-08-30` | 2022-05-02 | 2022-08-30 | 86 | 24 | 1 |
| `GOLDGUINEA` | `2023-06-30` | 2023-03-02 | 2023-06-30 | 86 | 14 | 1 |
| `GOLDGUINEA` | `2023-08-31` | 2023-05-01 | 2023-08-31 | 88 | 20 | 1 |
| `GOLDGUINEA` | `2024-03-28` | 2024-01-01 | 2024-03-28 | 63 | 0 | 0 |
| `GOLDGUINEA` | `2026-10-30` | 2026-05-01 | 2026-10-23 | 125 | 2 | 0 |
| `GOLDM` | `2020-03-05` | 2020-01-01 | 2020-03-05 | 48 | 0 | 1 |
| `GOLDM` | `2020-07-03` | 2020-04-07 | 2020-07-03 | 62 | 0 | 0 |
| `GOLDM` | `2021-03-05` | 2021-01-01 | 2021-03-05 | 45 | 0 | 1 |
| `GOLDM` | `2021-07-05` | 2021-04-06 | 2021-07-05 | 65 | 0 | 0 |
| `GOLDM` | `2022-03-04` | 2022-01-03 | 2022-03-04 | 44 | 0 | 0 |
| `GOLDM` | `2022-07-05` | 2022-04-06 | 2022-07-05 | 64 | 0 | 1 |
| `GOLDM` | `2023-03-03` | 2023-01-02 | 2023-03-03 | 44 | 0 | 0 |
| `GOLDM` | `2023-07-05` | 2023-04-06 | 2023-07-05 | 64 | 0 | 0 |
| `GOLDM` | `2024-03-05` | 2024-01-01 | 2024-03-05 | 46 | 0 | 0 |
| `GOLDM` | `2026-10-05` | 2026-04-06 | 2026-10-05 | 130 | 1 | 0 |
| `GOLDPETAL` | `2020-06-30` | 2020-03-02 | 2020-06-30 | 83 | 14 | 0 |
| `GOLDPETAL` | `2020-08-31` | 2020-05-01 | 2020-08-31 | 87 | 7 | 1 |
| `GOLDPETAL` | `2021-06-30` | 2021-03-01 | 2021-06-30 | 87 | 2 | 1 |
| `GOLDPETAL` | `2021-08-31` | 2021-05-03 | 2021-08-31 | 87 | 3 | 0 |
| `GOLDPETAL` | `2022-06-30` | 2022-03-01 | 2022-06-30 | 87 | 6 | 0 |
| `GOLDPETAL` | `2022-08-30` | 2022-05-02 | 2022-08-30 | 86 | 1 | 1 |
| `GOLDPETAL` | `2023-06-30` | 2023-03-02 | 2023-06-30 | 86 | 4 | 0 |
| `GOLDPETAL` | `2023-08-31` | 2023-05-01 | 2023-08-31 | 88 | 3 | 1 |
| `GOLDPETAL` | `2024-06-28` | 2024-03-01 | 2024-06-28 | 85 | 0 | 0 |
| `GOLDPETAL` | `2026-10-30` | 2026-05-01 | 2026-10-23 | 125 | 0 | 0 |
| `GOLDTEN` | `2025-06-30` | 2025-03-31 | 2025-06-30 | 65 | 1 | 0 |
| `GOLDTEN` | `2025-08-29` | 2025-06-02 | 2025-08-29 | 64 | 0 | 0 |
| `GOLDTEN` | `2025-10-31` | 2025-08-01 | 2025-10-31 | 64 | 0 | 0 |
| `GOLDTEN` | `2025-11-28` | 2025-09-01 | 2025-11-28 | 64 | 0 | 0 |
| `GOLDTEN` | `2026-01-30` | 2025-09-22 | 2026-01-30 | 92 | 0 | 0 |
| `GOLDTEN` | `2026-02-27` | 2025-10-01 | 2026-02-27 | 106 | 0 | 0 |
| `GOLDTEN` | `2026-05-29` | 2026-01-01 | 2026-05-29 | 106 | 0 | 0 |
| `GOLDTEN` | `2026-07-31` | 2026-02-01 | 2026-07-31 | 130 | 0 | 0 |
| `GOLDTEN` | `2026-10-30` | 2026-07-01 | 2026-10-23 | 82 | 0 | 0 |
| `GOLDTEN` | `2026-11-30` | 2026-06-01 | 2026-10-23 | 104 | 0 | 0 |

---

## 5. Duplicate and Conflicting-Record Analysis

### Deduplication Methodology
A record is keyed by the triple `(Symbol, ExpiryDate, Date)`. If multiple rows share the same key:
1. **Exact Match Rule:** When all price and volume values (`Open`, `High`, `Low`, `Close`, `Volume(Lots)`, `Open Interest(Lots)`) are identical, redundant instances are classified as exact duplicates and removed. Exactly one copy is preserved in the canonical dataset.
2. **Conflict Rule:** When any price or volume field differs between records sharing the same key, both records are considered ambiguous/conflicting and routed to `quarantine.csv`.

### Deduplication Breakdown
- **GOLDM (130 duplicate rows):** `1. GOLDM/GOLDM_05OCT2025.csv` and `1. GOLDM/GOLDM_JUL2026.csv` are 100% identical files covering expiry `2026-10-05` (130 duplicate rows eliminated).
- **GOLDGUINEA (125 duplicate rows):** `2. GOLDGUINEA/GOLDGUINEA_JUN2025.csv` and `2. GOLDGUINEA/GOLDGUINEA_AUG2026.csv` are 100% identical files covering expiry `2026-10-30` (125 duplicate rows eliminated).
- **GOLDPETAL (79 duplicate rows):** `3. GOLDPETAL/GOLDPETAL_OCT2025.csv` (122 rows) and `3. GOLDPETAL/GOLDPETAL_AUG2026.csv` (82 rows) overlap on 79 dates (`2026-07-01` to `2026-10-20`) for expiry `2026-10-30`. The 79 redundant rows were eliminated while preserving the unique early 43 days from OCT2025 and 3 latest days from AUG2026.
- **GOLDTEN (0 duplicate rows):** All 10 files contain mutually disjoint contract expiries.
- **Conflicting Records:** Exactly **0** conflicting records were detected across the entire 3,603-row source dataset.

---

## 6. Filename vs Row-Level Expiry Mismatches

The source archives contain 10 CSV files whose filenames do not correspond to the actual expiry date of the underlying contract. The pipeline correctly ignored the filenames and preserved the authoritative row-level expiry:

| Archive | Filename | Filename Claim | Actual Expiry Date | Ingestion Action |
|:---|:---|:---:|:---:|:---|
| `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_05OCT2025.csv` | `05OCT2025` | `05OCT2026` | Row-level expiry preserved (`05OCT2026`) |
| `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2026.csv` | `JUL2026` | `05OCT2026` | Row-level expiry preserved (`05OCT2026`) |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2026.csv` | `AUG2026` | `30OCT2026` | Row-level expiry preserved (`30OCT2026`) |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2024.csv` | `JUN2024` | `28MAR2024` | Row-level expiry preserved (`28MAR2024`) |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2025.csv` | `JUN2025` | `30OCT2026` | Row-level expiry preserved (`30OCT2026`) |
| `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2026.csv` | `AUG2026` | `30OCT2026` | Row-level expiry preserved (`30OCT2026`) |
| `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_OCT2025.csv` | `OCT2025` | `30OCT2026` | Row-level expiry preserved (`30OCT2026`) |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_FEB2026.csv` | `FEB2026` | `30JAN2026` | Row-level expiry preserved (`30JAN2026`) |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_JUN2026.csv` | `JUN2026` | `31JUL2026` | Row-level expiry preserved (`31JUL2026`) |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_OCT2026.csv` | `OCT2026` | `30NOV2026` | Row-level expiry preserved (`30NOV2026`) |

---

## 7. Missing Value Audit (Null Values)

Missing values in the canonical output dataset (`mcx_gold_normalized.csv`):

| Canonical Column | Null Count | Null % | Reason / Characterization |
|:---|:---:|:---:|:---|
| `Symbol` | 0 | 0.00% | Mandatory field — 100% complete |
| `Date` | 0 | 0.00% | Mandatory field — 100% complete |
| `ExpiryDate` | 0 | 0.00% | Mandatory field — 100% complete |
| `Open` | 202 | 6.18% | Zero-volume trading days (no trades executed; Open/High/Low null by definition) |
| `High` | 202 | 6.18% | Zero-volume trading days (no trades executed; Open/High/Low null by definition) |
| `Low` | 202 | 6.18% | Zero-volume trading days (no trades executed; Open/High/Low null by definition) |
| `Close` | 0 | 0.00% | Mandatory field — 100% complete |
| `Volume` | 0 | 0.00% | Mandatory field — 100% complete |
| `OpenInterest` | 0 | 0.00% | Mandatory field — 100% complete |

> **Zero-Volume Consistency:** Exactly **202** rows in the output have `Volume = 0` and missing `Open, High, Low`. There are zero fabricated OHLC values.

---

## 8. Settlement Close Outside Daily High-Low Range (14 Cases)

In MCX commodity futures, when a contract expires, the final closing/settlement price is determined by polled physical spot gold rates (IBJA benchmark), which frequently settles outside the day's futures trading range. All 14 cases occur on the final contract expiry date and represent authentic market settlement data:

| Symbol | Expiry Date | Trading Date | Open | Low | High | Settlement Close | Volume | Open Int | Deviation Type |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| `GOLDGUINEA` | `2020-06-30` | `2020-06-30` | 39245.00 | 39000.00 | 39398.00 | **38799.00** | 37 | 25 | Close < Low (-201.00) |
| `GOLDGUINEA` | `2020-08-31` | `2020-08-31` | 42200.00 | 42200.00 | 42499.00 | **41162.00** | 2 | 2 | Close < Low (-1038.00) |
| `GOLDGUINEA` | `2021-08-31` | `2021-08-31` | 38300.00 | 38299.00 | 38300.00 | **37836.00** | 2 | 9 | Close < Low (-463.00) |
| `GOLDGUINEA` | `2022-06-30` | `2022-06-30` | 40913.00 | 40866.00 | 41199.00 | **40722.00** | 3 | 0 | Close < Low (-144.00) |
| `GOLDGUINEA` | `2022-08-30` | `2022-08-30` | 41625.00 | 41625.00 | 41625.00 | **40953.00** | 1 | 71 | Close < Low (-672.00) |
| `GOLDGUINEA` | `2023-06-30` | `2023-06-30` | 46999.00 | 46999.00 | 46999.00 | **46434.00** | 3 | 13 | Close < Low (-565.00) |
| `GOLDGUINEA` | `2023-08-31` | `2023-08-31` | 48099.00 | 47850.00 | 48099.00 | **47600.00** | 12 | 64 | Close < Low (-250.00) |
| `GOLDM` | `2020-03-05` | `2020-03-05` | 43050.00 | 43050.00 | 44255.00 | **42918.00** | 369 | 39 | Close < Low (-132.00) |
| `GOLDM` | `2021-03-05` | `2021-03-05` | 44279.00 | 44188.00 | 44499.00 | **44647.00** | 52 | 95 | Close > High (+148.00) |
| `GOLDM` | `2022-07-05` | `2022-07-05` | 52766.00 | 51999.00 | 52766.00 | **51610.00** | 17 | 86 | Close < Low (-389.00) |
| `GOLDPETAL` | `2020-08-31` | `2020-08-31` | 5300.00 | 5238.00 | 5300.00 | **5133.00** | 435 | 112 | Close < Low (-105.00) |
| `GOLDPETAL` | `2021-06-30` | `2021-06-30` | 4640.00 | 4548.00 | 4640.00 | **4672.00** | 105 | 410 | Close > High (+32.00) |
| `GOLDPETAL` | `2022-08-30` | `2022-08-30` | 5040.00 | 5040.00 | 5100.00 | **5120.00** | 31 | 530 | Close > High (+20.00) |
| `GOLDPETAL` | `2023-08-31` | `2023-08-31` | 5915.00 | 5867.00 | 5916.00 | **5948.00** | 54 | 195 | Close > High (+32.00) |

---

## 9. Quarantined Records Log

**Total Quarantined Records: 0**

All 3,603 source rows were either verified and accepted into `mcx_gold_normalized.csv` (3,269 rows) or reconciled as verified duplicates (334 rows). The quarantine file `data/processed/quarantine.csv` has been initialized with the standard quarantine schema and zero rejected rows.

---

## 10. Transformations & Pipeline Architecture

1. **Zero Disk Unpacking:** Read ZIP byte streams via `zipfile.ZipFile` directly into in-memory CSV text streams.
2. **Canonical Mapping:**
   - `Symbol` $\leftarrow$ `Symbol.strip()` (validated against expected contract)
   - `Date` $\leftarrow$ `Date` (parsed from `%d %b %Y` to ISO `YYYY-MM-DD`)
   - `ExpiryDate` $\leftarrow$ `Expiry Date` (parsed from `%d%b%Y` to ISO `YYYY-MM-DD`, row-level preserved)
   - `Open` $\leftarrow$ `Open` (safe float parse, null if blank)
   - `High` $\leftarrow$ `High` (safe float parse, null if blank)
   - `Low` $\leftarrow$ `Low` (safe float parse, null if blank)
   - `Close` $\leftarrow$ `Close` (safe float parse)
   - `Volume` $\leftarrow$ `Volume(Lots)` (integer, primary volume metric; `Volume(In 000's)` avoided)
   - `OpenInterest` $\leftarrow$ `Open Interest(Lots)` (integer)
3. **Determinism:** Output sorted by `Symbol ASC`, `ExpiryDate ASC`, `Date ASC`.

