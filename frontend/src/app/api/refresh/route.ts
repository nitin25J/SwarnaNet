import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Security: Concurrency lock and rate-limiting guard to prevent DoS abuse
let isRefreshing = false;
let lastRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 15000; // 15 seconds cooldown between manual trigger requests

export async function GET() {
  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const statusJsonPath = path.join(
      projectRoot,
      "data",
      "processed",
      "refresh_status.json"
    );

    if (!fs.existsSync(statusJsonPath)) {
      return NextResponse.json({
        status: "INITIALIZING",
        message: "No prior refresh execution ledger found.",
        latestEodDate: "2026-10-23",
        sourceType: "HISTORICAL_EOD_SETTLEMENT",
      });
    }

    const raw = fs.readFileSync(statusJsonPath, "utf-8");
    const statusData = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      data: statusData,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to read refresh status ledger", details: msg },
      { status: 500 }
    );
  }
}

export async function POST() {
  const now = Date.now();

  // Concurrency guard
  if (isRefreshing) {
    return NextResponse.json(
      {
        error: "Concurrency Lock Active",
        message: "A data refresh execution is currently in progress. Please wait for completion.",
      },
      { status: 409 }
    );
  }

  // Rate limiting cooldown guard
  if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((REFRESH_COOLDOWN_MS - (now - lastRefreshTime)) / 1000);
    return NextResponse.json(
      {
        error: "Rate Limit Cooldown Active",
        message: `Please wait ${waitSeconds} second(s) before triggering another refresh cycle.`,
      },
      { status: 429 }
    );
  }

  isRefreshing = true;

  try {
    const projectRoot = path.resolve(process.cwd(), "..");
    const scriptPath = path.join(projectRoot, "scripts", "refresh_pipeline.py");

    // Execute refresh pipeline run-once safely
    const { stdout } = await execAsync(
      `python "${scriptPath}" --run-once`,
      { cwd: projectRoot, timeout: 60000 }
    );

    lastRefreshTime = Date.now();

    const statusJsonPath = path.join(
      projectRoot,
      "data",
      "processed",
      "refresh_status.json"
    );

    let statusData = null;
    if (fs.existsSync(statusJsonPath)) {
      statusData = JSON.parse(fs.readFileSync(statusJsonPath, "utf-8"));
    }

    return NextResponse.json({
      success: true,
      message: "Automated MCX EOD Refresh executed successfully.",
      statusData,
      stdout: stdout.slice(-500),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to execute automated data refresh", details: msg },
      { status: 500 }
    );
  } finally {
    isRefreshing = false;
  }
}
