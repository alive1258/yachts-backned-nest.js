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
import type { PortfolioIcon } from '../dto/icon-options';

@Entity('portfolio_items')
@Index(['position'])
@Index(['is_active'])
export class PortfolioItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Family Charters" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** e.g. "Shallow-draft tenders, connecting cabins..." */
  @Column({ type: 'text' })
  description: string;

  /** Lucide icon key — see PORTFOLIO_ICONS */
  @Column({ type: 'varchar', length: 50 })
  icon: PortfolioIcon;

  /** Card image (uploaded via multipart form) */
  @Column({ type: 'varchar', nullable: true })
  image?: string;

  /** Internal link the card navigates to, e.g. "/yachts" */
  @Column({ type: 'varchar', length: 255 })
  href: string;

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
