# SwarnaNet — Dataset Source Audit Report

**Problem Statement:** PS-03 (Hack in Hills '26)
**Audit Execution Time:** 2026-10-25 19:11:52
**Total Inspected Archives:** 4
**Total Inspected CSV Files:** 43
**Total Raw Observations:** 3,603

---

## 1. Executive Summary

All four source ZIP archives were inspected directly in place without unzipping, modifying, or renaming source data. The archives contain exactly **43 CSV files** across four MCX Gold Futures contract types (GOLDM, GOLDGUINEA, GOLDPETAL, GOLDTEN).

| Contract Archive | Inner Directory | Expected CSVs | Actual CSVs | Total Raw Rows | Status |
|:---|:---|:---:|:---:|:---:|:---:|
| `1. GOLDM-20261025T125802Z-1-001.zip` | `GOLDM/` | 11 | 11 | 742 | Verified |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `GOLDGUINEA/` | 11 | 11 | 1,004 | Verified |
| `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `GOLDPETAL/` | 11 | 11 | 980 | Verified |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `GOLDTEN/` | 10 | 10 | 877 | Verified |
| **Total** | - | **43** | **43** | **3,603** | **Verified** |

---

## 2. In-Depth Source File Inventory

Every CSV file was analyzed for byte length, cryptographic SHA-256 hash, raw row count, row-level symbols, row-level expiry values, and trading date range.

| # | Archive | File Name | Size (B) | SHA-256 (Prefix) | Rows | Contract | Row Expiry Date | Date Range |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_05OCT2025.csv` | 20,768 | `c9a22d62ce31...` | 130 | GOLDM | 05OCT2026 | 2026-04-06 to 2026-10-05 |
| 2 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2020.csv` | 9,711 | `9dd6af3b1cee...` | 62 | GOLDM | 03JUL2020 | 2020-04-07 to 2020-07-03 |
| 3 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2021.csv` | 10,184 | `efd2c1e3ddcf...` | 65 | GOLDM | 05JUL2021 | 2021-04-06 to 2021-07-05 |
| 4 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2022.csv` | 10,001 | `56e887d0ba57...` | 64 | GOLDM | 05JUL2022 | 2022-04-06 to 2022-07-05 |
| 5 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2023.csv` | 10,032 | `399f1a2b2faa...` | 64 | GOLDM | 05JUL2023 | 2023-04-06 to 2023-07-05 |
| 6 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2026.csv` | 20,768 | `c9a22d62ce31...` | 130 | GOLDM | 05OCT2026 | 2026-04-06 to 2026-10-05 |
| 7 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_MAR2020.csv` | 7,604 | `0c907298cce7...` | 48 | GOLDM | 05MAR2020 | 2020-01-01 to 2020-03-05 |
| 8 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_MAR2021.csv` | 7,179 | `91057e538cd6...` | 45 | GOLDM | 05MAR2021 | 2021-01-01 to 2021-03-05 |
| 9 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_MAR2022.csv` | 6,984 | `76f2ce73ae61...` | 44 | GOLDM | 04MAR2022 | 2022-01-03 to 2022-03-04 |
| 10 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_MAR2023.csv` | 6,980 | `4bed8cec4195...` | 44 | GOLDM | 03MAR2023 | 2023-01-02 to 2023-03-03 |
| 11 | `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_MAR2024.csv` | 7,298 | `670b3653a9c6...` | 46 | GOLDM | 05MAR2024 | 2024-01-01 to 2024-03-05 |
| 12 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2020.csv` | 12,490 | `35e0a0d9c6e6...` | 87 | GOLDGUINEA | 31AUG2020 | 2020-05-01 to 2020-08-31 |
| 13 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2021.csv` | 12,683 | `1ca4112a9c28...` | 87 | GOLDGUINEA | 31AUG2021 | 2021-05-03 to 2021-08-31 |
| 14 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2022.csv` | 12,261 | `e7b232c65593...` | 86 | GOLDGUINEA | 30AUG2022 | 2022-05-02 to 2022-08-30 |
| 15 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2023.csv` | 12,627 | `41ddc80dc5f1...` | 88 | GOLDGUINEA | 31AUG2023 | 2023-05-01 to 2023-08-31 |
| 16 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2026.csv` | 19,553 | `452ef25d8374...` | 125 | GOLDGUINEA | 30OCT2026 | 2026-05-01 to 2026-10-23 |
| 17 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2020.csv` | 11,860 | `290860af140c...` | 83 | GOLDGUINEA | 30JUN2020 | 2020-03-02 to 2020-06-30 |
| 18 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2021.csv` | 12,491 | `81077e08099d...` | 87 | GOLDGUINEA | 30JUN2021 | 2021-03-01 to 2021-06-30 |
| 19 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2022.csv` | 12,528 | `547c701e972f...` | 87 | GOLDGUINEA | 30JUN2022 | 2022-03-01 to 2022-06-30 |
| 20 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2023.csv` | 12,515 | `0b7d9701acdd...` | 86 | GOLDGUINEA | 30JUN2023 | 2023-03-02 to 2023-06-30 |
| 21 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2024.csv` | 9,532 | `157c02440253...` | 63 | GOLDGUINEA | 28MAR2024 | 2024-01-01 to 2024-03-28 |
| 22 | `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2025.csv` | 19,553 | `452ef25d8374...` | 125 | GOLDGUINEA | 30OCT2026 | 2026-05-01 to 2026-10-23 |
| 23 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2020.csv` | 12,596 | `66df40a88da4...` | 87 | GOLDPETAL | 31AUG2020 | 2020-05-01 to 2020-08-31 |
| 24 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2021.csv` | 12,728 | `6368cdd081d4...` | 87 | GOLDPETAL | 31AUG2021 | 2021-05-03 to 2021-08-31 |
| 25 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2022.csv` | 12,603 | `1f9e7cddbdb4...` | 86 | GOLDPETAL | 30AUG2022 | 2022-05-02 to 2022-08-30 |
| 26 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2023.csv` | 12,848 | `06474b9c238e...` | 88 | GOLDPETAL | 31AUG2023 | 2023-05-01 to 2023-08-31 |
| 27 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2026.csv` | 13,000 | `6131309fb854...` | 82 | GOLDPETAL | 30OCT2026 | 2026-07-01 to 2026-10-23 |
| 28 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_JUN2020.csv` | 11,843 | `52e9d89690cc...` | 83 | GOLDPETAL | 30JUN2020 | 2020-03-02 to 2020-06-30 |
| 29 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_JUN2021.csv` | 12,765 | `3119d684f78a...` | 87 | GOLDPETAL | 30JUN2021 | 2021-03-01 to 2021-06-30 |
| 30 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_JUN2022.csv` | 12,644 | `7cfba4a6e8ce...` | 87 | GOLDPETAL | 30JUN2022 | 2022-03-01 to 2022-06-30 |
| 31 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_JUN2023.csv` | 12,596 | `81c6e213be8b...` | 86 | GOLDPETAL | 30JUN2023 | 2023-03-02 to 2023-06-30 |
| 32 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_JUN2024.csv` | 12,586 | `5fa5b240b0d9...` | 85 | GOLDPETAL | 28JUN2024 | 2024-03-01 to 2024-06-28 |
| 33 | `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_OCT2025.csv` | 19,050 | `426dbd35aeb8...` | 122 | GOLDPETAL | 30OCT2026 | 2026-05-01 to 2026-10-20 |
| 34 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_AUG2025.csv` | 10,009 | `23b20fc02a67...` | 64 | GOLDTEN | 29AUG2025 | 2025-06-02 to 2025-08-29 |
| 35 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_FEB2026.csv` | 14,770 | `2b4e1250f778...` | 92 | GOLDTEN | 30JAN2026 | 2025-09-22 to 2026-01-30 |
| 36 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_FEB2026_EXTRA.csv` | 16,965 | `562de0168998...` | 106 | GOLDTEN | 27FEB2026 | 2025-10-01 to 2026-02-27 |
| 37 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_JUN2025.csv` | 10,021 | `2d957d05c71d...` | 65 | GOLDTEN | 30JUN2025 | 2025-03-31 to 2025-06-30 |
| 38 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_JUN2026.csv` | 20,673 | `5940a13a3cfe...` | 130 | GOLDTEN | 31JUL2026 | 2026-02-01 to 2026-07-31 |
| 39 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_MAY2026.csv` | 17,034 | `a38642fb513f...` | 106 | GOLDTEN | 29MAY2026 | 2026-01-01 to 2026-05-29 |
| 40 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_NOV2025.csv` | 10,402 | `145d616df702...` | 64 | GOLDTEN | 28NOV2025 | 2025-09-01 to 2025-11-28 |
| 41 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_OCT2025.csv` | 10,310 | `465ff22e2994...` | 64 | GOLDTEN | 31OCT2025 | 2025-08-01 to 2025-10-31 |
| 42 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_OCT2026.csv` | 16,491 | `7e1d65c04824...` | 104 | GOLDTEN | 30NOV2026 | 2026-06-01 to 2026-10-23 |
| 43 | `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_OCT2026_EXTRA.csv` | 13,257 | `8f6880e91ff9...` | 82 | GOLDTEN | 30OCT2026 | 2026-07-01 to 2026-10-23 |

---

## 3. Identical File Detection (Bit-for-Bit Duplicates)

Two pairs of source CSV files share identical SHA-256 cryptographic hashes, indicating 100% byte-for-byte duplication in the raw archives:

### SHA-256: `c9a22d62ce31a34d4db3bc72087d2b9e0730be8a9054d02623e396bf88551a79` (20,768 bytes, 130 rows)
- Archive: `1. GOLDM-20261025T125802Z-1-001.zip` -> File: `1. GOLDM/GOLDM_05OCT2025.csv`
- Archive: `1. GOLDM-20261025T125802Z-1-001.zip` -> File: `1. GOLDM/GOLDM_JUL2026.csv`

### SHA-256: `452ef25d8374dd9e7bd3fe3ad33129efa2b1e48f2f9c5ce5b94b15a485298bf6` (19,553 bytes, 125 rows)
- Archive: `2. GOLDGUINEA-20261025T125803Z-1-001.zip` -> File: `2. GOLDGUINEA/GOLDGUINEA_AUG2026.csv`
- Archive: `2. GOLDGUINEA-20261025T125803Z-1-001.zip` -> File: `2. GOLDGUINEA/GOLDGUINEA_JUN2025.csv`


---

## 4. Overlapping and Fragmented Contract Observations

In addition to identical files, GOLDPETAL contains two files that cover the same contract expiry (`30OCT2026`) over overlapping date ranges:
- `3. GOLDPETAL/GOLDPETAL_OCT2025.csv` (122 rows): covers `2026-05-01` to `2026-10-20`
- `3. GOLDPETAL/GOLDPETAL_AUG2026.csv` (82 rows): covers `2026-07-01` to `2026-10-23`
- **Intersection:** 79 trading dates (`2026-07-01` to `2026-10-20`) appear in both files with 100% identical values across all price and volume fields.
- **Unique Coverage:** `GOLDPETAL_OCT2025.csv` provides 43 early trading days (May-June 2026); `GOLDPETAL_AUG2026.csv` provides 3 latest trading days (Oct 21-23, 2026).
- **Resolution:** Merging both with exact-duplicate deduplication yields a complete, continuous 125-day record for `GOLDPETAL 30OCT2026`.

---

## 5. Filename vs Row-Level Expiry Mismatches

Multiple CSV filenames encode incorrect month or year labels compared to the authoritative `Expiry Date` field within the CSV rows. The pipeline strictly enforces the row-level date and ignores misleading filename strings:

| Archive | Filename | Filename Label | Actual Row Expiry | Nature of Mismatch |
|:---|:---|:---:|:---:|:---|
| `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_05OCT2025.csv` | `05OCT2025` | `05OCT2026` | Filename specifies '05OCT2025' (2025-10-05), but row data specifies '2026-10-05' |
| `1. GOLDM-20261025T125802Z-1-001.zip` | `1. GOLDM/GOLDM_JUL2026.csv` | `JUL2026` | `05OCT2026` | Filename specifies 'JUL2026' (2026-07), but row data specifies '2026-10-05' (OCT2026) |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_AUG2026.csv` | `AUG2026` | `30OCT2026` | Filename specifies 'AUG2026' (2026-08), but row data specifies '2026-10-30' (OCT2026) |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2024.csv` | `JUN2024` | `28MAR2024` | Filename specifies 'JUN2024' (2024-06), but row data specifies '2024-03-28' (MAR2024) |
| `2. GOLDGUINEA-20261025T125803Z-1-001.zip` | `2. GOLDGUINEA/GOLDGUINEA_JUN2025.csv` | `JUN2025` | `30OCT2026` | Filename specifies 'JUN2025' (2025-06), but row data specifies '2026-10-30' (OCT2026) |
| `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_AUG2026.csv` | `AUG2026` | `30OCT2026` | Filename specifies 'AUG2026' (2026-08), but row data specifies '2026-10-30' (OCT2026) |
| `3. GOLDPETAL-20261025T125806Z-1-001.zip` | `3. GOLDPETAL/GOLDPETAL_OCT2025.csv` | `OCT2025` | `30OCT2026` | Filename specifies 'OCT2025' (2025-10), but row data specifies '2026-10-30' (OCT2026) |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_FEB2026.csv` | `FEB2026` | `30JAN2026` | Filename specifies 'FEB2026' (2026-02), but row data specifies '2026-01-30' (JAN2026) |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_JUN2026.csv` | `JUN2026` | `31JUL2026` | Filename specifies 'JUN2026' (2026-06), but row data specifies '2026-07-31' (JUL2026) |
| `4. GOLDTEN-20261025T125808Z-1-001.zip` | `4. GOLDTEN/GOLDTEN_OCT2026.csv` | `OCT2026` | `30NOV2026` | Filename specifies 'OCT2026' (2026-10), but row data specifies '2026-11-30' (NOV2026) |

---

## 6. Data Integrity and Exchange Mechanics Findings

1. **Zero-Volume Trading Days:** Across the source dataset, exactly 205 raw rows (202 unique accepted rows after deduplication) exhibit `Volume(Lots) = 0`. In every instance, `Open`, `High`, and `Low` fields are empty strings. Settlement `Close` and `Open Interest` are present. These missing OHLC values reflect authentic zero-liquidity days and must NOT be fabricated.
2. **Settlement Prices Outside High-Low Range:** Exactly 14 trading days have settlement `Close` outside the daily `[Low, High]` traded range. Every single instance occurs on the final contract expiry date, where MCX establishes final settlement price (FSP) using polled domestic IBJA spot prices. These prices are valid exchange settlement data and are retained.
3. **Symbol Whitespace:** Raw `Symbol` values contain trailing whitespace padding (e.g. `'GOLDM        '`, `'GOLDGUINEA   '`). Stripping whitespace normalizes all values to clean canonical tokens.

