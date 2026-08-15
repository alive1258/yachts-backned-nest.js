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

@Entity('innovation_concepts')
@Index(['position'])
@Index(['is_active'])
export class InnovationConcept {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Silent Series Concept" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** e.g. "Near-silent electric propulsion for long-range cruising..." */
  @Column({ type: 'text' })
  description: string;

  /** Concept render/photo (uploaded via multipart form) */
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;
}
