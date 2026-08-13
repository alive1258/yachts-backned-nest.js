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

@Entity('client_video_reviews')
@Index(['position'])
@Index(['is_active'])
export class ClientVideoReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Patient/client name, e.g. "Jasim" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Optional relation/role label, e.g. "Patient" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  designation?: string;

  /** Client photo (uploaded via multipart form) */
  @Column({ type: 'varchar', nullable: true })
  image?: string;

  /** Short quote shown alongside the video */
  @Column({ type: 'text' })
  description: string;

  /** Star rating, 1–5 */
  @Column({ type: 'int' })
  rating: number;

  /** External video URL (YouTube, Vimeo, Cloudinary, ...) */
  @Column({ type: 'varchar' })
  video_url: string;

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
