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
import type { SustainabilityPillarIcon } from '../dto/icon-options';

@Entity('sustainability_pillars')
@Index(['position'])
@Index(['is_active'])
export class SustainabilityPillar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Fleet Electrification" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** e.g. "Every new build and major refit moves toward hybrid-electric..." */
  @Column({ type: 'text' })
  description: string;

  /** Lucide icon key — see SUSTAINABILITY_PILLAR_ICONS */
  @Column({ type: 'varchar', length: 50 })
  icon: SustainabilityPillarIcon;

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
