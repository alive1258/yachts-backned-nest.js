import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
@Index('IDX_ROLE_SLUG', ['slug'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Display name shown in the admin UI, e.g. "HR Manager"
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * Stable machine key derived from name at creation, never changed
   * afterward — referenced by users.role_id and role_permissions.role_id
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  /**
   * True only for the single seeded Super Admin role. Cannot be created,
   * edited, or deleted through the API; implicitly holds every permission
   * rather than having stored RolePermission rows.
   */
  @Column({ type: 'boolean', default: false })
  is_system: boolean;

  /**
   * True for roles that participate in the admin-dashboard permission
   * system (Super Admin, Admin, Manager, and any custom role Super Admin
   * creates). False on the seeded customer-facing roles (premium_user,
   * user), which stay outside this module entirely.
   */
  @Column({ type: 'boolean', default: true })
  @Index('IDX_ROLE_IS_STAFF')
  is_staff: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
