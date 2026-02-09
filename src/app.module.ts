import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionModule } from './ingestion/ingestion.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MeterTelemetryHistory } from './database/entities/meter-telemetry-history.entity';
import { MeterCurrentStatus } from './database/entities/meter-current-status.entity';
import { VehicleTelemetryHistory } from './database/entities/vehicle-telemetry-history.entity';
import { VehicleCurrentStatus } from './database/entities/vehicle-current-status.entity';

@Module({
  imports: [
    // Load environment variables FIRST
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Use ConfigService to access environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          MeterTelemetryHistory,
          MeterCurrentStatus,
          VehicleTelemetryHistory,
          VehicleCurrentStatus,
        ],
        synchronize: true, // Set to false in production, use migrations
        logging: false,
      }),
    }),
    IngestionModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
