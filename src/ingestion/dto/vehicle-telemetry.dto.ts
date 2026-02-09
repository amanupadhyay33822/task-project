import { IsNotEmpty, IsString, IsNumber, Min, Max, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleTelemetryDto {
  @IsNotEmpty()
  @IsString()
  vehicleId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  soc: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  kwhDeliveredDc: number;

  @IsNotEmpty()
  @IsNumber()
  batteryTemp: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;
}
