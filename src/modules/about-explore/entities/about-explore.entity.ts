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
import type { AboutExploreIcon } from '../dto/icon-options';

@Entity('about_explore_cards')
@Index(['position'])
@Index(['is_active'])
export class AboutExploreCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Offices & People" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** e.g. "Meet the teams behind every charter..." */
  @Column({ type: 'text' })
  description: string;

  /** Internal link the card navigates to, e.g. "/about/partners" */
  @Column({ type: 'varchar', length: 255 })
  href: string;

  /** Lucide icon key — see ABOUT_EXPLORE_ICONS */
  @Column({ type: 'varchar', length: 50 })
  icon: AboutExploreIcon;

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
