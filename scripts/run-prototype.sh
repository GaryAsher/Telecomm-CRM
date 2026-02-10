#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/prototype"

echo "Starting Telecomm CRM prototype at http://localhost:4173"
python3 -m http.server 4173
