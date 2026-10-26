import { NextResponse } from "next/server";
import { getTraderAlertMatrix } from "@/lib/swarnanetEngine";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    if (supabase) {
      const { data: latestFeatures, error } = await supabase
        .from("mcx_contract_features")
        .select("*")
        .order("date", { ascending: false })
        .limit(10);

      if (!error && latestFeatures && latestFeatures.length > 0) {
        const alerts = getTraderAlertMatrix();
        const firstRow = latestFeatures[0] as { date?: string } | undefined;
        return NextResponse.json({
          source: "SUPABASE_POSTGRES",
          alerts,
          dbSampleCount: latestFeatures.length,
          latestEodDate: firstRow?.date,
        });
      }
    }

    const alerts = getTraderAlertMatrix();
    return NextResponse.json({
      source: "STATISTICAL_SPREAD_ZSCORE_ENGINE",
      alerts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate alerts", details: message },
      { status: 500 }
    );
  }
}
