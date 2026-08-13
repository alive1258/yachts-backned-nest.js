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

@Entity('testimonials')
@Index(['position'])
@Index(['is_active'])
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Patient name, e.g. "Rahim" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** Optional relation/role label, e.g. "Patient", "Guardian of patient" */
  @Column({ type: 'varchar', length: 255, nullable: true })
  designation?: string;

  /** Patient photo (uploaded via multipart form) */
  @Column({ type: 'varchar', nullable: true })
  image?: string;

  /** The review/quote text */
  @Column({ type: 'text' })
  description: string;

  /** Star rating, 1–5 */
  @Column({ type: 'int' })
  rating: number;

  /** Optional video testimonial URL — presence marks it a video review */
  @Column({ type: 'varchar', nullable: true })
  video_url?: string;

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
