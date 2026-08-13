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

export interface EducationRowItem {
  icon: string;
  title: string;
  subtitle: string;
  period?: string;
  placeholder?: boolean;
}

@Entity('educations')
@Index(['position'])
@Index(['is_active'])
export class Education {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        SECTION HEADER
  ========================= */

  /** e.g. "Background" */
  @Column({ type: 'varchar', length: 255, default: 'Background' })
  eyebrow: string;

  /** e.g. "Qualifications & Experience" */
  @Column({ type: 'varchar', length: 255 })
  heading: string;

  /** Supporting paragraph under the heading */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /* =========================
        GROUPS (jsonb row lists)
  ========================= */

  /** Education (SSC, HSC, MBBS, ...) */
  @Column({ type: 'jsonb', nullable: true })
  education?: EducationRowItem[];

  /** Certifications & Training */
  @Column({ type: 'jsonb', nullable: true })
  certificates?: EducationRowItem[];

  /** Honors & Recognition */
  @Column({ type: 'jsonb', nullable: true })
  awards?: EducationRowItem[];

  /** Clinical Experience */
  @Column({ type: 'jsonb', nullable: true })
  experience?: EducationRowItem[];

  /** Leadership / Beyond The Clinic */
  @Column({ type: 'jsonb', nullable: true })
  leadership?: EducationRowItem[];

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
