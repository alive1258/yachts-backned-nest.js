import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';

@Entity({ name: 'users' })
export class User {
  /**
   * Primary key
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Name
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string;

  /**
   * Mobile
   */
  @Column({ type: 'varchar', length: 15, nullable: false })
  mobile: string;

  /**
   * Email
   */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  /**
   * User's role (FK). Dynamic — every role except the seeded Super Admin
   * can be created/edited/deleted at runtime via the roles module.
   */
  @Index()
  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ default: 0 })
  token_version: number;

  @Column({ type: 'boolean', default: false })
  has_refresh_token: boolean;

  /**
   * Is Account Verified
   */
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  /**
   * Is Account Active (soft-delete / deactivation flag)
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * Password
   */

  @Column({ type: 'varchar', nullable: false })
  @Exclude()
  password: string;

  /**
   * Remember Token
   */
  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  remember_token?: string;

  /**
   * Division ID (FK)
   */
  @Index()
  @Column({ type: 'int', nullable: true })
  division_id?: number;

  /**
   * District ID (FK)
   */
  @Index()
  @Column({ type: 'int', nullable: true })
  district_id?: number;

  /**
   * upzela_id
   */
  @Index()
  @Column({ type: 'int', nullable: true })
  upazila_id?: number;

  /**
   * Address
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  /**
   * Created At
   */
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  /**
   * Updated At
   */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
