import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { GetMenuDto } from './dto/get-menu.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { defaultMenus } from './data/default-menus';

export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[];
}

@Injectable()
export class MenuService implements OnModuleInit {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Syncs the default sidebar structure on every boot — inserts any key
   * from defaultMenus that isn't in the table yet (e.g. a module added
   * after the table was first seeded), but never touches a key that
   * already exists, so admin edits/deletions are never overwritten.
   */
  async onModuleInit(): Promise<void> {
    const existingKeys = new Set(
      (await this.menuRepository.find({ select: ['key'] })).map((m) => m.key),
    );

    for (const item of defaultMenus) {
      const itemKey = item.key ?? item.label.toLowerCase().replace(/\s+/g, '-');

      let parent = itemKey && existingKeys.has(itemKey)
        ? await this.menuRepository.findOne({ where: { key: itemKey } })
        : null;

      if (!parent) {
        parent = await this.menuRepository.save(
          this.menuRepository.create({
            label: item.label,
            href: item.href,
            icon: item.icon,
            key: itemKey,
            order: item.order,
            is_active: item.is_active,
          }),
        );
        existingKeys.add(itemKey);
      }

      if (!item.children?.length) continue;

      for (const child of item.children) {
        const childKey =
          child.key ?? child.label.toLowerCase().replace(/\s+/g, '-');
        if (existingKeys.has(childKey)) continue;

        await this.menuRepository.save(
          this.menuRepository.create({
            label: child.label,
            href: child.href,
            icon: child.icon,
            key: childKey,
            order: child.order,
            is_active: child.is_active,
            parent_id: parent.id,
          }),
        );
        existingKeys.add(childKey);
      }
    }
  }

  /**
   * Create a new menu item
   */
  async create(req: Request, createMenuDto: CreateMenuDto): Promise<Menu> {
    if (createMenuDto.parent_id) {
      await this.findOne(createMenuDto.parent_id);
    }

    const userId = req?.user?.sub;
    const newMenu = this.menuRepository.create({
      ...createMenuDto,
      added_by: userId ? String(userId) : undefined,
    });

    return this.menuRepository.save(newMenu);
  }

  /**
   * Get a paginated, flat list of menu items for admin management
   */
  async findAll(query: GetMenuDto): Promise<IPagination<Partial<Menu>>> {
    return this.dataQueryService.execute<Partial<Menu>>({
      repository: this.menuRepository,
      alias: 'menu',
      pagination: query,
      searchableFields: ['label', 'href'],
      filterableFields: ['parent_id', 'is_active'],
      relations: ['parent'],
    });
  }

  /**
   * Active menu items nested under their parents, sorted for direct
   * sidebar rendering. Read-only and unauthenticated — labels/hrefs carry
   * no secrets; per-role visibility is enforced by the frontend via each
   * menu's `key` against the caller's permission matrix, and independently
   * by the backend on every route an href points to.
   */
  async findTree(): Promise<MenuTreeNode[]> {
    const menus = await this.menuRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
    });

    const byId = new Map<string, MenuTreeNode>(
      menus.map((menu) => [menu.id, { ...menu, children: [] }]),
    );
    const roots: MenuTreeNode[] = [];

    byId.forEach((node) => {
      const parent = node.parent_id ? byId.get(node.parent_id) : undefined;
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Get a single menu item by UUID
   */
  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!menu) throw new NotFoundException('Menu item not found.');

    return menu;
  }

  /**
   * Update a menu item
   */
  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    if (updateMenuDto.parent_id) {
      if (updateMenuDto.parent_id === id) {
        throw new BadRequestException(
          'A menu item cannot be its own parent.',
        );
      }
      await this.findOne(updateMenuDto.parent_id);
    }

    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  /**
   * Soft delete a menu item
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const childCount = await this.menuRepository.count({
      where: { parent_id: id },
    });
    if (childCount > 0) {
      throw new BadRequestException(
        "Remove or reassign this menu item's children before deleting it.",
      );
    }

    const result = await this.menuRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
