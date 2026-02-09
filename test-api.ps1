# Test script for Energy Ingestion API

Write-Host "🧪 Testing Energy Ingestion API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Meter Telemetry Ingestion
Write-Host "1️⃣  Testing Meter Telemetry Ingestion..." -ForegroundColor Yellow
$meterData = @{
    meterId = "METER_001"
    timestamp = "2026-02-09T22:29:00Z"
    kwhConsumedAc = 125.5
    voltage = 230.2
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri http://localhost:3000/v1/ingest/meter -Method POST -Body $meterData -ContentType 'application/json'
    Write-Host "✅ Meter ingestion successful!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Meter ingestion failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Vehicle Telemetry Ingestion
Write-Host "2️⃣  Testing Vehicle Telemetry Ingestion..." -ForegroundColor Yellow
$vehicleData = @{
    vehicleId = "EV_001"
    timestamp = "2026-02-09T22:29:00Z"
    soc = 85.5
    kwhDeliveredDc = 45.2
    batteryTemp = 32.5
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri http://localhost:3000/v1/ingest/vehicle -Method POST -Body $vehicleData -ContentType 'application/json'
    Write-Host "✅ Vehicle ingestion successful!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Vehicle ingestion failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Multiple Vehicle entries for analytics
Write-Host "3️⃣  Adding more vehicle data for analytics..." -ForegroundColor Yellow
$timestamps = @("2026-02-09T22:00:00Z", "2026-02-09T22:10:00Z", "2026-02-09T22:20:00Z")
foreach ($ts in $timestamps) {
    $data = @{
        vehicleId = "EV_001"
        timestamp = $ts
        soc = Get-Random -Minimum 70 -Maximum 90
        kwhDeliveredDc = Get-Random -Minimum 40 -Maximum 50
        batteryTemp = Get-Random -Minimum 30 -Maximum 35
    } | ConvertTo-Json
    
    try {
        Invoke-WebRequest -Uri http://localhost:3000/v1/ingest/vehicle -Method POST -Body $data -ContentType 'application/json' | Out-Null
        Write-Host "✅ Added data for $ts" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed for $ts" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Analytics Endpoint
Write-Host "4️⃣  Testing Analytics Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/v1/analytics/performance/EV_001" -Method GET
    Write-Host "✅ Analytics retrieved successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $response.Content -ForegroundColor Cyan
} catch {
    Write-Host "❌ Analytics failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ API Testing Complete!" -ForegroundColor Cyan
