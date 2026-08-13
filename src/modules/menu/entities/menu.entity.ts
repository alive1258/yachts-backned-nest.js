import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('menus')
@Index('IDX_MENU_LABEL', ['label'])
export class Menu {
  /**
   * Primary key UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Sidebar label shown to the user
   */
  @Column({ type: 'varchar', length: 100 })
  label: string;

  /**
   * Route this item links to (omitted for a parent/dropdown-only item)
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  href?: string;

  /**
   * Lucide icon name, resolved to a component on the frontend
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  /**
   * Stable machine key used by @RequirePermission(key, action) decorators
   * and as the target of RolePermission grants. Independent of `label` so
   * relabeling a menu never breaks permission wiring.
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  /**
   * Sort order among siblings, ascending
   */
  @Column({ type: 'int', default: 0 })
  order: number;

  /**
   * Whether the item currently renders in the sidebar
   */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * Parent menu UUID for nested/dropdown groups; null for top-level items
   */
  @Column({ type: 'uuid', nullable: true })
  parent_id?: string;

  @ManyToOne(() => Menu, (menu) => menu.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children?: Menu[];

  /**
   * User who added this entry. Nullable because the default sidebar
   * structure is seeded by the system on first boot, with no request user.
   */
  @Column({ type: 'bigint', nullable: true })
  added_by?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'added_by' })
  addedBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
