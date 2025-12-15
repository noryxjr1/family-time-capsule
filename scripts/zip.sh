#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
OUTPUT="family-memory-capsule.zip"

rm -f "$OUTPUT"
zip -r "$OUTPUT" . \
  -x "*/node_modules/*" "*/.next/*" "*/out/*" "*.zip" ".git/*" \
  -x "*.DS_Store" \
  -x "*/coverage/*"

echo "Created $OUTPUT"
