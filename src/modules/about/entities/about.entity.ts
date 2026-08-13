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

export interface AboutInfoItem {
  icon: string;
  label: string;
  value: string;
}

@Entity('abouts')
@Index(['position'])
@Index(['is_active'])
export class About {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        ABOUT CONTENT
  ========================= */

  /** e.g. "About The Doctor" */
  @Column({ type: 'varchar', length: 255, default: 'About The Doctor' })
  eyebrow: string;

  /** e.g. "Dr. Anarul Islam" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Short qualifications line, e.g. "MBBS (DU), MS Neurosurgery (Course)" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** e.g. "Neurosurgery & General Medicine" */
  @Column({ type: 'varchar', length: 255 })
  specialty: string;

  /** Bio paragraphs, rendered in order */
  @Column({ type: 'jsonb', nullable: true })
  bio?: string[];

  /** Info grid, e.g. [{ icon: "GraduationCap", label: "Qualifications", value: "..." }] */
  @Column({ type: 'jsonb', nullable: true })
  info?: AboutInfoItem[];

  /** e.g. "BMDC Reg. No. — 12345" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  registration?: string;

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
