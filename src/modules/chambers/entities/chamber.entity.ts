import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 0 = Sunday ... 6 = Saturday, matching JS Date#getDay() so the frontend can
 * resolve "which chamber is the doctor at on this date" with new
 * Date(date).getDay() and no timezone-name mapping.
 */
export enum Weekday {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

@Entity('chambers')
@Index(['day_of_week'])
@Index(['is_active'])
export class Chamber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 0 (Sunday) – 6 (Saturday). Multiple chambers can share a weekday (e.g.
   * different locations/times), as long as their time ranges don't overlap
   * — enforced in ChambersService, not at the schema level.
   */
  @Column({ type: 'smallint' })
  day_of_week: Weekday;

  /** e.g. "Pranto Specialized Hospital" */
  @Column({ type: 'varchar', length: 255 })
  location_name: string;

  /** Full address, shown to patients */
  @Column({ type: 'text', nullable: true })
  address?: string;

  /** Consultation fee at this chamber, in BDT */
  @Column({ type: 'int' })
  fee: number;

  /** Chamber start time, 24h "HH:mm", e.g. "14:00" */
  @Column({ type: 'varchar', length: 5 })
  start_time: string;

  /** Chamber end time, 24h "HH:mm", e.g. "20:00" */
  @Column({ type: 'varchar', length: 5 })
  end_time: string;

  /** Average minutes spent per patient, used to compute serial ETA */
  @Column({ type: 'int', default: 10 })
  avg_minutes_per_patient: number;

  /**
   * Hard cap on patients bookable per day at this chamber. Defaults to
   * floor((end_time - start_time) / avg_minutes_per_patient) when unset —
   * see ChambersService.capacityOf.
   */
  @Column({ type: 'int', nullable: true })
  max_patients?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  added_by: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'added_by' })
  addedBy: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
