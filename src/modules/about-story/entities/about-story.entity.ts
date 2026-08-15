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

@Entity('about_stories')
@Index(['position'])
@Index(['is_active'])
export class AboutStory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Small eyebrow label above the heading, e.g. "Our Story" */
  @Column({ type: 'varchar', length: 255, default: 'Our Story' })
  eyebrow: string;

  /** e.g. "A Fleet Built Around a Simple Idea" */
  @Column({ type: 'varchar', length: 255 })
  heading: string;

  /** Body paragraphs, rendered in order */
  @Column({ type: 'jsonb' })
  paragraphs: string[];

  /** Story image (uploaded via multipart form) */
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
