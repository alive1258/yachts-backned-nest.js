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

export interface SustainabilityHighlight {
  icon: string;
  title: string;
  description: string;
}

@Entity('sustainability_sections')
@Index(['position'])
@Index(['is_active'])
export class Sustainability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        SECTION CONTENT
  ========================= */

  /** Small eyebrow text above the heading, e.g. "A Greener Way to Sail" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  label?: string;

  /** e.g. "Luxury that Cares for Our Planet" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  /** Bullet highlights, e.g. [{ icon: "Zap", title: "...", description: "..." }] */
  @Column({ type: 'jsonb', nullable: true })
  highlights?: SustainabilityHighlight[];

  @Column({ type: 'varchar', length: 100, default: 'Go Sustainable' })
  button_text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  button_link?: string;

  /** Floating badge over the image, e.g. "Eco Certified" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  badge_text?: string;

  /** Lucide icon name for the floating badge */
  @Column({ type: 'varchar', length: 100, nullable: true, default: 'ShieldCheck' })
  badge_icon?: string;

  /** Feature image (uploaded via multipart form) */
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
