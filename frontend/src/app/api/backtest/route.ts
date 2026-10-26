import { NextResponse } from "next/server";
import { runWalkForwardBacktest, getBacktestTrades } from "@/lib/swarnanetEngine";
import { createServerClient } from "@/lib/supabase/server";
import swarnanetData from "@/data/swarnanet_data.json";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slippageBps = Number(searchParams.get("slippage") || "5");
    const frictionBps = Number(searchParams.get("friction") || "14");
    const entryZScore = Number(searchParams.get("entryZ") || "2.0");
    const exitZScore = Number(searchParams.get("exitZ") || "0.5");

    const backtestResult = runWalkForwardBacktest({
      slippageDepthBps: slippageBps,
      roundTripFrictionBps: frictionBps,
      entryZScore,
      exitZScore,
      capitalAllocatedLakhs: 50,
    });

    const supabase = createServerClient();
    let dbTradesCount = 0;

    if (supabase) {
      const { data: dbTrades, error: tradesErr } = await supabase
        .from("swarnanet_backtest_trades")
        .select("*")
        .order("trade_id", { ascending: true });

      const { data: dbRun } = await supabase
        .from("swarnanet_backtest_runs")
        .select("*")
        .eq("run_id", "run_goldguinea_goldpetal_baseline")
        .single();

      if (!tradesErr && dbTrades && dbTrades.length > 0) {
        dbTradesCount = dbTrades.length;
        const runData = dbRun as { metrics_payload?: unknown; falsification_verdict?: string } | null;
        const rawMetrics = runData?.metrics_payload || swarnanetData.backtestMetrics;

        return NextResponse.json({
          source: "SUPABASE_POSTGRES",
          params: { slippageBps, frictionBps, entryZScore, exitZScore },
          attribution: backtestResult.attribution,
          equityCurve: backtestResult.equityCurve,
          trades: dbTrades,
          dbCount: dbTradesCount,
          rawMetrics,
          falsificationNotice: {
            verdict: runData?.falsification_verdict || "EMPIRICALLY FALSIFIED: Gross statistical edge is eliminated after baseline transaction friction.",
            reason: "While statistical mean reversion is present in gross settlement prices (61.9% win rate), retail net PnL is negative across realistic baseline and conservative cost tiers (-Rs 10,380 baseline net).",
          },
        });
      }
    }

    const trades = getBacktestTrades();
    const rawMetrics = swarnanetData.backtestMetrics;

    return NextResponse.json({
      source: "VERIFIED_BACKTEST_SIMULATION",
      params: { slippageBps, frictionBps, entryZScore, exitZScore },
      attribution: backtestResult.attribution,
      equityCurve: backtestResult.equityCurve,
      trades,
      rawMetrics,
      falsificationNotice: {
        verdict: "HYPOTHESIS_FALSIFIED",
        reason: "While statistical mean reversion is present in gross settlement prices (61.9% win rate), retail net PnL is negative across realistic baseline and conservative cost tiers (-Rs 10,380 baseline net).",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate backtest attribution", details: message },
      { status: 500 }
    );
  }
}
