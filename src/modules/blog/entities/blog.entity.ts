import { BlogCategory } from 'src/modules/blog-category/entities/blog-category.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'blogs' })
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 512 })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'varchar', nullable: true, length: 256 })
  author_name?: string;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  read_time?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'int', nullable: true })
  position?: number;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'bigint', nullable: true })
  category_id?: string;

  @ManyToOne(() => BlogCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: BlogCategory;

  @Column({ type: 'bigint', nullable: false })
  added_by: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'added_by' })
  added_by_user: User;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  meta_title?: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  meta_keywords?: string;

  @Column({ type: 'text', nullable: true })
  meta_description?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
