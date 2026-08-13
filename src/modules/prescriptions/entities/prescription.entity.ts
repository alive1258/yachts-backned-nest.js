import { Appointment } from 'src/modules/appointments/entities/appointment.entity';
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

export enum PatientGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface PrescriptionMedicineItem {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface PrescriptionTestItem {
  name: string;
  instructions?: string;
}

export enum ComplaintDurationUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface PrescriptionChiefComplaintItem {
  name: string;
  duration_value?: number;
  duration_unit?: ComplaintDurationUnit;
  note?: string;
}

@Entity('prescriptions')
@Index(['prescription_date'])
@Index(['share_token'], { unique: true })
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  patient_name: string;

  @Column({ type: 'int', nullable: true })
  patient_age?: number;

  @Column({ type: 'enum', enum: PatientGender, nullable: true })
  patient_gender?: PatientGender;

  @Column({ type: 'varchar', length: 30, nullable: true })
  patient_phone?: string;

  @Column({ type: 'text', nullable: true })
  patient_address?: string;

  /** Optional link to the appointment this prescription was written for */
  @Column({ type: 'uuid', nullable: true })
  appointment_id?: string;

  @ManyToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment;

  /** Diagnosis notes — distinct from the structured `chief_complaints` below */
  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @Column({ type: 'jsonb', nullable: true })
  chief_complaints?: PrescriptionChiefComplaintItem[];

  @Column({ type: 'jsonb', nullable: true })
  medicines?: PrescriptionMedicineItem[];

  @Column({ type: 'jsonb', nullable: true })
  tests?: PrescriptionTestItem[];

  /** General advice / notes */
  @Column({ type: 'text', nullable: true })
  advice?: string;

  @Column({ type: 'date', nullable: true })
  follow_up_date?: string;

  @Column({ type: 'date' })
  prescription_date: string;

  /**
   * Random unguessable token (not the row's UUID) used for the public
   * print/share link — keeps that link stable and shareable without
   * exposing sequential/enumerable prescription IDs.
   */
  @Column({ type: 'varchar', length: 64, unique: true })
  share_token: string;

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
