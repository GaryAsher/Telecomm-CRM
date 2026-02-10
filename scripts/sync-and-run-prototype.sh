#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-4173}"

cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required but not installed."
  exit 1
fi

if [ ! -d .git ]; then
  echo "Error: this script must be run from inside the Tele-CRM git repo."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [ -z "$CURRENT_BRANCH" ]; then
  echo "Error: unable to detect current branch."
  exit 1
fi


if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No git remote named 'origin' is configured."
  echo "Set it with: git remote add origin <your-repo-url>"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Local changes detected."
  echo "Please commit or stash first, then run again."
  echo "Tip: bash scripts/push-changes.sh \"chore: save local work\""
  exit 1
fi

echo "Fetching latest changes from origin..."
git fetch origin

echo "Pulling latest changes for branch: $CURRENT_BRANCH"
git pull --ff-only origin "$CURRENT_BRANCH"

echo "Starting Tele-CRM prototype on http://localhost:${PORT}"
exec bash scripts/run-prototype.sh "$PORT"
