import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { MeterTelemetryDto } from './dto/meter-telemetry.dto';
import { VehicleTelemetryDto } from './dto/vehicle-telemetry.dto';

@Controller('v1/ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('meter')
  @HttpCode(HttpStatus.CREATED)
  async ingestMeter(@Body() dto: MeterTelemetryDto): Promise<{ message: string }> {
    await this.ingestionService.ingestMeterData(dto);
    return { message: 'Meter telemetry ingested successfully' };
  }

  @Post('vehicle')
  @HttpCode(HttpStatus.CREATED)
  async ingestVehicle(@Body() dto: VehicleTelemetryDto): Promise<{ message: string }> {
    await this.ingestionService.ingestVehicleData(dto);
    return { message: 'Vehicle telemetry ingested successfully' };
  }
}
