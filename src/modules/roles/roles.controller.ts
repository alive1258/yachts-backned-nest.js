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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { SuperAdminOnly } from 'src/auth/decorators/super-admin-only.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesService } from './roles.service';
import { CreateRoleDto, RoleResponseDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRolesDto } from './dto/get-roles.dto';
import { UpsertRolePermissionsDto } from './dto/upsert-role-permissions.dto';
import { RolePermissionMatrixRowDto } from './dto/role-permission-matrix.dto';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
@SuperAdminOnly()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiDoc({
    summary: 'Create role',
    description: 'Creates a new staff/dashboard role. Super Admin only.',
    response: RoleResponseDto,
    status: HttpStatus.OK,
  })
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @ApiDoc({
    summary: 'List roles',
    description: 'Paginated list of staff/dashboard roles. Super Admin only.',
    response: RoleResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetRolesDto) {
    return this.rolesService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get single role',
    response: RoleResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update role',
    description: 'Updates name/description. Blocked for the Super Admin role.',
    response: RoleResponseDto,
    status: HttpStatus.OK,
  })
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @ApiDoc({
    summary: 'Delete role',
    description:
      'Soft deletes a role. Blocked if it is the Super Admin role or still has users assigned.',
    status: HttpStatus.OK,
  })
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.remove(id);
  }

  @ApiDoc({
    summary: 'Get role permission matrix',
    description:
      'One row per menu item with this role\'s current View/Create/Edit/Delete grants.',
    response: RolePermissionMatrixRowDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get(':id/permissions')
  getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.getPermissionMatrix(id);
  }

  @ApiDoc({
    summary: 'Bulk-update role permission matrix',
    description:
      'Upserts the full set of per-menu grants for this role. Blocked for the Super Admin role.',
    response: RolePermissionMatrixRowDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Put(':id/permissions')
  upsertPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertRolePermissionsDto,
  ) {
    return this.rolesService.upsertPermissionMatrix(id, dto);
  }
}
