export class PerformanceMetricsDto {
  totalEnergyConsumedAc: number;
  totalEnergyDeliveredDc: number;
  efficiencyRatio: number;
  avgBatteryTemp: number;
  periodStart: Date;
  periodEnd: Date;
}
