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
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import { SuperAdminOnly } from 'src/auth/decorators/super-admin-only.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import type { ActiveUserData } from 'src/auth/interface/active-user-data.interface';

type AuthenticatedRequest = Request & { user: ActiveUserData };

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @ApiDoc({
    summary: 'Create a staff account',
    description:
      'Creates a user plus its employee HR profile. Super Admin only — provisioning system access is not a delegable permission.',
    status: HttpStatus.OK,
  })
  @SuperAdminOnly()
  @Post()
  create(
    @Body() dto: CreateEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.employeesService.create(dto, req.user.sub);
  }

  @ApiDoc({
    summary: 'List staff accounts',
    status: HttpStatus.OK,
  })
  @RequirePermission('employees', 'view')
  @Get()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.employeesService.findAll({ page, limit });
  }

  @ApiDoc({
    summary: 'Get a staff account by id',
    status: HttpStatus.OK,
  })
  @RequirePermission('employees', 'view')
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.employeesService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update a staff HR profile',
    description: 'Designation/department only — role changes go through PATCH /users/:id/admin.',
    status: HttpStatus.OK,
  })
  @RequirePermission('employees', 'edit')
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @ApiDoc({
    summary: 'Deactivate a staff account',
    description: 'Soft-deletes the underlying user account. Super Admin only.',
    status: HttpStatus.OK,
  })
  @SuperAdminOnly()
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.employeesService.remove(id);
  }

  @ApiDoc({
    summary: 'Reactivate a staff account',
    description: 'Reverses deactivation. Super Admin only.',
    status: HttpStatus.OK,
  })
  @SuperAdminOnly()
  @Patch(':id/reactivate')
  reactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.employeesService.reactivate(id);
  }
}
