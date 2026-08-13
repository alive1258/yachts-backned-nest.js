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

@Entity('gallery_items')
@Index(['position'])
@Index(['is_active'])
export class GalleryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** e.g. "Consultation Room" */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /** e.g. "A look inside the main consultation room." */
  @Column({ type: 'text' })
  description: string;

  /** Uploaded photo URLs (Cloudinary), in display order */
  @Column({ type: 'jsonb', nullable: true })
  images?: string[];

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
