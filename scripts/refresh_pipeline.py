"""
SWARNANET: Automated MCX Data Refresh CLI & Scheduler
Phase 6: Automated Data Refresh

Usage:
    python scripts/refresh_pipeline.py --run-once
    python scripts/refresh_pipeline.py --status
    python scripts/refresh_pipeline.py --dry-run
    python scripts/refresh_pipeline.py --incremental data/incoming/sample_eod.csv
    python scripts/refresh_pipeline.py --schedule 24
    python scripts/refresh_pipeline.py --install-task
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.pipeline.refresh import RefreshConfig, execute_refresh


def print_banner():
    print("=" * 72)
    print(" SWARNANET // Automated MCX EOD Data Refresh & Intelligence Gateway")
    print("=" * 72)


def get_default_config(args) -> RefreshConfig:
    data_dir = PROJECT_ROOT / "data" / "processed"
    return RefreshConfig(
        project_dir=PROJECT_ROOT,
        normalized_csv_path=data_dir / "mcx_gold_normalized.csv",
        features_csv_path=data_dir / "mcx_gold_features.csv",
        quarantine_csv_path=data_dir / "quarantine.csv",
        status_json_path=data_dir / "refresh_status.json",
        incoming_dir=PROJECT_ROOT / "data" / "incoming",
        dry_run=args.dry_run,
        force_resync=args.force,
        source_file=Path(args.incremental) if args.incremental else None,
    )


def show_status(status_file: Path):
    if not status_file.exists():
        print(f"[STATUS] No prior refresh audit ledger found at: {status_file}")
        return
    with open(status_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"[STATUS] Last Execution:         {data.get('timestamp_iso')}")
    print(f"[STATUS] Execution State:        {data.get('status')}")
    print(f"[STATUS] Latest EOD Date:        {data.get('latest_eod_date')}")
    print(f"[STATUS] Canonical Records:      {data.get('total_canonical_records'):,}")
    print(f"[STATUS] New Records Ingested:   {data.get('new_records_added')}")
    print(f"[STATUS] Duplicates Reconciled:  {data.get('duplicates_reconciled'):,}")
    print(f"[STATUS] Quarantined Records:    {data.get('quarantined_count')}")
    print(f"[STATUS] Features Computed:      {data.get('features_computed_count'):,}")
    print(f"[STATUS] Opportunities Evaluated:{data.get('opportunities_evaluated_count')}")
    print(f"[STATUS] Actionable Arbitrage:   {data.get('actionable_candidates_count')}")
    print(f"[STATUS] Friction Constrained:   {data.get('friction_constrained_count')}")
    print(f"[STATUS] Supabase Synced:        {data.get('supabase_synced')} ({data.get('supabase_records_upserted'):,} records)")
    print(f"[STATUS] Source Mode:            {data.get('data_source_description')}")


def generate_task_command():
    print("\n--- Practical Scheduling Configurations ---")
    print("1. Windows Task Scheduler (Recommended for Windows OS):")
    py_exec = sys.executable
    script_path = PROJECT_ROOT / "scripts" / "refresh_pipeline.py"
    task_cmd = (
        f'schtasks /Create /SC DAILY /TN "SwarnaNet_EOD_Refresh" '
        f'/TR "\\"{py_exec}\\" \\"{script_path}\\" --run-once" /ST 20:30 /F'
    )
    print(f"   Command:\n   {task_cmd}\n")
    print("   Explanation: Schedules daily execution at 20:30 IST (after MCX EOD physical settlement polled rates close).")
    print("\n2. Unix/Linux Cron (for headless server / container deployments):")
    print("   30 15 * * 1-5 cd /path/to/SWARNANET && python scripts/refresh_pipeline.py --run-once >> /var/log/swarnanet_refresh.log 2>&1")
    print("   (15:30 UTC = 21:00 IST Monday through Friday)\n")


def run_daemon_scheduler(cfg: RefreshConfig, interval_hours: float):
    print(f"[DAEMON] Starting SwarnaNet refresh scheduler (Interval: {interval_hours} hours)...")
    print("[DAEMON] Press Ctrl+C to stop.")
    while True:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[DAEMON - {now_str}] Triggering scheduled MCX EOD refresh cycle...")
        try:
            res = execute_refresh(cfg)
            print(f"[DAEMON] Completed with status: {res.status}. Latest Date: {res.latest_eod_date}. Total: {res.total_canonical_records:,}")
        except Exception as e:
            print(f"[DAEMON - ERROR] Refresh cycle failed: {e}")
        time.sleep(interval_hours * 3600)


def main():
    parser = argparse.ArgumentParser(description="SwarnaNet Automated MCX Data Refresh & Verification Pipeline")
    parser.add_argument("--run-once", action="store_true", help="Execute 7-stage refresh immediately")
    parser.add_argument("--status", action="store_true", help="Print latest refresh audit status ledger")
    parser.add_argument("--dry-run", action="store_true", help="Validate pipeline without mutating files or database")
    parser.add_argument("--force", action="store_true", help="Force complete re-sync and feature recomputation")
    parser.add_argument("--incremental", type=str, help="Path to incremental CSV file to ingest and reconcile")
    parser.add_argument("--schedule", type=float, help="Run as periodic background daemon with specified interval in hours")
    parser.add_argument("--install-task", action="store_true", help="Display OS task scheduler configuration commands")

    args = parser.parse_args()
    print_banner()

    cfg = get_default_config(args)

    if args.install_task:
        generate_task_command()
        return

    if args.status:
        show_status(cfg.status_json_path)
        return

    if args.schedule:
        run_daemon_scheduler(cfg, args.schedule)
        return

    # Default to run-once
    print(f"[EXEC] Mode: {'DRY RUN' if cfg.dry_run else 'LIVE REFRESH'}")
    print(f"[EXEC] Target Directory: {cfg.project_dir}")
    print(f"[EXEC] Normalized Store: {cfg.normalized_csv_path}")

    res = execute_refresh(cfg)

    print("\n" + "-" * 72)
    print(" REFRESH EXECUTION COMPLETED")
    print("-" * 72)
    print(f"  Execution Status:             {res.status}")
    print(f"  Latest EOD Settlement Date:   {res.latest_eod_date}")
    print(f"  Total Canonical Records:      {res.total_canonical_records:,}")
    print(f"  New Records Appended:         {res.new_records_added}")
    print(f"  Duplicates Reconciled:        {res.duplicates_reconciled:,}")
    print(f"  Quarantined Records:          {res.quarantined_count}")
    print(f"  Features Computed:            {res.features_computed_count:,}")
    print(f"  Opportunities Evaluated:      {res.opportunities_evaluated_count}")
    print(f"  Actionable Candidates:        {res.actionable_candidates_count}")
    print(f"  Friction Constrained:         {res.friction_constrained_count}")
    print(f"  Supabase Synced:              {res.supabase_synced} ({res.supabase_records_upserted:,} records)")
    print(f"  Data Source:                  {res.data_source_description}")
    print("-" * 72)
    print("Audit Notes:")
    for note in res.audit_notes:
        print(f"  • {note}")
    print("=" * 72)


if __name__ == "__main__":
    main()
