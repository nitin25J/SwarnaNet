# SWARNANET

### MCX Commodity Derivatives Intelligence & Cross-Contract Relative Value Terminal

**Quantitative Analytics | Contract-Aware Pricing | Opportunity Validation | Cost-Aware Backtesting**

**Hack in Hills '26 — Problem Statement 03**

> A price difference is not an opportunity until the numbers survive the costs.

SwarnaNet is a quantitative research and analytics platform designed to analyze historical MCX gold contracts, investigate cross-contract relative-value opportunities, and evaluate trading strategies through transaction-cost-aware backtesting.

Rather than treating every pricing discrepancy as a trading opportunity, SwarnaNet focuses on contract-aware comparisons, structured data processing, quantitative validation, and transparent performance evaluation.

---

## Table of Contents

* [The Problem](#the-problem)
* [Our Approach](#our-approach)
* [Key Features](#key-features)
* [Supported Contracts](#supported-contracts)
* [How SwarnaNet Works](#how-swarnanet-works)
* [Quantitative Engine](#quantitative-engine)
* [Data Pipeline](#data-pipeline)
* [Backtesting and Results](#backtesting-and-results)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Environment Configuration](#environment-configuration)
* [Testing and Validation](#testing-and-validation)
* [Data Refresh](#data-refresh)
* [Deployment](#deployment)
* [Security and Data Integrity](#security-and-data-integrity)
* [Limitations](#limitations)
* [Future Scope](#future-scope)
* [Disclaimer](#disclaimer)

---

## The Problem

MCX gold contracts differ in contract size, purity, expiry, quotation conventions, and trading characteristics.

These differences make cross-contract comparisons challenging.

A price difference between two contracts does not automatically indicate mispricing. The apparent discrepancy may result from differences in contract specifications, expiry, market conditions, or the units used to quote prices.

Even when a potential relative-value opportunity exists, transaction costs can eliminate its theoretical profitability.

A reliable analytical system must therefore answer three questions:

1. Are the contracts being compared on a consistent basis?
2. Does the observed relationship support a meaningful relative-value hypothesis?
3. Does the strategy remain viable after estimated transaction costs?

SwarnaNet is designed to investigate these questions through a structured quantitative workflow.

## Our Approach

SwarnaNet connects historical market-data processing, contract-aware quantitative analysis, opportunity evaluation, and backtesting in one platform.

The system is designed around four principles:

* **Data integrity:** Normalize and validate market observations before using them in calculations.
* **Quantitative rigor:** Evaluate candidate opportunities using the implemented analytical methodology.
* **Cost awareness:** Distinguish gross performance from net performance after estimated trading costs.
* **Transparency:** Preserve validation outputs and expose unfavorable results instead of presenting every signal as profitable.

The objective is to support better-informed quantitative research, not to manufacture trading opportunities.

---

## Key Features

### Historical Market Data Processing

* Ingest historical MCX gold-contract CSV files.
* Normalize source columns into a canonical schema.
* Parse trading dates and contract expiry dates.
* Identify duplicate records.
* Preserve row-level expiry information.
* Generate structured datasets and validation reports.

### Quantitative Feature Engineering

* Generate contract-level quantitative features.
* Prepare historical observations for cross-contract analysis.
* Reuse structured calculations across downstream processing stages.
* Maintain consistency between analytical outputs and their underlying data.

### Cross-Contract Opportunity Validation

* Evaluate potential relative-value discrepancies.
* Account for relevant contract characteristics.
* Apply the quantitative criteria implemented in the engine.
* Assess whether estimated trading costs undermine the apparent opportunity.

### Historical Backtesting

* Evaluate strategies against historical observations.
* Record trades and equity-curve data.
* Calculate gross and net PnL.
* Account for estimated transaction costs.
* Report risk-adjusted performance metrics.
* Evaluate out-of-sample performance where implemented.

### Interactive Analytics Dashboard

* Explore supported market data.
* Review quantitative outputs.
* Inspect opportunity-analysis results.
* Examine backtesting metrics.
* View supported data-source and refresh-status information.

### Supabase Integration

* Integrate supported application data with Supabase and PostgreSQL.
* Persist configured analytical records.
* Apply database access controls and Row Level Security where configured.

### Controlled Data Refresh

* Process incoming market data.
* Normalize and validate new observations.
* Recalculate dependent analytical outputs.
* Synchronize supported records with the configured database.
* Maintain refresh-status and audit information.

---

## Supported Contracts

SwarnaNet's initial dataset covers four MCX gold-contract categories.

| Contract   | Reference Contract Size | Analytical Considerations                                          |
| ---------- | ----------------------: | ------------------------------------------------------------------ |
| GOLDM      |               100 grams | Quoted per 10 grams; contract specifications must be accounted for |
| GOLDTEN    |                10 grams | Contract-specific quotation, purity, and listing details           |
| GOLDGUINEA |                 8 grams | Contract-specific specifications                                   |
| GOLDPETAL  |                  1 gram | Contract-specific specifications                                   |

Contract sizes and quotation conventions must be verified against the applicable official MCX specifications before being used in production calculations. Contract availability and expiry rules can vary by date.

The quantitative engine must account for relevant differences in contract specifications rather than comparing raw prices without adjustment.

---

## How SwarnaNet Works

The platform follows a structured analytical workflow.

1. **Ingestion:** Read supported historical MCX market-data files.
2. **Normalization:** Convert supported source fields into a consistent schema.
3. **Validation:** Check records, identify duplicates, and generate audit outputs.
4. **Feature engineering:** Generate quantitative features from the accepted observations.
5. **Opportunity evaluation:** Analyze candidate cross-contract relationships.
6. **Backtesting:** Evaluate the implemented strategy against historical data.
7. **Cost analysis:** Compare gross results with estimated transaction costs and net performance.
8. **Presentation:** Make supported analytical outputs available through the application.
9. **Refresh:** Process updated data and recalculate dependent outputs through the configured refresh workflow.

### Data Flow

```text
Historical MCX Data
        |
        v
Data Ingestion
        |
        v
Normalization and Validation
        |
        v
Canonical Market Dataset
        |
        v
Quantitative Feature Engineering
        |
        v
Opportunity Evaluation
        |
        v
Historical Backtesting
        |
        v
Transaction-Cost Analysis
        |
        v
Database and API Integration
        |
        v
SwarnaNet Analytics Dashboard
```

The diagram represents the intended analytical flow. The exact execution sequence depends on the implemented pipeline and application configuration.

---

## Quantitative Engine

The quantitative engine is responsible for transforming historical observations into structured analytical outputs.

### Contract-Aware Price Comparison

Contracts may differ in size, purity, quotation units, and expiry.

Comparisons must account for the relevant differences before interpreting a price discrepancy as a potential relative-value opportunity.

### Feature Engineering

The pipeline generates structured features from historical market observations. These features support downstream analysis and are stored in the project's configured output locations.

### Opportunity Evaluation

The engine evaluates candidate opportunities according to its implemented quantitative criteria.

A detected discrepancy is a hypothesis to investigate, not proof of mispricing or guaranteed profitability.

### Statistical Analysis

Where implemented, statistical methods can be used to investigate relationships between contract prices, including their stability and potential mean-reverting behavior.

Statistical significance alone does not establish that a strategy is economically viable.

### Transaction-Cost Analysis

The engine distinguishes between gross strategy performance and net performance after estimated costs.

This is essential because a small theoretical pricing difference can be overwhelmed by brokerage, exchange charges, taxes, slippage, and other execution-related expenses.

> **A candidate signal becomes more credible only when its assumptions, data, and economic viability withstand validation.**

---

## Data Pipeline

The ingestion pipeline converts source CSV archives into a normalized dataset suitable for quantitative processing.

### Processing Stages

1. Read supported source CSV files.
2. Map source headers into canonical fields.
3. Parse trading dates and expiry dates.
4. Validate the relevant source fields.
5. Identify duplicate records.
6. Preserve the expiry date recorded in each row.
7. Sort accepted observations consistently.
8. Write normalized outputs and validation reports.

### Canonical Dataset Schema

The normalized dataset contains nine canonical fields.

| Field          | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `Symbol`       | Contract identifier                                          |
| `Date`         | Trading date                                                 |
| `ExpiryDate`   | Contract expiry date                                         |
| `Open`         | Opening price                                                |
| `High`         | Highest price                                                |
| `Low`          | Lowest price                                                 |
| `Close`        | Closing or settlement value, according to source conventions |
| `Volume`       | Normalized trading volume                                    |
| `OpenInterest` | Open-interest value                                          |

The implementation maps volume and open interest from their designated source fields. The units and source semantics must be preserved when processing new data.

### Reported Dataset Audit

The previously reported ingestion audit recorded the following results.

| Metric                     | Reported Count |
| -------------------------- | -------------: |
| Source CSV files           |             43 |
| Raw source rows            |          3,603 |
| Accepted normalized rows   |          3,269 |
| Duplicate rows removed     |            334 |
| Quarantined malformed rows |              0 |

These figures describe the reported audit and should be checked against the latest validation report if the source archives or processing logic change.

### Data Integrity

The pipeline preserves row-level expiry information rather than inferring expiry dates from filenames.

Duplicate handling and data-quality validation are important because repeated or incorrectly interpreted observations can distort quantitative features and backtest results.

The presence of an accepted record does not automatically mean that every field contains a valid market observation. Missing prices, zero-volume records, and settlement values outside observed daily ranges require appropriate interpretation according to source conventions.

---

## Backtesting and Results

SwarnaNet evaluates the implemented strategy using historical market observations and estimated transaction costs.

The following figures are from a previously reported backtest run. They are included to document the reported outcome, not as independently revalidated performance claims.

### Reported Backtest Snapshot

| Metric                      | Reported Result |
| --------------------------- | --------------: |
| Number of trades            |              42 |
| Gross PnL                   |       ₹5,031.00 |
| Estimated transaction costs |      ₹15,411.76 |
| Net PnL                     |     -₹10,380.76 |
| Net Sharpe ratio            |         -1.7888 |
| Out-of-sample net PnL       |      -₹5,840.35 |
| Out-of-sample Sharpe ratio  |         -3.5024 |

### Interpretation

The reported strategy generated positive gross PnL but incurred estimated transaction costs greater than its gross profit.

Consequently, the reported net PnL was negative.

The strategy was classified as **friction-constrained** because the estimated cost hurdle exceeded the observed gross edge.

This result highlights an important distinction between identifying a price discrepancy and demonstrating an economically viable strategy.

The results do not establish that the strategy is profitable. Further evaluation would require examining the strategy assumptions, signal quality, data limitations, transaction-cost estimates, and out-of-sample behavior.

**Negative results are part of quantitative validation. They should not be hidden or reclassified to make a strategy appear successful.**

---

## Technology Stack

The project uses the following technologies, subject to the actual repository configuration.

| Technology          | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| Python              | Data ingestion and quantitative processing                 |
| TypeScript          | Typed application development                              |
| Next.js             | Web application and API routes                             |
| React               | User interface                                             |
| Supabase            | Database and configured backend services                   |
| PostgreSQL          | Relational data storage                                    |
| pytest              | Python testing                                             |
| ESLint              | Code quality and linting                                   |
| TypeScript compiler | Static type checking                                       |
| Vercel              | Frontend hosting, when configured                          |
| Render              | Compatible backend or processing services, when configured |

Refer to the project's dependency and configuration files for exact versions and installed packages.

---

## System Architecture

SwarnaNet separates the responsibilities of the user interface, application API, quantitative pipeline, and database integration.

| Layer                   | Responsibility                                         |
| ----------------------- | ------------------------------------------------------ |
| Presentation            | Dashboard and analytical views                         |
| Application             | API request handling and application logic             |
| Data ingestion          | Source-file processing and normalization               |
| Quantitative processing | Feature generation and opportunity evaluation          |
| Backtesting             | Historical strategy evaluation and performance metrics |
| Persistence             | Configured Supabase and PostgreSQL integration         |
| Validation              | Automated tests, reports, and data-quality checks      |
| Refresh                 | Controlled processing of updated data                  |

This separation helps keep quantitative calculations testable and makes it easier to identify where a data or calculation error originates.

The actual repository structure remains the authoritative source for implementation details.

---

## Project Structure

The following tree illustrates the project's major responsibilities. It is not a guarantee that every directory exists at exactly this location.

```text
SWARNANET/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── api/
│       │   ├── dashboard/
│       │   └── login/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── src/
│   └── pipeline/
│       ├── ingest.py
│       └── refresh.py
├── scripts/
│   └── refresh_pipeline.py
├── data/
│   ├── incoming/
│   └── processed/
├── reports/
├── tests/
├── template/
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

### Directory Responsibilities

* `frontend/` — frontend application code, if separated into its own directory.
* `src/pipeline/` — ingestion and refresh processing modules.
* `scripts/` — supporting execution scripts.
* `data/incoming/` — incoming market-data files, where configured.
* `data/processed/` — normalized datasets and generated analytical outputs.
* `reports/` — validation and processing reports.
* `tests/` — automated tests.
* `template/` — collaborator-provided templates or reference material.
* `.env.example` — placeholder configuration documentation.
* `.gitignore` — rules for excluding sensitive files and unnecessary generated artifacts.

The exact directory layout should match the actual repository. Do not move files merely to match this illustration.

---

## Getting Started

### Prerequisites

Install the tools required by the project:

* Git
* Python
* Node.js and npm
* Access to the configured Supabase project, if required

Use the versions specified in the repository configuration files when available.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SWARNANET
```

Replace the placeholder with the actual repository URL.

### 2. Install Frontend Dependencies

Navigate to the directory containing the applicable `package.json`.

Run:

```bash
npm install
```

If the repository includes a valid npm lockfile, prefer `npm ci` for a reproducible installation.

### 3. Configure Python

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install the dependencies documented by the repository. If a `requirements.txt` file exists:

```bash
pip install -r requirements.txt
```

If Python dependencies are managed differently, follow the actual configuration instead of creating an assumed dependency list.

### 4. Configure Environment Variables

Use the environment-variable names referenced by the application.

If a matching `.env.example` exists
