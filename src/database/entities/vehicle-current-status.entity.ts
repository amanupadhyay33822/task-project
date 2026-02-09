import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('vehicle_current_status')
export class VehicleCurrentStatus {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  vehicleId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  soc: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  kwhDeliveredDc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  batteryTemp: number;

  @UpdateDateColumn({ type: 'timestamp' })
  lastUpdated: Date;
}
