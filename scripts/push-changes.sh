#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required but not installed."
  exit 1
fi

if [ ! -d .git ]; then
  echo "Error: this script must be run from inside a git repository."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [ -z "$CURRENT_BRANCH" ]; then
  echo "Error: unable to detect current branch."
  exit 1
fi

if [ -z "$(git status --porcelain)" ]; then
  echo "No local changes detected. Nothing to commit or push."
  exit 0
fi

COMMIT_MESSAGE="${1:-chore: update Tele-CRM changes}"

echo "Staging all tracked and untracked changes..."
git add -A

echo "Committing with message: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

echo "Pushing to origin/$CURRENT_BRANCH ..."
git push origin "$CURRENT_BRANCH"

echo "Done. Changes pushed to origin/$CURRENT_BRANCH"
