-- ====================================================================
-- SWARNANET — Supabase PostgreSQL Schema Migration
-- Commodity Derivatives Intelligence & Cross-Contract Arbitrage Engine
-- ====================================================================

-- 1. Canonical Normalized Market Observations Table
CREATE TABLE IF NOT EXISTS public.mcx_normalized_observations (
    symbol TEXT NOT NULL,
    date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    open_interest BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT pk_mcx_normalized_observations PRIMARY KEY (symbol, date, expiry_date)
);

CREATE INDEX IF NOT EXISTS idx_mcx_norm_date ON public.mcx_normalized_observations(date);
CREATE INDEX IF NOT EXISTS idx_mcx_norm_symbol_expiry ON public.mcx_normalized_observations(symbol, expiry_date);

-- 2. Quantitative Features & Pairwise Spread Table
CREATE TABLE IF NOT EXISTS public.mcx_contract_features (
    symbol TEXT NOT NULL,
    date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    fine_gold_price_per_10g NUMERIC NOT NULL,
    fine_gold_price_per_gram NUMERIC NOT NULL,
    days_to_expiry INT NOT NULL,
    zero_volume_flag BOOLEAN NOT NULL DEFAULT FALSE,
    missing_ohlc_flag BOOLEAN NOT NULL DEFAULT FALSE,
    settlement_only_flag BOOLEAN NOT NULL DEFAULT FALSE,
    spread_guinea_petal NUMERIC,
    spread_pct_guinea_petal NUMERIC,
    spread_mean20_guinea_petal NUMERIC,
    spread_std20_guinea_petal NUMERIC,
    spread_zscore_guinea_petal NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT pk_mcx_contract_features PRIMARY KEY (symbol, date, expiry_date)
);

CREATE INDEX IF NOT EXISTS idx_mcx_feat_date ON public.mcx_contract_features(date);
CREATE INDEX IF NOT EXISTS idx_mcx_feat_zscore ON public.mcx_contract_features(spread_zscore_guinea_petal);

-- 3. Historical Backtest Runs & Attribution Metadata Table
CREATE TABLE IF NOT EXISTS public.swarnanet_backtest_runs (
    run_id TEXT NOT NULL PRIMARY KEY,
    strategy_name TEXT NOT NULL,
    target_pair TEXT NOT NULL,
    in_sample_cutoff DATE NOT NULL,
    total_trades INT NOT NULL,
    gross_pnl NUMERIC NOT NULL,
    gross_win_rate_pct NUMERIC NOT NULL,
    net_pnl_low NUMERIC NOT NULL,
    net_pnl_baseline NUMERIC NOT NULL,
    net_pnl_conservative NUMERIC NOT NULL,
    net_win_rate_pct_baseline NUMERIC NOT NULL,
    profit_factor_gross NUMERIC NOT NULL,
    profit_factor_net_baseline NUMERIC NOT NULL,
    max_drawdown_baseline NUMERIC NOT NULL,
    sharpe_ratio_annualized NUMERIC NOT NULL,
    falsification_verdict TEXT NOT NULL,
    metrics_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Historical Backtest Individual Trade Log Table
CREATE TABLE IF NOT EXISTS public.swarnanet_backtest_trades (
    trade_id INT NOT NULL,
    run_id TEXT NOT NULL REFERENCES public.swarnanet_backtest_runs(run_id) ON DELETE CASCADE,
    direction TEXT NOT NULL,
    position_sign INT NOT NULL,
    entry_date DATE NOT NULL,
    exit_date DATE NOT NULL,
    holding_days INT NOT NULL,
    exit_reason TEXT NOT NULL,
    entry_price_a NUMERIC NOT NULL,
    exit_price_a NUMERIC NOT NULL,
    entry_price_b NUMERIC NOT NULL,
    exit_price_b NUMERIC NOT NULL,
    gross_pnl NUMERIC NOT NULL,
    turnover NUMERIC NOT NULL,
    cost_baseline NUMERIC NOT NULL,
    net_pnl_baseline NUMERIC NOT NULL,
    is_in_sample BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT pk_swarnanet_backtest_trades PRIMARY KEY (run_id, trade_id)
);

CREATE INDEX IF NOT EXISTS idx_swarnanet_trades_dates ON public.swarnanet_backtest_trades(entry_date, exit_date);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.mcx_normalized_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcx_contract_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarnanet_backtest_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swarnanet_backtest_trades ENABLE ROW LEVEL SECURITY;

-- Read policies: Permitted for both authenticated users and public research clients
CREATE POLICY "Allow public read access to normalized observations"
    ON public.mcx_normalized_observations FOR SELECT USING (true);

CREATE POLICY "Allow public read access to contract features"
    ON public.mcx_contract_features FOR SELECT USING (true);

CREATE POLICY "Allow public read access to backtest runs"
    ON public.swarnanet_backtest_runs FOR SELECT USING (true);

CREATE POLICY "Allow public read access to backtest trades"
    ON public.swarnanet_backtest_trades FOR SELECT USING (true);

-- Write policies: Restricted strictly to service_role (pipeline ingestion)
CREATE POLICY "Allow service role full access to normalized observations"
    ON public.mcx_normalized_observations FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role full access to contract features"
    ON public.mcx_contract_features FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role full access to backtest runs"
    ON public.swarnanet_backtest_runs FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service role full access to backtest trades"
    ON public.swarnanet_backtest_trades FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
