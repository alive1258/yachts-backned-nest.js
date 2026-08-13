import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import type { Request } from 'express';
import type { ActiveUserData } from 'src/auth/interface/active-user-data.interface';

type AuthenticatedRequest = Request & { user: ActiveUserData };

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiDoc({
    summary: 'Create a new user',
    description:
      'Creates a new user and returns the user data without sensitive fields.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @Post('sign-up')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiDoc({
    summary: 'Get all users',
    description: 'Retrieves all users. Returns total count and user list.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('users', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  async findAllUser(@Query() getUsersDto: GetUsersDto) {
    return this.usersService.findAllUser(getUsersDto);
  }

  @ApiDoc({
    summary: 'Get user by ID',
    description:
      'Retrieves a user by their unique ID. Callers may only view their own profile unless they are Super Admin/staff.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get(':id')
  async getUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.findOneByIdForRequester(id, {
      id: req.user.sub,
      isSuperAdmin: req.user.isSuperAdmin,
      isStaff: req.user.isStaff,
    });
  }

  @ApiDoc({
    summary: 'Update user',
    description:
      'Updates user information by ID. Callers may only update their own profile unless they are Super Admin/staff.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateUserById(id, dto, {
      id: req.user.sub,
      isSuperAdmin: req.user.isSuperAdmin,
      isStaff: req.user.isStaff,
    });
  }

  @ApiDoc({
    summary: 'Update a user by Admin',
    description:
      'Admin route for changing role/is_active/is_verified. Requires the "users" edit permission.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('users', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Patch(':id/admin')
  async updateByAdmin(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.updateUserByAdmin(id, dto);
  }

  @ApiDoc({
    summary: 'Deactivate user',
    description:
      'Soft-deletes (deactivates) a user account and revokes its refresh token.',
    status: HttpStatus.OK,
  })
  @RequirePermission('users', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
