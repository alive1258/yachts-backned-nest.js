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
import { Role } from './role.entity';
import { Menu } from 'src/modules/menu/entities/menu.entity';

/**
 * One grant row per (role, menu) pair. Absence of a row means all four
 * booleans are effectively false for that pair. Super Admin (Role.is_system)
 * never has rows here — its matrix is synthesized as all-true at read time.
 */
@Entity('role_permissions')
@Index('IDX_ROLE_PERMISSION_ROLE_MENU', ['role_id', 'menu_id'], {
  unique: true,
})
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'uuid' })
  menu_id: string;

  @ManyToOne(() => Menu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column({ type: 'boolean', default: false })
  can_view: boolean;

  @Column({ type: 'boolean', default: false })
  can_create: boolean;

  @Column({ type: 'boolean', default: false })
  can_edit: boolean;

  @Column({ type: 'boolean', default: false })
  can_delete: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
