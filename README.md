# Energy Ingestion Engine

High-scale energy ingestion system for Fleet platform managing 10,000+ Smart Meters and EV Fleet telemetry.

## Architecture Overview

### Hot/Cold Data Separation

The system uses a **4-table architecture** to optimize both write-heavy ingestion and read-heavy analytics:

#### Historical Tables (Cold Storage - Append-Only)
- `meter_telemetry_history` - All meter readings with composite index on `(meterId, timestamp)`
- `vehicle_telemetry_history` - All vehicle readings with composite index on `(vehicleId, timestamp)`

#### Current Status Tables (Hot Storage - Latest State)
- `meter_current_status` - Latest meter state (1 row per meter, primary key: meterId)
- `vehicle_current_status` - Latest vehicle state (1 row per vehicle, primary key: vehicleId)

### Dual-Write Pattern

Each ingestion performs two operations atomically within a transaction:
1. **INSERT** into history table (append-only audit trail)
2. **UPSERT** into current_status table (latest state for fast dashboard queries)

This ensures:
- Complete historical data for analytics
- Fast O(1) lookups for current status
- Transactional consistency

### Performance Optimization

- **Analytics queries** use indexed time-range queries (no full table scans)
- **Dashboard queries** scan only ~10K rows (current_status tables) instead of billions
- **Composite indexes** on `(deviceId, timestamp DESC)` for efficient time-series queries

## Domain Context

### Hardware Components

- **Smart Meter (Grid Side)**: Measures AC power consumed from utility grid
  - Reports: `kwhConsumedAc`, `voltage`
- **EV & Charger (Vehicle Side)**: Converts AC to DC for battery
  - Reports: `kwhDeliveredDc`, `soc` (State of Charge %), `batteryTemp`

### Power Loss Thesis

In real-world scenarios: **AC Consumed > DC Delivered** due to:
- Heat loss during AC-to-DC conversion
- Energy leakage in charging infrastructure

**Efficiency Ratio = DC Delivered / AC Consumed**
- Normal efficiency: 85-95%
- Low efficiency (<85%): Indicates hardware fault or energy leakage

## Setup Instructions

### Option 1: Docker Deployment (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd noida-project

# Start services (PostgreSQL + Application)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

The application will be available at `http://localhost:3000`.

### Option 2: Manual Installation

#### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start PostgreSQL (ensure database exists)
# CREATE DATABASE energy_ingestion;

# Run the application
npm run start:dev
```

## API Endpoints

### Ingestion Endpoints

#### Ingest Meter Telemetry
```bash
POST /v1/ingest/meter
Content-Type: application/json

{
  "meterId": "M001",
  "kwhConsumedAc": 150.5,
  "voltage": 230.0,
  "timestamp": "2026-02-08T18:00:00Z"
}
```

#### Ingest Vehicle Telemetry
```bash
POST /v1/ingest/vehicle
Content-Type: application/json

{
  "vehicleId": "V001",
  "soc": 75.5,
  "kwhDeliveredDc": 128.4,
  "batteryTemp": 32.5,
  "timestamp": "2026-02-08T18:00:00Z"
}
```

### Analytics Endpoint

#### Get 24-Hour Performance Metrics
```bash
GET /v1/analytics/performance/:vehicleId

Response:
{
  "totalEnergyConsumedAc": 450.5,
  "totalEnergyDeliveredDc": 385.2,
  "efficiencyRatio": 0.8550,
  "avgBatteryTemp": 31.5,
  "periodStart": "2026-02-07T18:00:00Z",
  "periodEnd": "2026-02-08T18:00:00Z"
}
```

## Testing

### Sample Test Script

```bash
# Ingest meter data
curl -X POST http://localhost:3000/v1/ingest/meter \
  -H "Content-Type: application/json" \
  -d '{
    "meterId": "M001",
    "kwhConsumedAc": 150.5,
    "voltage": 230,
    "timestamp": "2026-02-08T18:00:00Z"
  }'

# Ingest vehicle data
curl -X POST http://localhost:3000/v1/ingest/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "V001",
    "soc": 75,
    "kwhDeliveredDc": 128.4,
    "batteryTemp": 32,
    "timestamp": "2026-02-08T18:00:00Z"
  }'

# Get performance metrics
curl http://localhost:3000/v1/analytics/performance/V001
```

## Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer

## Scale Considerations

With 10,000 devices sending data every 60 seconds:
- **Daily ingestion**: 14.4M rows/day
- **Monthly growth**: ~432M rows/month

Future optimizations for production:
- Table partitioning by timestamp ranges (monthly/weekly)
- Read replicas for analytics queries
- Connection pooling optimization
- Batch ingestion endpoints for bulk uploads
- Archive old data to cold storage (S3/data lake)

## License

ISC
