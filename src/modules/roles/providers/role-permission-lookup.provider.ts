import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { Menu } from 'src/modules/menu/entities/menu.entity';

export interface MenuActionFlags {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type PermissionMatrix = Record<string, MenuActionFlags>;

const CACHE_TTL_MS = 45_000;

interface CacheEntry {
  matrix: PermissionMatrix;
  expiresAt: number;
}

/**
 * Single source of truth for "what can this role do, per menu key" —
 * consumed by AccessTokenStrategy (attaches the matrix to req.user on
 * every authenticated request) and by RolesService (for the admin
 * permission-matrix editor, which bypasses the cache since it needs
 * per-menu label/id detail, not just the compact runtime shape).
 *
 * Cached per role_id (not per-user) with a short TTL, since permissions
 * are identical for every user sharing a role. RolesService invalidates
 * the affected role's entry immediately after a permission-matrix save,
 * so grant changes take effect on the next request rather than waiting
 * out the TTL.
 */
@Injectable()
export class RolePermissionLookupProvider {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  invalidate(roleId: string): void {
    this.cache.delete(roleId);
  }

  async getRuntimeMatrix(roleId: string): Promise<PermissionMatrix> {
    const cached = this.cache.get(roleId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.matrix;
    }

    const matrix = await this.computeMatrix(roleId);
    this.cache.set(roleId, { matrix, expiresAt: Date.now() + CACHE_TTL_MS });
    return matrix;
  }

  private async computeMatrix(roleId: string): Promise<PermissionMatrix> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) return {};

    const menus = await this.menuRepository.find();

    if (role.is_system) {
      const matrix: PermissionMatrix = {};
      for (const menu of menus) {
        matrix[menu.key] = { view: true, create: true, edit: true, delete: true };
      }
      return matrix;
    }

    const grants = await this.rolePermissionRepository.find({
      where: { role_id: roleId },
      relations: ['menu'],
    });

    const matrix: PermissionMatrix = {};
    for (const menu of menus) {
      matrix[menu.key] = { view: false, create: false, edit: false, delete: false };
    }
    for (const grant of grants) {
      if (!grant.menu) continue;
      matrix[grant.menu.key] = {
        view: grant.can_view,
        create: grant.can_create,
        edit: grant.can_edit,
        delete: grant.can_delete,
      };
    }
    return matrix;
  }
}
