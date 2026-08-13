import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Menu } from 'src/modules/menu/entities/menu.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { UpsertRolePermissionsDto } from './dto/upsert-role-permissions.dto';
import { RolePermissionMatrixRowDto } from './dto/role-permission-matrix.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { RolePermissionLookupProvider } from './providers/role-permission-lookup.provider';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly permissionLookup: RolePermissionLookupProvider,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const baseSlug = slugify(dto.name);
    if (!baseSlug) {
      throw new BadRequestException('Role name must contain letters or numbers.');
    }

    let slug = baseSlug;
    let suffix = 1;
    while (await this.roleRepository.exist({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}_${suffix}`;
    }

    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
      slug,
      is_system: false,
      is_staff: true,
    });
    return this.roleRepository.save(role);
  }

  async findAll(query: GetRolesDto): Promise<IPagination<Role>> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 10, 100);

    const where = query.include_non_staff ? {} : { is_staff: true };
    if (query.search) {
      Object.assign(where, { name: ILike(`%${query.search}%`) });
    }

    const [data, total] = await this.roleRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      meta: { total, page, limit, totalPages },
      links: {
        first: `?page=1&limit=${limit}`,
        last: `?page=${totalPages}&limit=${limit}`,
        current: `?page=${page}&limit=${limit}`,
        next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : '',
        previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : '',
      },
      data,
    };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found.');
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (role.is_system) {
      throw new ForbiddenException('The Super Admin role cannot be edited.');
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    if (role.is_system) {
      throw new ForbiddenException('The Super Admin role cannot be deleted.');
    }

    const assignedUsers = await this.userRepository.count({
      where: { role_id: id },
    });
    if (assignedUsers > 0) {
      throw new ConflictException(
        `Cannot delete this role — ${assignedUsers} user(s) are still assigned to it.`,
      );
    }

    await this.roleRepository.softDelete(id);
    this.permissionLookup.invalidate(id);
  }

  async getPermissionMatrix(roleId: string): Promise<RolePermissionMatrixRowDto[]> {
    const role = await this.findOne(roleId);
    const menus = await this.menuRepository.find({ order: { order: 'ASC' } });

    if (role.is_system) {
      return menus.map((menu) => ({
        menu_id: menu.id,
        menu_key: menu.key,
        menu_label: menu.label,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      }));
    }

    const grants = await this.rolePermissionRepository.find({
      where: { role_id: roleId },
    });
    const grantByMenuId = new Map(grants.map((g) => [g.menu_id, g]));

    return menus.map((menu) => {
      const grant = grantByMenuId.get(menu.id);
      return {
        menu_id: menu.id,
        menu_key: menu.key,
        menu_label: menu.label,
        can_view: grant?.can_view ?? false,
        can_create: grant?.can_create ?? false,
        can_edit: grant?.can_edit ?? false,
        can_delete: grant?.can_delete ?? false,
      };
    });
  }

  async upsertPermissionMatrix(
    roleId: string,
    dto: UpsertRolePermissionsDto,
  ): Promise<RolePermissionMatrixRowDto[]> {
    const role = await this.findOne(roleId);
    if (role.is_system) {
      throw new ForbiddenException(
        'The Super Admin role implicitly has every permission and cannot be edited.',
      );
    }

    for (const grant of dto.grants) {
      const menuExists = await this.menuRepository.exist({
        where: { id: grant.menu_id },
      });
      if (!menuExists) {
        throw new BadRequestException(`Menu ${grant.menu_id} does not exist.`);
      }

      const existing = await this.rolePermissionRepository.findOne({
        where: { role_id: roleId, menu_id: grant.menu_id },
      });

      if (existing) {
        Object.assign(existing, {
          can_view: grant.can_view,
          can_create: grant.can_create,
          can_edit: grant.can_edit,
          can_delete: grant.can_delete,
        });
        await this.rolePermissionRepository.save(existing);
      } else {
        await this.rolePermissionRepository.save(
          this.rolePermissionRepository.create({
            role_id: roleId,
            menu_id: grant.menu_id,
            can_view: grant.can_view,
            can_create: grant.can_create,
            can_edit: grant.can_edit,
            can_delete: grant.can_delete,
          }),
        );
      }
    }

    this.permissionLookup.invalidate(roleId);
    return this.getPermissionMatrix(roleId);
  }
}
