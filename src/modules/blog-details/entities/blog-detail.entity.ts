import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from '../../blog/entities/blog.entity';
import { User } from 'src/modules/users/entities/user.entity';

export interface BulletItem {
  title: string;
  text: string;
}

@Entity({ name: 'blog_details' })
export class BlogDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* FK → blog */
  @Column({ type: 'bigint', nullable: false })
  blog_id: string;

  @ManyToOne(() => Blog, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  /* section anchor key — used in TOC href (#overview) */
  @Column({ type: 'varchar', nullable: true, length: 256 })
  section_key?: string;

  /* section heading */
  @Column({ type: 'varchar', nullable: true, length: 512 })
  heading?: string;

  /* body paragraphs (\n\n separated) */
  @Column({ type: 'text', nullable: true })
  body?: string;

  /* TOC title entries — stored as jsonb string[] */
  @Column({ type: 'jsonb', nullable: true })
  titles?: string[];

  /* bullet list stored as jsonb [{title, text}] */
  @Column({ type: 'jsonb', nullable: true })
  bullets?: BulletItem[];

  /* optional section image */
  @Column({ type: 'varchar', nullable: true })
  image?: string;

  /* display order */
  @Column({ type: 'int', nullable: true, default: 0 })
  position: number;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'bigint', nullable: false })
  added_by: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'added_by' })
  added_by_user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
