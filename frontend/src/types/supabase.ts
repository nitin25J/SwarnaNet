export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      mcx_normalized_observations: {
        Row: {
          symbol: string;
          date: string;
          expiry_date: string;
          open: number | null;
          high: number | null;
          low: number | null;
          close: number;
          volume: number;
          open_interest: number;
          created_at: string;
        };
        Insert: {
          symbol: string;
          date: string;
          expiry_date: string;
          open?: number | null;
          high?: number | null;
          low?: number | null;
          close: number;
          volume?: number;
          open_interest?: number;
          created_at?: string;
        };
        Update: {
          symbol?: string;
          date?: string;
          expiry_date?: string;
          open?: number | null;
          high?: number | null;
          low?: number | null;
          close?: number;
          volume?: number;
          open_interest?: number;
          created_at?: string;
        };
      };
      mcx_contract_features: {
        Row: {
          symbol: string;
          date: string;
          expiry_date: string;
          fine_gold_price_per_10g: number;
          fine_gold_price_per_gram: number;
          days_to_expiry: number;
          zero_volume_flag: boolean;
          missing_ohlc_flag: boolean;
          settlement_only_flag: boolean;
          spread_guinea_petal: number | null;
          spread_pct_guinea_petal: number | null;
          spread_mean20_guinea_petal: number | null;
          spread_std20_guinea_petal: number | null;
          spread_zscore_guinea_petal: number | null;
          created_at: string;
        };
        Insert: {
          symbol: string;
          date: string;
          expiry_date: string;
          fine_gold_price_per_10g: number;
          fine_gold_price_per_gram: number;
          days_to_expiry: number;
          zero_volume_flag?: boolean;
          missing_ohlc_flag?: boolean;
          settlement_only_flag?: boolean;
          spread_guinea_petal?: number | null;
          spread_pct_guinea_petal?: number | null;
          spread_mean20_guinea_petal?: number | null;
          spread_std20_guinea_petal?: number | null;
          spread_zscore_guinea_petal?: number | null;
          created_at?: string;
        };
        Update: {
          symbol?: string;
          date?: string;
          expiry_date?: string;
          fine_gold_price_per_10g?: number;
          fine_gold_price_per_gram?: number;
          days_to_expiry?: number;
          zero_volume_flag?: boolean;
          missing_ohlc_flag?: boolean;
          settlement_only_flag?: boolean;
          spread_guinea_petal?: number | null;
          spread_pct_guinea_petal?: number | null;
          spread_mean20_guinea_petal?: number | null;
          spread_std20_guinea_petal?: number | null;
          spread_zscore_guinea_petal?: number | null;
          created_at?: string;
        };
      };
      swarnanet_backtest_runs: {
        Row: {
          run_id: string;
          strategy_name: string;
          target_pair: string;
          in_sample_cutoff: string;
          total_trades: number;
          gross_pnl: number;
          gross_win_rate_pct: number;
          net_pnl_low: number;
          net_pnl_baseline: number;
          net_pnl_conservative: number;
          net_win_rate_pct_baseline: number;
          profit_factor_gross: number;
          profit_factor_net_baseline: number;
          max_drawdown_baseline: number;
          sharpe_ratio_annualized: number;
          falsification_verdict: string;
          metrics_payload: Json;
          created_at: string;
        };
        Insert: {
          run_id: string;
          strategy_name: string;
          target_pair: string;
          in_sample_cutoff: string;
          total_trades: number;
          gross_pnl: number;
          gross_win_rate_pct: number;
          net_pnl_low: number;
          net_pnl_baseline: number;
          net_pnl_conservative: number;
          net_win_rate_pct_baseline: number;
          profit_factor_gross: number;
          profit_factor_net_baseline: number;
          max_drawdown_baseline: number;
          sharpe_ratio_annualized: number;
          falsification_verdict: string;
          metrics_payload: Json;
          created_at?: string;
        };
        Update: {
          run_id?: string;
          strategy_name?: string;
          target_pair?: string;
          in_sample_cutoff?: string;
          total_trades?: number;
          gross_pnl?: number;
          gross_win_rate_pct?: number;
          net_pnl_low?: number;
          net_pnl_baseline?: number;
          net_pnl_conservative?: number;
          net_win_rate_pct_baseline?: number;
          profit_factor_gross?: number;
          profit_factor_net_baseline?: number;
          max_drawdown_baseline?: number;
          sharpe_ratio_annualized?: number;
          falsification_verdict?: string;
          metrics_payload?: Json;
          created_at?: string;
        };
      };
      swarnanet_backtest_trades: {
        Row: {
          trade_id: number;
          run_id: string;
          direction: string;
          position_sign: number;
          entry_date: string;
          exit_date: string;
          holding_days: number;
          exit_reason: string;
          entry_price_a: number;
          exit_price_a: number;
          entry_price_b: number;
          exit_price_b: number;
          gross_pnl: number;
          turnover: number;
          cost_baseline: number;
          net_pnl_baseline: number;
          is_in_sample: boolean;
          created_at: string;
        };
        Insert: {
          trade_id: number;
          run_id: string;
          direction: string;
          position_sign: number;
          entry_date: string;
          exit_date: string;
          holding_days: number;
          exit_reason: string;
          entry_price_a: number;
          exit_price_a: number;
          entry_price_b: number;
          exit_price_b: number;
          gross_pnl: number;
          turnover: number;
          cost_baseline: number;
          net_pnl_baseline: number;
          is_in_sample: boolean;
          created_at?: string;
        };
        Update: {
          trade_id?: number;
          run_id?: string;
          direction?: string;
          position_sign?: number;
          entry_date?: string;
          exit_date?: string;
          holding_days?: number;
          exit_reason?: string;
          entry_price_a?: number;
          exit_price_a?: number;
          entry_price_b?: number;
          exit_price_b?: number;
          gross_pnl?: number;
          turnover?: number;
          cost_baseline?: number;
          net_pnl_baseline?: number;
          is_in_sample?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
