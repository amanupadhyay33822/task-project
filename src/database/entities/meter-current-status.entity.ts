import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('meter_current_status')
export class MeterCurrentStatus {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  meterId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  kwhConsumedAc: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  voltage: number;

  @UpdateDateColumn({ type: 'timestamp' })
  lastUpdated: Date;
}
