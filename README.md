                                                                     
# SwarnaNet

### MCX Gold Derivatives Intelligence & Cross-Contract Analysis

**Hack in Hills ’26 · Problem Statement 03**

SwarnaNet is a project for exploring historical MCX gold-contract data and checking whether differences between contracts might represent a useful relative-value opportunity. The pipeline brings raw CSV files into a consistent format, while the analysis and backtesting account for contract specifications and estimated trading costs.

**[Open Frontend](https://swarna-net.vercel.app/) · [Backend API](https://swarnanet.onrender.com/)**

## The Problem

MCX gold contracts can differ in size, purity, quotation units, and expiry. Comparing their raw prices without accounting for these differences can lead to misleading conclusions. Even a real price gap may not be worth trading once brokerage, taxes, exchange charges, and slippage are considered.

## What's Included

- Historical CSV ingestion and schema normalization.
- Trading-date and contract-expiry parsing, preserving expiry dates from each source row.
- Duplicate detection and data-quality reports.
- A normalized dataset for downstream analysis.
- Cross-contract opportunity analysis and historical backtesting using the implemented strategy.
- A web interface for viewing available data and analytical results.

## System Architecture

```mermaid
flowchart TD
    A["MCX Gold CSV Archives"] --> B["Python Ingestion Pipeline"]
    B --> C["Normalize and Validate"]

    C --> D[("Canonical Dataset")]
    C --> E["Audit Reports"]

    D --> F["Quantitative Features"]
    F --> G["Opportunity Evaluation"]
    G --> H["Cost-Aware Backtesting"]
    H --> I["Backend API · Render"]

    I <--> J[("Supabase / PostgreSQL")]
    I <--> K["Frontend Dashboard · Vercel"]

    classDef blue fill:#082F55,stroke:#3B82F6,color:#FFFFFF,stroke-width:1px
    class A,B,C,D,E,F,G,H,I,J,K blue

    linkStyle default stroke:#3B82F6,stroke-width:1.5px
```

*The diagram illustrates the intended architecture. Verify the actual backend and database connections before claiming they are operational.*-level view of the application flow. The deployed URLs are listed above; actual API and database connectivity should be checked against the current deployment and configuration.


## How the Data Pipeline Works

The pipeline converts raw MCX CSV archives into a structured dataset for quantitative analysis. It also records duplicate handling and validation results.

```mermaid
flowchart TD
    A["MCX CSV Archives"] --> B["Read ZIP and CSV Files"]
    B --> C["Map Source Headers"]
    C --> D["Parse Trading and Expiry Dates"]
    D --> E["Normalize Fields"]
    E --> F["Detect Duplicate Records"]
    F --> G{"Validation Outcome"}

    G -->|Accepted| H["Sort by Symbol, ExpiryDate and Date"]
    G -->|Rejected| I["Quarantine CSV"]

    H --> J[("Normalized Dataset")]
    I --> K["Validation Report"]
    J --> K
    F --> L["Duplicate Count and Audit"]
    L --> K

    classDef blue fill:#082F55,stroke:#3B82F6,color:#FFFFFF,stroke-width:1px
    classDef decision fill:#123C70,stroke:#60A5FA,color:#FFFFFF,stroke-width:2px

    class A,B,C,D,E,F,H,I,J,K,L blue
    class G decision

    linkStyle default stroke:#3B82F6,stroke-width:1.5px
```

### Pipeline Highlights

- **In-memory processing:** Reads ZIP archives and CSV files without extracting all source files first.
- **Canonical schema:** Standardizes source columns into nine fields, including OHLC prices, volume, and open interest.
- **Expiry awareness:** Preserves the expiry date recorded in each source row.
- **Duplicate handling:** Removes duplicate records and accounts for them in the validation results.
- **Traceable outputs:** Generates the normalized dataset, quarantine log, and audit reports.


## Dataset Audit

The following figures were reported in a previous ingestion run. Rerun the pipeline and review the reports to confirm them against the current dataset.

| Metric | Reported Result |
|---|---:|
| Source CSV files | 43 |
| Raw source rows | 3,603 |
| Accepted normalized rows | 3,269 |
| Duplicate rows removed | 334 |
| Quarantined rows | 0 |
| Ingestion tests passed | 7 |

### Row Reconciliation

```mermaid
flowchart TD
    A["3,603 Source Rows"] --> B["3,269 Accepted"]
    A --> C["334 Duplicates"]
    A --> D["0 Quarantined"]

    classDef blue fill:#082F55,stroke:#3B82F6,color:#FFFFFF,stroke-width:1px
    class A,B,C,D blue
    linkStyle default stroke:#3B82F6,stroke-width:1.5px
```

**Reconciliation:** `3,603 = 3,269 + 334 + 0`

### Accepted Records by Contract

| Contract | Accepted Rows |
|---|---:|
| GOLDM | 612 |
| GOLDGUINEA | 879 |
| GOLDPETAL | 901 |
| GOLDTEN | 877 |

These figures describe the previously reported run. They should not replace a review of the source data or individual data-quality exceptions.

## Backtesting Snapshot

The following results were reported in an earlier backtest and have not been independently revalidated here.

| Metric | Reported Result |
|---|---:|
| Trades | 42 |
| Gross PnL | ₹5,031.00 |
| Estimated transaction costs | ₹15,411.76 |
| **Net PnL** | **−₹10,380.76** |
| Net Sharpe ratio | −1.7888 |
| Out-of-sample net PnL | −₹5,840.35 |
| Out-of-sample Sharpe ratio | −3.5024 |

### What the Results Show

In the reported run, estimated transaction costs exceeded gross PnL, leaving the strategy with a net loss.

This is an important result to keep visible: identifying a price difference is not the same as proving that a trade is profitable. Results depend on the strategy rules, data quality, and cost assumptions.

## Supported Contracts

SwarnaNet covers four MCX gold-contract categories:

`GOLDM` · `GOLDGUINEA` · `GOLDPETAL` · `GOLDTEN`

Contract specifications and quotation conventions can vary by contract and date. Verify contract size, purity, quotation units, and expiry rules against the applicable official MCX specifications before relying on quantitative comparisons.


## Technology Stack

| Component | Technology |
|---|---|
| Ingestion and processing | Python |
| Processed data and reports | CSV, Markdown |
| Pipeline testing | pytest |
| Frontend | Next.js, React, TypeScript |
| Database integration | Supabase / PostgreSQL |
| Frontend hosting | Vercel |
| Backend hosting | Render |

*Technology roles should be confirmed against the current repository and deployment configuration.*


Check the repository configuration for exact dependencies and versions.
Project file structure
SWARNANET/
├── frontend/                         # Web application
│   └── src/
│       ├── app/                      # Pages and routes
│       ├── components/               # Reusable interface components
│       ├── hooks/                    # Shared React hooks
│       ├── lib/                      # Utilities and client setup
│       └── types/                    # TypeScript types
├── dataset/                          # Source MCX data, grouped by contract
│   ├── GOLDM/
│   ├── GOLDGUINEA/
│   ├── GOLDPETAL/
│   └── GOLDTEN/
├── src/
│   └── pipeline/
│       └── ingest.py                 # Ingestion and normalization
├── data/
│   └── processed/
│       ├── mcx_gold_normalized.csv
│       └── quarantine.csv
├── reports/
│   ├── ingestion_validation.md
│   └── dataset_audit.md
├── tests/
│   └── test_ingestion.py
├── .env.example                      # Example environment settings, if present
└── README.md
This is a guide to the main project areas and reported output files. Folder names can differ between local copies, so use the current repository as the source of truth.
Run locally
From the project root, install dependencies using the project’s setup files, then run the pipeline and tests:
python src/pipeline/ingest.py
python -m pytest
These commands were used in the reported ingestion workflow. Confirm that the paths and required dependencies match your current checkout. Set local environment variables from the provided example configuration, if available, and do not commit real credentials.

Expected pipeline outputs from the reported run:
- data/processed/mcx_gold_normalized.csv
- data/processed/quarantine.csv
- reports/ingestion_validation.md
- reports/dataset_audit.md
Future work
There are several practical areas to improve next:
- Finish the login system: Add Supabase sign-up, login, logout, password reset, and session handling. Protect private pages and configure Row Level Security policies before storing user-specific data.
- Add more market history: Bring in more years of reliable MCX data and keep source details with each import. If machine-learning models are added or used in the analysis, retrain and evaluate them on the expanded data rather than assuming more rows automatically improve results.
- Make ingestion more robust: Support incremental imports, detect changed CSV headers, make reruns safe, and add clearer error logs and row-level reconciliation.
- Improve data checks: Flag missing prices, unusual volume or open-interest changes, and inconsistent records for review.
- Test strategy assumptions more thoroughly: Review transaction fees and slippage, run sensitivity checks, and expand walk-forward and out-of-sample testing.
- Polish the dashboard: Show when data was last refreshed, provide useful exports, and make contract and expiry comparisons easier to inspect.
- Add end-to-end checks: Test the pipeline, API, database permissions, refresh process, and frontend together—not just as separate parts.
These are planned improvements, not statements that the features are already complete.
Note on use
SwarnaNet is a research and demonstration project, not a trading recommendation. Historical backtests do not predict future results, and the reported strategy results above were negative after estimated costs. Any real trading decision would need independent checks of the data, contract terms, liquidity, execution assumptions, and costs.
