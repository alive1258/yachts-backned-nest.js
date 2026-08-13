import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CreateMenuDto, MenuResponseDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { GetMenuDto } from './dto/get-menu.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiDoc({
    summary: 'Create menu item',
    description: 'Creates a new sidebar menu item. Requires proper permission.',
    response: MenuResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('menu-management', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(req, createMenuDto);
  }

  @ApiDoc({
    summary: 'Get all menu items',
    description:
      'Retrieves a paginated, flat list of menu items for admin management.',
    response: MenuResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @RequirePermission('menu-management', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  findAll(@Query() query: GetMenuDto) {
    return this.menuService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get menu tree',
    description:
      'Retrieves active menu items nested under their parents, sorted for sidebar rendering.',
    response: MenuResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('tree')
  findTree() {
    return this.menuService.findTree();
  }

  @ApiDoc({
    summary: 'Get single menu item',
    description: 'Retrieve a single menu item by UUID.',
    response: MenuResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update menu item',
    description: 'Updates an existing menu item. Requires proper permission.',
    response: MenuResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('menu-management', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }

  @ApiDoc({
    summary: 'Delete menu item',
    description: 'Soft deletes a menu item. Requires proper permission.',
    response: MenuResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('menu-management', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.remove(id);
  }
}
