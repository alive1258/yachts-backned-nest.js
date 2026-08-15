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
import type { YachtSpecifications } from './yacht-specifications.interface';
import type { YachtRate } from './yacht-rate.interface';

@Entity('yachts')
@Index(['slug'], { unique: true })
@Index(['position'])
@Index(['is_active'])
@Index(['category'])
export class Yacht {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        IDENTITY
  ========================= */

  /** URL-friendly identifier, e.g. "eco-voyager" */
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  /** e.g. "Eco Voyager" */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** e.g. "The fleet flagship for extended, long-range charters" */
  @Column({ type: 'varchar', length: 255 })
  tagline: string;

  /** e.g. "Hybrid Motor Yacht" */
  @Column({ type: 'varchar', length: 255 })
  category: string;

  /* =========================
        CORE STATS (queryable/sortable)
  ========================= */

  @Column({ type: 'int' })
  length_ft: number;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  length_m: number;

  @Column({ type: 'int' })
  built_year: number;

  @Column({ type: 'int' })
  refit_year: number;

  @Column({ type: 'int' })
  guests: number;

  @Column({ type: 'int' })
  cabins: number;

  @Column({ type: 'int' })
  crew: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price_per_night: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'per night' })
  price_unit: string;

  @Column({ type: 'varchar', length: 255 })
  region: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  cruising_speed: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  max_speed: number;

  @Column({ type: 'int' })
  range_nm: number;

  @Column({ type: 'varchar', length: 255 })
  engines: string;

  @Column({ type: 'varchar', length: 255 })
  hull_material: string;

  @Column({ type: 'varchar', length: 255 })
  builder: string;

  /* =========================
        MEDIA & CONTENT
  ========================= */

  /** Hero image (uploaded via multipart form) */
  @Column({ type: 'varchar' })
  hero_image: string;

  /** Gallery photo URLs (uploaded via multipart form), in display order */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  gallery: string[];

  /** Body paragraphs, rendered in order */
  @Column({ type: 'jsonb' })
  description: string[];

  /** Bullet list of standout features */
  @Column({ type: 'jsonb' })
  special_features: string[];

  /* =========================
        STRUCTURED CONTENT
  ========================= */

  /** Full spec-sheet breakdown (accommodation, construction, dimensions, performance, classification, amenities) */
  @Column({ type: 'jsonb' })
  specifications: YachtSpecifications;

  /** Seasonal rate table */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  rates: YachtRate[];

  /* =========================
        ADMIN
  ========================= */

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
