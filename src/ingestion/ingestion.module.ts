import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { MeterTelemetryHistory } from '../database/entities/meter-telemetry-history.entity';
import { MeterCurrentStatus } from '../database/entities/meter-current-status.entity';
import { VehicleTelemetryHistory } from '../database/entities/vehicle-telemetry-history.entity';
import { VehicleCurrentStatus } from '../database/entities/vehicle-current-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeterTelemetryHistory,
      MeterCurrentStatus,
      VehicleTelemetryHistory,
      VehicleCurrentStatus,
    ]),
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
