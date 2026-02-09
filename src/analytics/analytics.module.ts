import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { VehicleTelemetryHistory } from '../database/entities/vehicle-telemetry-history.entity';
import { VehicleCurrentStatus } from '../database/entities/vehicle-current-status.entity';
import { MeterTelemetryHistory } from '../database/entities/meter-telemetry-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleTelemetryHistory,
      VehicleCurrentStatus,
      MeterTelemetryHistory,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
