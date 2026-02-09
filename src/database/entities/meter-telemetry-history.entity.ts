import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('meter_telemetry_history')
@Index(['meterId', 'timestamp'], { unique: false })
export class MeterTelemetryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  meterId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  kwhConsumedAc: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  voltage: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
