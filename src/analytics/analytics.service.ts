import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { VehicleTelemetryHistory } from '../database/entities/vehicle-telemetry-history.entity';
import { VehicleCurrentStatus } from '../database/entities/vehicle-current-status.entity';
import { MeterTelemetryHistory } from '../database/entities/meter-telemetry-history.entity';
import { PerformanceMetricsDto } from './dto/performance-metrics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(VehicleTelemetryHistory)
    private vehicleHistoryRepo: Repository<VehicleTelemetryHistory>,
    @InjectRepository(VehicleCurrentStatus)
    private vehicleStatusRepo: Repository<VehicleCurrentStatus>,
    @InjectRepository(MeterTelemetryHistory)
    private meterHistoryRepo: Repository<MeterTelemetryHistory>,
  ) {}

  /**
   * Get 24-hour performance metrics for a vehicle
   * 
   * Query Strategy (Optimized to avoid full table scans):
   * 1. Verify vehicle exists in current_status (O(1) lookup)
   * 2. Use indexed time-range query on history tables
   * 3. Aggregate data and calculate efficiency ratio
   * 
   * Performance: Uses composite index (vehicleId, timestamp) so no full scan
   */
  async getPerformanceMetrics(vehicleId: string): Promise<PerformanceMetricsDto> {
    // Verify vehicle exists
    const vehicleStatus = await this.vehicleStatusRepo.findOne({
      where: { vehicleId },
    });

    if (!vehicleStatus) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }

    // Calculate 24-hour time window
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Query vehicle history (uses index: vehicleId + timestamp)
    const vehicleData = await this.vehicleHistoryRepo
      .createQueryBuilder('v')
      .select('SUM(v.kwhDeliveredDc)', 'totalDc')
      .addSelect('AVG(v.batteryTemp)', 'avgTemp')
      .addSelect('COUNT(*)', 'count')
      .where('v.vehicleId = :vehicleId', { vehicleId })
      .andWhere('v.timestamp >= :startTime', { startTime: twentyFourHoursAgo })
      .getRawOne();

    // For a real-world scenario, we need to correlate vehicle to meter
    // Assuming 1:1 mapping or meterId = vehicleId for this demo
    // In production, you'd have a vehicle_meter mapping table
    const meterId = vehicleId; // Simplified assumption

    // Query meter history (uses index: meterId + timestamp)
    const meterData = await this.meterHistoryRepo
      .createQueryBuilder('m')
      .select('SUM(m.kwhConsumedAc)', 'totalAc')
      .where('m.meterId = :meterId', { meterId })
      .andWhere('m.timestamp >= :startTime', { startTime: twentyFourHoursAgo })
      .getRawOne();

    const totalDc = parseFloat(vehicleData.totalDc) || 0;
    const totalAc = parseFloat(meterData.totalAc) || 0;
    const avgTemp = parseFloat(vehicleData.avgTemp) || 0;

    // Calculate efficiency ratio (DC/AC)
    // In real world: AC > DC due to conversion losses
    const efficiencyRatio = totalAc > 0 ? totalDc / totalAc : 0;

    return {
      totalEnergyConsumedAc: totalAc,
      totalEnergyDeliveredDc: totalDc,
      efficiencyRatio: parseFloat(efficiencyRatio.toFixed(4)),
      avgBatteryTemp: parseFloat(avgTemp.toFixed(2)),
      periodStart: twentyFourHoursAgo,
      periodEnd: now,
    };
  }
}
