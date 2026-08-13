import { Chamber } from 'src/modules/chambers/entities/chamber.entity';
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

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentSource {
  ONLINE = 'online',
  STAFF = 'staff',
}

export enum PatientType {
  NEW = 'new',
  RETURNING = 'returning',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/** Consultation modality — distinct from `source` (who made the booking) */
export enum AppointmentType {
  ONLINE = 'online',
  ON_CHAMBER = 'on-chamber',
}

@Entity('appointments')
@Index(['chamber_id', 'appointment_date', 'serial_number'], { unique: true })
@Index(['appointment_date'])
@Index(['status'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  email?: string;

  @Column({ type: 'date', nullable: true })
  dob?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  /** Completed years at time of booking — captured directly since many
   *  patients (especially infants/children) don't have an exact DOB */
  @Column({ type: 'smallint', nullable: true })
  age_years?: number;

  @Column({ type: 'smallint', nullable: true })
  age_months?: number;

  @Column({ type: 'smallint', nullable: true })
  age_days?: number;

  /** Reason for visit — one of ServicesSection's service titles */
  @Column({ type: 'varchar', length: 255 })
  service: string;

  @Column({ type: 'enum', enum: PatientType, default: PatientType.NEW })
  patient_type: PatientType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid' })
  chamber_id: string;

  @ManyToOne(() => Chamber, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'chamber_id' })
  chamber: Chamber;

  /** Date the patient is booked for */
  @Column({ type: 'date' })
  appointment_date: string;

  /** Position in that day's queue at this chamber, 1-indexed */
  @Column({ type: 'int' })
  serial_number: number;

  /** Computed ETA, "HH:mm" — chamber start_time + (serial-1) * avg_minutes */
  @Column({ type: 'varchar', length: 5 })
  estimated_time: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  /** Who initiated the booking — the patient online, or staff on a phone call */
  @Column({
    type: 'enum',
    enum: AppointmentSource,
    default: AppointmentSource.ONLINE,
  })
  source: AppointmentSource;

  /** Consultation modality — video call or in-person at the chamber */
  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.ON_CHAMBER,
  })
  appointment_type: AppointmentType;

  /** Set only for staff-created (phone-in) bookings; null for public online bookings */
  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
