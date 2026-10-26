import { NextResponse } from "next/server";
import { getBhavcopyAuditReport } from "@/lib/swarnanetEngine";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    let supabaseRecordCount: number | null = null;

    if (supabase) {
      const { count } = await supabase
        .from("mcx_normalized_observations")
        .select("*", { count: "exact", head: true });

      if (typeof count === "number") {
        supabaseRecordCount = count;
      }
    }

    const auditReport = getBhavcopyAuditReport();
    return NextResponse.json({
      source: supabaseRecordCount !== null ? "SUPABASE_POSTGRES" : "DATASET_INGESTION_AUDIT",
      supabaseRecordCount,
      auditReport,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate bhavcopy audit report", details: message },
      { status: 500 }
    );
  }
}
