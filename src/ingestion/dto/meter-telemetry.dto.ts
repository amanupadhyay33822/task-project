import { IsNotEmpty, IsString, IsNumber, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class MeterTelemetryDto {
  @IsNotEmpty()
  @IsString()
  meterId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  kwhConsumedAc: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  voltage: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;
}
