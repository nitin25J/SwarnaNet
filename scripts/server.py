"""
SwarnaNet: Institutional MCX Quantitative Backend Server
Standard-library HTTP server designed for zero-downtime deployment on Render.
Listens on 0.0.0.0:$PORT and provides health checks, refresh hooks, and metrics APIs.
"""

import os
import sys
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

# Set up project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SwarnaNetServer")


class SwarnanetApiHandler(BaseHTTPRequestHandler):
    def send_json(self, status_code: int, data: dict):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")

        if path in ("", "/health"):
            self.send_json(200, {
                "status": "HEALTHY",
                "service": "SwarnaNet MCX Quantitative Engine",
                "version": "1.0.0",
                "port": int(os.environ.get("PORT", 10000)),
                "endpoints": [
                    "/health",
                    "/api/status",
                    "/api/backtest-metrics",
                    "/api/refresh"
                ]
            })
            return

        if path == "/api/status":
            status_file = PROJECT_ROOT / "data" / "processed" / "refresh_status.json"
            if status_file.exists():
                try:
                    with open(status_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self.send_json(200, {"status": "SUCCESS", "audit": data})
                    return
                except Exception as e:
                    self.send_json(500, {"error": "Failed to read status file", "details": str(e)})
                    return
            self.send_json(404, {"error": "Status ledger not found"})
            return

        if path == "/api/backtest-metrics":
            metrics_file = PROJECT_ROOT / "data" / "processed" / "backtest_metrics.json"
            if metrics_file.exists():
                try:
                    with open(metrics_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self.send_json(200, {"status": "SUCCESS", "metrics": data})
                    return
                except Exception as e:
                    self.send_json(500, {"error": "Failed to read backtest metrics", "details": str(e)})
                    return
            self.send_json(404, {"error": "Backtest metrics file not found"})
            return

        self.send_json(404, {"error": f"Endpoint '{self.path}' not found"})

    def do_POST(self):
        path = self.path.split("?")[0].rstrip("/")

        if path == "/api/refresh":
            try:
                from src.pipeline.refresh import RefreshConfig, execute_refresh

                data_dir = PROJECT_ROOT / "data" / "processed"
                cfg = RefreshConfig(
                    project_dir=PROJECT_ROOT,
                    normalized_csv_path=data_dir / "mcx_gold_normalized.csv",
                    features_csv_path=data_dir / "mcx_gold_features.csv",
                    quarantine_csv_path=data_dir / "quarantine.csv",
                    status_json_path=data_dir / "refresh_status.json",
                    incoming_dir=PROJECT_ROOT / "data" / "incoming",
                    dry_run=False,
                    force_resync=False,
                )
                res = execute_refresh(cfg)
                self.send_json(200, {
                    "status": "SUCCESS",
                    "execution_status": res.status,
                    "latest_eod_date": res.latest_eod_date,
                    "new_records": res.new_records_added,
                    "total_canonical": res.total_canonical_records
                })
            except Exception as e:
                logger.error(f"Refresh failed: {e}", exc_info=True)
                self.send_json(500, {"error": "Refresh execution failed", "details": str(e)})
            return

        self.send_json(404, {"error": f"Endpoint '{self.path}' not found for POST"})


def run():
    port = int(os.environ.get("PORT", 10000))
    host = "0.0.0.0"
    server_address = (host, port)
    httpd = HTTPServer(server_address, SwarnanetApiHandler)
    logger.info(f"SwarnaNet Quantitative Backend listening on http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server interrupted by user. Shutting down...")
    finally:
        httpd.server_close()
        logger.info("Server closed.")


if __name__ == "__main__":
    run()
