#!/bin/bash
# Test script for Energy Ingestion Engine

echo "🧪 Testing Energy Ingestion Engine"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Ingest Meter Data
echo "📊 Test 1: Ingesting Meter Telemetry..."
curl -X POST $BASE_URL/v1/ingest/meter \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "M001",
    "kwhConsumedAc": 150.5,
    "voltage": 230,
    "timestamp": "2026-02-08T18:00:00Z"
  }'
echo -e "\n"

# Test 2: Ingest Vehicle Data
echo "🚗 Test 2: Ingesting Vehicle Telemetry..."
curl -X POST $BASE_URL/v1/ingest/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "V001",
    "soc": 75,
    "kwhDeliveredDc": 128.4,
    "batteryTemp": 32,
    "timestamp": "2026-02-08T18:00:00Z"
  }'
echo -e "\n"

# Test 3: Add more data for analytics
echo "📈 Test 3: Adding multiple readings for 24-hour analytics..."
curl -X POST $BASE_URL/v1/ingest/meter \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "V001",
    "kwhConsumedAc": 85.0,
    "voltage": 230,
    "timestamp": "2026-02-08T19:00:00Z"
  }'

curl -X POST $BASE_URL/v1/ingest/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "V001",
    "soc": 85,
    "kwhDeliveredDc": 72.25,
    "batteryTemp": 33,
    "timestamp": "2026-02-08T19:00:00Z"
  }'
echo -e "\n"

# Test 4: Get Analytics
echo "📊 Test 4: Getting 24-hour Performance Metrics..."
curl $BASE_URL/v1/analytics/performance/V001
echo -e "\n\n"

echo "✅ Tests completed!"
