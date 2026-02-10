#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-4173}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is not installed or not in PATH."
  echo "Try: python -m http.server ${PORT}"
  exit 1
fi

if [ ! -d "$ROOT_DIR/prototype" ]; then
  echo "Error: prototype folder not found at $ROOT_DIR/prototype"
  echo "Run this script from inside the Telecomm-CRM repo."
  exit 1
fi

cd "$ROOT_DIR/prototype"

echo "Serving prototype from: $(pwd)"
echo "Starting Tele-CRM prototype at http://localhost:${PORT}"
python3 -m http.server "$PORT"
