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

@Entity('sustainability_roadmap_items')
@Index(['position'])
@Index(['is_active'])
export class SustainabilityRoadmapItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "2024", "2030" */
  @Column({ type: 'varchar', length: 50 })
  year: string;

  /** e.g. "Completed hybrid-electric refits across the first eight yachts..." */
  @Column({ type: 'text' })
  milestone: string;

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
