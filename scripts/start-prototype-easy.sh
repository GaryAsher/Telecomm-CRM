#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-4173}"

cd "$ROOT_DIR"

if [ -f "prototype/index.html" ]; then
  echo "Tele-CRM prototype file found: $ROOT_DIR/prototype/index.html"
else
  echo "Error: prototype/index.html not found."
  exit 1
fi

echo
echo "Fastest options for casual users:"
echo "1) Browser-only (no server): open prototype/index.html directly"
echo "2) Local server (recommended): http://localhost:${PORT}"
echo

if command -v python3 >/dev/null 2>&1; then
  echo "Starting local server on http://localhost:${PORT}"
  cd "$ROOT_DIR/prototype"
  python3 -m http.server "$PORT"
else
  echo "python3 not found."
  echo "Open this file directly in your browser instead:"
  echo "$ROOT_DIR/prototype/index.html"
fi
