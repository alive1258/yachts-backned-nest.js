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

@Entity('events')
@Index(['position'])
@Index(['is_active'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Cannes Yachting Festival" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** e.g. "September 8 – 13, 2026" */
  @Column({ type: 'varchar', length: 255 })
  date_range: string;

  /** e.g. "Vieux Port & Port Canto, Cannes, France" */
  @Column({ type: 'varchar', length: 255 })
  location: string;

  /** e.g. "Eco Serenity will be open for private charter previews..." */
  @Column({ type: 'text' })
  description: string;

  /** e.g. "Eco Serenity" or "Eco Voyager & Eco Sharlou" */
  @Column({ type: 'varchar', length: 255 })
  yacht: string;

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
