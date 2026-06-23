#!/usr/bin/env bash
# Smoke test rapide — API Homify (après déploiement ou make dev-local)
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8000/api}"

echo "→ Health check: ${API_BASE}/health/"
health=$(curl -sf "${API_BASE}/health/")
echo "$health" | grep -q '"status":"ok"' || { echo "❌ Health check failed"; exit 1; }
echo "✓ Health OK"

echo "→ Properties list: ${API_BASE}/properties/"
curl -sf "${API_BASE}/properties/" > /dev/null
echo "✓ Properties list OK"

echo "✅ Smoke test passed"
