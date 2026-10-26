# SwarnaNet

### MCX Commodity Derivatives Intelligence & Cross-Contract Relative Value Terminal

**SwarnaNet** is a quantitative analytics platform designed to analyze Multi Commodity Exchange of India (MCX) gold contracts, evaluate cross-contract relative-value opportunities, and validate trading strategies using historical market data and backtesting.

Developed for **Hack in Hills '26 — Problem Statement 03**, SwarnaNet combines historical market-data processing, quantitative analysis, opportunity validation, and interactive financial dashboards in a unified terminal.

> **Project status:** Prototype and quantitative research platform. Trading signals and backtest results are research outputs, not guaranteed returns or investment advice.

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Supported Contracts](#supported-contracts)
* [System Architecture](#system-architecture)
* [Data Pipeline](#data-pipeline)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Quantitative Validation](#quantitative-validation)
* [Getting Started](#getting-started)
* [Environment Configuration](#environment-configuration)
* [Running the Application](#running-the-application)
* [Testing and Verification](#testing-and-verification)
* [Data Refresh](#data-refresh)
* [Deployment](#deployment)
* [Security](#security)
* [Limitations](#limitations)
* [Disclaimer](#disclaimer)

---

## Overview

Gold contracts on MCX differ in contract size, purity, expiry, liquidity, and trading characteristics. Comparing them directly without normalization can produce misleading relative-value estimates.

SwarnaNet provides a structured analytical workflow to:

* Ingest and normalize historical MCX gold data.
* Maintain contract-specific expiry information.
* Generate quantitative features.
* Evaluate cross-contract relative-value opportunities.
* Backtest trading strategies while accounting for transaction costs.
* Present analytical results through an interactive dashboard.
* Store and retrieve supported application data through Supabase.
* Refresh market data through a controlled pipeline.

The system prioritizes **data integrity, quantitative transparency, reproducibility, and realistic transaction-cost analysis**.

## Key Features

### 1. Historical Market Data

* Structured ingestion of MCX gold-contract CSV archives.
* Canonical schema normalization.
* Standardized trading and expiry dates.
* Duplicate-record handling.
* Data-quality checks and validation reports.

### 2. Quantitative Feature Engineering

* Contract-level historical feature generation.
* Structured data preparation for cross-contract comparisons.
* Reusable calculations to reduce unnecessary recomputation.

### 3. Opportunity Validation

* Cross-contract relative-value analysis.
* Contract-aware comparisons.
* Quantitative validation of candidate opportunities.
* Evaluation of whether an apparent pricing difference remains meaningful after estimated trading costs.

### 4. Backtesting

* Historical strategy evaluation.
* Trade and equity-curve records.
* Performance metrics.
* Transaction-cost-aware PnL calculations.
* Separation of gross and net performance.

### 5. Interactive Dashboard

* Market-data exploration.
* Quantitative analytics and opportunity information.
* Backtesting results.
* Data-source and refresh-status visibility.
* Judge-demo workflow.

### 6. Supabase Integration

* PostgreSQL-backed application data.
* Supported API and database integration.
* Configurable authentication and access controls where implemented.

### 7. Data Refresh Pipeline

* Controlled ingestion of new data.
* Normalization and validation.
* Feature and opportunity recalculation.
* Database synchronization where configured.
* Refresh-status and audit reporting.

---

## Supported Contracts

SwarnaNet's initial dataset covers four MCX gold-contract categories.

| Contract   | Contract Size | Quoted/Reference Convention               |
| ---------- | ------------: | ----------------------------------------- |
| GOLDM      |     100 grams | Quoted per 10 grams                       |
| GOLDTEN    |      10 grams | Contract-specific exchange specifications |
| GOLDGUINEA |       8 grams | Contract-specific exchange specifications |
| GOLDPETAL  |        1 gram | Contract-specific exchange specifications |

**Important:** Contract specifications, purity, listing periods, expiry rules, and quotation conventions must be verified against official MCX specifications before using these values in live calculations. GOLDTEN's availability is date-dependent.

The quantitative engine must account for relevant differences in contract specifications before comparing prices.

---

## System Architecture

The application follows a data-processing and analytics workflow.

```text
MCX Historical Data
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
Opportunity Validation
        |
        v
Historical Backtesting
        |
        v
Metrics and Analytical Outputs
        |
        v
Backend API / Supabase
        |
        v
SwarnaNet Dashboard
```

The exact implementation and execution order are determined by the current source code and configuration.

---

## Data Pipeline

The ingestion pipeline processes source archives and produces normalized market data.

### Processing Stages

1. Read source CSV files.
2. Normalize supported column names.
3. Parse trading dates and expiry dates.
4. Validate required market-data fields.
5. Identify duplicate records.
6. Preserve row-level contract expiry information.
7. Sort accepted records consistently.
8. Write normalized outputs and validation reports.

### Canonical Schema

The normalized dataset uses the following nine fields:

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

Source-column mappings and units should be checked against the actual source files and ingestion implementation.

### Reported Initial Dataset

The project's previously reported ingestion audit recorded:

| Metric                     | Reported Value |
| -------------------------- | -------------: |
| Source CSV files           |             43 |
| Source rows                |          3,603 |
| Accepted normalized rows   |          3,269 |
| Duplicate rows removed     |            334 |
| Quarantined malformed rows |              0 |

These figures describe the reported ingestion run and should be revalidated if the source archives or pipeline change.

---

## Technology Stack

| Technology          | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| Python              | Data ingestion and quantitative processing       |
| TypeScript          | Typed application development                    |
| Next.js             | Web application and API routes                   |
| React               | User interface                                   |
| Supabase            | PostgreSQL and configured backend services       |
| PostgreSQL          | Relational data storage                          |
| pytest              | Python testing                                   |
| ESLint              | JavaScript/TypeScript linting                    |
| TypeScript compiler | Static type checking                             |
| Vercel              | Frontend deployment platform                     |
| Render              | Potential backend or service deployment platform |

Confirm the installed versions and actual deployment configuration from the project's dependency and configuration files.

---

## Project Structure

The following is an illustrative structure. The actual repository may use different paths; preserve the existing structure until it has been audited.

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

The `template/` directory can hold reference templates or supporting files contributed by collaborators. It should not contain secrets or duplicate application configuration. Its presence alone does not normally prevent deployment.

**Do not restructure the actual repository to match this example blindly.** Keep paths aligned with existing imports, scripts, build configuration, and deployment settings.

---

## Quantitative Validation

A backtest is only useful when its assumptions and costs are visible.

SwarnaNet distinguishes between:

* Gross PnL before estimated transaction costs.
* Transaction costs.
* Net PnL after estimated transaction costs.
* Risk-adjusted performance metrics.
* Out-of-sample results, where implemented.

### Previously Reported Backtest Snapshot

| Metric                     | Reported Result |
| -------------------------- | --------------: |
| Backtest trades            |              42 |
| Gross PnL                  |       ₹5,031.00 |
| Transaction costs          |      ₹15,411.76 |
| Net PnL                    |     -₹10,380.76 |
| Net Sharpe ratio           |         -1.7888 |
| Out-of-sample net PnL      |      -₹5,840.35 |
| Out-of-sample Sharpe ratio |         -3.5024 |

These are previously reported project outputs, not independently revalidated results.

The reported strategy was classified as **friction-constrained** because estimated transaction costs exceeded the gross edge.

A theoretical pricing discrepancy does not automatically represent a profitable, executable trading opportunity.

---

## Getting Started

### Prerequisites

Install the tools required by the actual project configuration:

* Git
* Python
* Node.js and npm
* A configured Supabase project, if remote database functionality is required

Use the Python and Node.js versions specified in the repository's configuration files, if present.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SWARNANET
```

Replace the placeholder with your actual repository URL.

### 2. Install Frontend Dependencies

Run the installation command from the directory containing the frontend's `package.json`:

```bash
npm install
```

If the project uses a lockfile, prefer the corresponding reproducible installation command, such as `npm ci`.

### 3. Set Up Python

Create a virtual environment from the project root:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install the project's documented Python dependencies, if any:

```bash
pip install -r requirements.txt
```

If the repository does not contain `requirements.txt`, follow the actual dependency configuration rather than guessing dependencies.

### 4. Configure Environment Variables

Create a local environment file based on the project's environment-variable documentation.

For example:

```powershell
Copy-Item .env.example .env.local
```

Use this command only if `.env.example` exists and matches the application's actual configuration.

Fill in the required values locally. Never commit real credentials.

---

## Environment Configuration

Environment variables depend on the implemented application and deployment setup.

Potential configuration categories include:

| Category                         | Purpose                                               |
| -------------------------------- | ----------------------------------------------------- |
| Supabase project URL             | Connect to the configured Supabase project            |
| Supabase publishable key         | Client-side access under configured security policies |
| Supabase secret/service-role key | Privileged server-side operations, only if required   |
| Python runtime configuration     | Pipeline and data-processing settings                 |

These are categories, not confirmed variable names. Use the exact variable names referenced in the source code.

**Security requirements:**

* Do not commit `.env.local`, `.env`, or files containing real secrets.
* Never expose a Supabase service-role or secret key in client-side code.
* Configure Row Level Security (RLS) and appropriate database permissions.
* Keep `.env.example` limited to placeholder values.
* Rotate any credential that has been accidentally exposed.

---

## Running the Application

Run the application using the scripts defined in the relevant `package.json` and Python configuration.

For a Next.js frontend, the typical development command is:

```bash
npm run dev
```

The actual execution command, port, and available routes depend on the current configuration.

### Running the Data Pipeline

The previously reported ingestion entry point is:

```bash
python src/pipeline/ingest.py
```

Run it only after confirming that the source data and expected paths are available.

The refresh pipeline and API routes should be run and tested according to their current implementation and documented prerequisites.

---

## Testing and Verification

Run the checks configured by the repository.

### Python Tests

```bash
python -m pytest
```

### TypeScript Validation

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

These commands assume the corresponding tools and scripts are configured.

A successful build does not by itself prove that the market-data pipeline, database permissions, API routes, or quantitative results are correct. Test those components separately.

---

## Data Refresh

SwarnaNet has a reported refresh workflow for processing updated market data and synchronizing supported outputs.

Before running a refresh:

1. Verify the incoming data source.
2. Confirm the trading and expiry dates.
3. Validate source columns and units.
4. Run the configured refresh process.
5. Inspect the refresh status and validation reports.
6. Verify that database updates and downstream calculations succeeded.

Do not interpret a successful HTTP response as proof that the entire pipeline completed correctly. Confirm the actual processing results.

Automated refresh scheduling depends on the execution environment and availability of valid source data.

---

## Deployment

SwarnaNet may be deployable using Vercel for the web application and Render for compatible backend services. The correct arrangement depends on the current repository structure.

### Before Deploying to Vercel

* Confirm the correct project root directory.
* Verify the build command and output configuration.
* Configure required environment variables.
* Confirm that frontend routes and API dependencies work in the production environment.
* Check that no local Windows paths are required at runtime.

### Before Deploying to Render

* Confirm the service type and entry point.
* Configure Python or Node.js versions and dependencies.
* Set environment variables in the service dashboard.
* Verify database connectivity and access controls.
* Confirm that long-running refresh jobs and scheduled tasks are supported by the chosen service configuration.

### Deployment Warning

A separate `template/` directory generally does not affect deployment by itself. However, build scripts, imports, workspace configuration, and deployment root settings can change that behavior.

Validate the actual deployment configuration before publishing.

---

## Security

* Never commit credentials, private keys, access tokens, or real environment files.
* Review `.gitignore` before staging files.
* Avoid committing unnecessary build artifacts and local caches.
* Assess large datasets before uploading them to GitHub.
* Do not assume that hiding a file in the GitHub interface removes it from repository history.
* Use server-side authorization for privileged database operations.
* Review Supabase Row Level Security policies.
* Avoid logging sensitive credentials or private user information.

---

## Limitations

* Results depend on the quality and completeness of available historical data.
* Historical performance does not guarantee future performance.
* Estimated transaction costs may differ from actual execution costs.
* Historical daily market data does not establish live executable prices.
* Statistical relationships can change over time.
* Opportunities may disappear after accounting for liquidity, slippage, brokerage, taxes, and other costs.
* The platform should not be represented as a live execution terminal unless live data and execution integrations have actually been implemented and verified.

---

## Disclaimer

SwarnaNet is a quantitative research and analytics prototype developed for educational, research, and demonstration purposes.

It does not guarantee profits, provide guaranteed arbitrage opportunities, or constitute financial, investment, or trading advice. Historical backtest results may not represent future performance. Users must independently validate data, model assumptions, transaction costs, and applicable regulatory requirements before making financial decisions.

---

**SwarnaNet — Quantitative Analysis. Transparent Validation. Data-Driven Decisions.**
