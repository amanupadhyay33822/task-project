import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PerformanceMetricsDto } from './dto/performance-metrics.dto';

@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('performance/:vehicleId')
  async getPerformanceMetrics(
    @Param('vehicleId') vehicleId: string,
  ): Promise<PerformanceMetricsDto> {
    return this.analyticsService.getPerformanceMetrics(vehicleId);
  }
}
