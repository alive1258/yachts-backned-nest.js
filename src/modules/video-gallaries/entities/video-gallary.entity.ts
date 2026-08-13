import { User } from 'src/modules/users/entities/user.entity';
import { VideoGallaryCategory } from 'src/modules/video-gallary-categories/entities/video-gallary-category.entity';
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

@Entity('video_gallaries')
@Index('IDX_VIDEO_TITLE', ['title'])
export class VideoGallary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  video_url?: string;

  @Column({ type: 'bigint', nullable: false })
  added_by: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'added_by' })
  addedBy: User;

  @Column({ type: 'bigint', nullable: false })
  video_gallary_category_id: string;

  @ManyToOne(() => VideoGallaryCategory, { nullable: false })
  @JoinColumn({ name: 'video_gallary_category_id' })
  videoGallaryCategory: VideoGallaryCategory;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
