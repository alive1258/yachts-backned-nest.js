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

@Entity('destinations')
@Index(['position'])
@Index(['is_active'])
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        DESTINATION CONTENT
  ========================= */

  /** e.g. "Greek Islands", "Phuket, Thailand" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  /** Destination photo (uploaded via multipart form) */
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
