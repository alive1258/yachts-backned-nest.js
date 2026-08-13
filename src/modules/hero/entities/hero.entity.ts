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

export interface HeroStat {
  icon: string;
  value: string;
  label: string;
}

@Entity('heroes')
@Index(['position'])
@Index(['is_active'])
export class Hero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        HERO CONTENT
  ========================= */

  /** e.g. "MBBS (DU) • CMU (Ultrasonography) • MS Neurosurgery (Course)" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  badge?: string;

  /** e.g. "Bangladesh Medical University (Ex-PG Hospital), Mirpur" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  affiliation?: string;

  /** e.g. "Dr. Anarul Islam" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  /** Areas of focus, e.g. ["Brain and Spinal Tumors", ...] */
  @Column({ type: 'jsonb', nullable: true })
  specialties?: string[];

  @Column({ type: 'varchar', length: 100, default: 'Book Appointment' })
  primary_button_text: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '#appointment' })
  primary_button_link?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: 'Watch Intro Video' })
  secondary_button_text?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '#video' })
  secondary_button_link?: string;

  /** Trust stats, e.g. [{ icon: "Award", value: "5+ Yrs", label: "In Experience" }] */
  @Column({ type: 'jsonb', nullable: true })
  stats?: HeroStat[];

  @Column({ type: 'varchar', length: 20, nullable: true })
  rating_value?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rating_label?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  floating_badge?: string;

  /** Doctor photo (uploaded via multipart form) */
  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'int', default: 1 })
  position: number;

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

  /* =========================
        TIMESTAMPS
  ========================= */

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
