#!/bin/bash
set -euo pipefail

# Script to test Nola Analytics Backend
# Runs unit tests and exercises all API endpoints with realistic params

echo "🧪 Testing Nola Analytics Backend..."

BASE_URL="${BASE_URL:-http://localhost:8000}"
STORE_ID="${STORE_ID:-1}"
START_DATE="${START_DATE:-2024-01-01}"
END_DATE="${END_DATE:-2024-01-31}"
LIMIT="${LIMIT:-10}"
GRANULARITY="${GRANULARITY:-day}"   # hour|day|week|month

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Run ./run.sh first"
    exit 1
fi

# Install test dependencies
pip install -q pytest pytest-asyncio httpx >/dev/null || true

echo ""
echo "=================================="
echo "📊 Running Unit Tests..."
echo "=================================="

if [ -f "test_api.py" ]; then
  pytest test_api.py -v || true
else
  echo "ℹ️  No test_api.py found, skipping pytest."
fi

echo ""
echo "=================================="
echo "🔍 Testing API Endpoints Manually..."
echo "=================================="

# Test if server is running
if ! curl -fsS "$BASE_URL" > /dev/null; then
    echo "❌ Server not running at $BASE_URL. Start it with: ./run.sh"
    exit 1
fi

echo "✅ Server is running at $BASE_URL"
echo ""

pretty_json() {
  python - <<'PY'
import sys, json
try:
    print(json.dumps(json.load(sys.stdin), indent=2, ensure_ascii=False))
except Exception:
    print(sys.stdin.read())
PY
}

status_line() {
  code="$1"
  if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    echo "✅ $code"
  else
    echo "❌ $code"
  fi
}

# 1) Overview Metrics (no filters)
echo "📈 Testing GET /api/v1/analytics/overview (no filters)..."
code=$(curl -o /tmp/overview.json -s -w "%{http_code}" "$BASE_URL/api/v1/analytics/overview")
status_line "$code"
cat /tmp/overview.json | python -m json.tool | head -20
echo ""

# 1b) Overview with filters
echo "📈 Testing GET /api/v1/analytics/overview with filters..."
OV_URL="$BASE_URL/api/v1/analytics/overview?start_date=$START_DATE&end_date=$END_DATE&store_id=$STORE_ID"
code=$(curl -o /tmp/overview_filtered.json -s -w "%{http_code}" "$OV_URL")
status_line "$code"
cat /tmp/overview_filtered.json | python -m json.tool | head -50
echo ""

# 2) Timeline Data (granularity=day by default)
echo "📊 Testing GET /api/v1/analytics/timeline?granularity=$GRANULARITY..."
TL_URL="$BASE_URL/api/v1/analytics/timeline?start_date=$START_DATE&end_date=$END_DATE&store_id=$STORE_ID&granularity=$GRANULARITY"
code=$(curl -o /tmp/timeline.json -s -w "%{http_code}" "$TL_URL")
status_line "$code"
cat /tmp/timeline.json | python -m json.tool | head -40
echo ""

# 3) Top Products (with limit)
echo "🏆 Testing GET /api/v1/analytics/top-products?limit=$LIMIT..."
TP_URL="$BASE_URL/api/v1/analytics/top-products?start_date=$START_DATE&end_date=$END_DATE&store_id=$STORE_ID&limit=$LIMIT"
code=$(curl -o /tmp/top_products.json -s -w "%{http_code}" "$TP_URL")
status_line "$code"
cat /tmp/top_products.json | python -m json.tool | head -60
echo ""

# 4) Business Insights
echo "💡 Testing GET /api/v1/analytics/insights..."
IN_URL="$BASE_URL/api/v1/analytics/insights?start_date=$START_DATE&end_date=$END_DATE&store_id=$STORE_ID"
code=$(curl -o /tmp/insights.json -s -w "%{http_code}" "$IN_URL")
status_line "$code"
cat /tmp/insights.json | python -m json.tool | head -60
echo ""

# 5) Channel Performance
echo "📡 Testing GET /api/v1/analytics/channels..."
CH_URL="$BASE_URL/api/v1/analytics/channels?start_date=$START_DATE&end_date=$END_DATE&store_id=$STORE_ID"
code=$(curl -o /tmp/channels.json -s -w "%{http_code}" "$CH_URL")
status_line "$code"
cat /tmp/channels.json | python -m json.tool | head -40
echo ""

# 6) Natural Language Query
echo "🧠 Testing POST /api/v1/analytics/natural-query..."
NQ_URL="$BASE_URL/api/v1/analytics/natural-query"
NQ_BODY=$(cat <<JSON
{
  "query": "Quanto vendi ontem?",
  "context": {
    "store_id": $STORE_ID,
    "start_date": "$START_DATE",
    "end_date": "$END_DATE"
  }
}
JSON
)
code=$(curl -o /tmp/nq.json -s -w "%{http_code}" -H "Content-Type: application/json" -X POST \
  -d "$NQ_BODY" "$NQ_URL")
status_line "$code"
cat /tmp/nq.json | python -m json.tool | head -40
echo ""

echo "=================================="
echo "⚡ Performance Test (target < 500ms)"
echo "=================================="

measure() {
  local label="$1"
  local url="$2"
  total=$(curl -o /dev/null -s -w "%{time_total}" "$url")
  ms=$(python - <<PY
t = "$total"
print(int(float(t)*1000))
PY
)
  if [ "$ms" -lt 500 ]; then
    echo "  ✅ $label — ${ms}ms"
  else
    echo "  ❌ $label — ${ms}ms (SLOW)"
  fi
}

measure "/overview (no filters)" "$BASE_URL/api/v1/analytics/overview"
measure "/overview (filtered)" "$OV_URL"
measure "/timeline ($GRANULARITY)" "$TL_URL"
measure "/top-products (limit=$LIMIT)" "$TP_URL"
measure "/insights" "$IN_URL"
measure "/channels" "$CH_URL"

echo ""
echo "=================================="
echo "✅ Testing Complete!"
echo "=================================="