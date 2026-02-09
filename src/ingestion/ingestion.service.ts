import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MeterTelemetryHistory } from '../database/entities/meter-telemetry-history.entity';
import { MeterCurrentStatus } from '../database/entities/meter-current-status.entity';
import { VehicleTelemetryHistory } from '../database/entities/vehicle-telemetry-history.entity';
import { VehicleCurrentStatus } from '../database/entities/vehicle-current-status.entity';
import { MeterTelemetryDto } from './dto/meter-telemetry.dto';
import { VehicleTelemetryDto } from './dto/vehicle-telemetry.dto';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(MeterTelemetryHistory)
    private meterHistoryRepo: Repository<MeterTelemetryHistory>,
    @InjectRepository(MeterCurrentStatus)
    private meterStatusRepo: Repository<MeterCurrentStatus>,
    @InjectRepository(VehicleTelemetryHistory)
    private vehicleHistoryRepo: Repository<VehicleTelemetryHistory>,
    @InjectRepository(VehicleCurrentStatus)
    private vehicleStatusRepo: Repository<VehicleCurrentStatus>,
    private dataSource: DataSource,
  ) {}

  /**
   * Ingests meter telemetry data using dual-write pattern:
   * 1. INSERT into history table (append-only audit trail)
   * 2. UPSERT into current_status table (latest state)
   */
  async ingestMeterData(dto: MeterTelemetryDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // INSERT into history (append-only)
      const historyEntry = this.meterHistoryRepo.create({
        meterId: dto.meterId,
        kwhConsumedAc: dto.kwhConsumedAc,
        voltage: dto.voltage,
        timestamp: dto.timestamp,
      });
      await queryRunner.manager.save(historyEntry);

      // UPSERT into current_status (latest state)
      await queryRunner.manager.upsert(
        MeterCurrentStatus,
        {
          meterId: dto.meterId,
          kwhConsumedAc: dto.kwhConsumedAc,
          voltage: dto.voltage,
          lastUpdated: dto.timestamp,
        },
        ['meterId'], // Conflict target
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Ingests vehicle telemetry data using dual-write pattern:
   * 1. INSERT into history table (append-only audit trail)
   * 2. UPSERT into current_status table (latest state)
   */
  async ingestVehicleData(dto: VehicleTelemetryDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // INSERT into history (append-only)
      const historyEntry = this.vehicleHistoryRepo.create({
        vehicleId: dto.vehicleId,
        soc: dto.soc,
        kwhDeliveredDc: dto.kwhDeliveredDc,
        batteryTemp: dto.batteryTemp,
        timestamp: dto.timestamp,
      });
      await queryRunner.manager.save(historyEntry);

      // UPSERT into current_status (latest state)
      await queryRunner.manager.upsert(
        VehicleCurrentStatus,
        {
          vehicleId: dto.vehicleId,
          soc: dto.soc,
          kwhDeliveredDc: dto.kwhDeliveredDc,
          batteryTemp: dto.batteryTemp,
          lastUpdated: dto.timestamp,
        },
        ['vehicleId'], // Conflict target
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
