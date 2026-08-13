import { CreateUserProvider } from './providers/create-user.provider';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';

export interface RequesterContext {
  id: string;
  isSuperAdmin: boolean;
  isStaff: boolean;
}

import profileConfig from './config/profile.config';
import * as config from '@nestjs/config';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { FindOneUserByEmailProvider } from './providers/find-one-user-by-email.provider';
import { Request } from 'express';
import { GetUsersDto } from './dto/get-users.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject Repositories
     */
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    //Inject  profileConfig
    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: config.ConfigType<
      typeof profileConfig
    >,

    //inject createUserProvider
    private readonly createUserProvider: CreateUserProvider,
    private readonly hashingProvider: HashingProvider,
    //inject findOneByEmailProvider
    private readonly findOneByEmailProvider: FindOneUserByEmailProvider,
    private readonly dataQueryService: DataQueryService,
  ) {}

  //Create New user
  public async createUser(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  public async findAllUser(
    query: GetUsersDto,
  ): Promise<IPagination<Partial<User>>> {
    return this.dataQueryService.execute<Partial<User>>({
      repository: this.usersRepository,
      alias: 'user',
      pagination: query,
      searchableFields: ['email', 'mobile', 'name'],
      select: [
        'id',
        'name',
        'email',
        'mobile',
        'role_id',
        'is_verified',
        'division_id',
        'district_id',
        'upazila_id',
        'created_at',
        'updated_at',
      ],
      relations: ['role'],
    });
  }

  public async findOneById(id: string) {
    let user = undefined as User | null | undefined;
    try {
      user = await this.usersRepository.findOne({
        where: { id },
        relations: ['role'],
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `We are currently ${error} experiencing a temporary issue processing your request. Please try again later.`,
        {
          description:
            'Error connecting to the Database. Please try again later',
        },
      );
    }
    // handle the user dose not exist
    if (!user) {
      throw new BadRequestException(`The User dose not exist.`);
    }
    return user;
  }

  // Owner can read their own profile; Super Admin or any staff member can
  // read anyone's.
  public async findOneByIdForRequester(
    id: string,
    requester: RequesterContext,
  ): Promise<User> {
    const isPrivileged = requester.isSuperAdmin || requester.isStaff;
    if (id !== requester.id && !isPrivileged) {
      throw new ForbiddenException(
        'You are not allowed to view this user.',
      );
    }
    return this.findOneById(id);
  }

    public async findOneForResendOTP(id: string): Promise<User> {
    // Validate the ID
    if (!id) {
      throw new BadRequestException('You have to provide User ID.');
    }

    // Fetch user with valid relations
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'mobile', 'role_id'],
      relations: ['role'],
    });

    // Throw error if user not found
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  public async updateUserById(
    targetUserId: string,
    dto: UpdateUserDto,
    requester: RequesterContext,
  ): Promise<User> {
    // 1️⃣ Fetch user
    const user = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    //  Authorization: owner, or Super Admin/staff acting on someone else
    const isOwner = user.id === requester.id;
    const isPrivileged = requester.isSuperAdmin || requester.isStaff;

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    // Handle password securely
    if (dto.password) {
      user.password = await this.hashingProvider.hashPassword(dto.password);
      delete dto.password;
    }

    // Assign allowed fields only
    Object.assign(user, dto);

    // 5️⃣ Save and return
    return this.usersRepository.save(user);
  }

  // Admin/super_admin-only path: the only place role/is_active/is_verified
  // can be changed for a user other than themselves during OTP verification.
  public async updateUserByAdmin(
    targetUserId: string,
    dto: AdminUpdateUserDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: targetUserId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.role_id) {
      const role = await this.roleRepository.findOne({
        where: { id: dto.role_id },
      });
      if (!role) {
        throw new BadRequestException('Role does not exist.');
      }
      if (role.is_system) {
        throw new ForbiddenException(
          'The Super Admin role cannot be assigned through this route.',
        );
      }
    }

    if (dto.password) {
      user.password = await this.hashingProvider.hashPassword(dto.password);
      delete dto.password;
    }

    Object.assign(user, dto);

    return this.usersRepository.save(user);
  }

  // Find a single user by email
  public async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    // Throw error if user not found
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }

  // Internal, system-driven verification flip after a successful OTP check.
  // Deliberately narrow (not a generic update) — this is called from server
  // code with no authenticated "requester", not from an HTTP route.
  public async markVerified(id: string): Promise<void> {
    await this.usersRepository.update(id, { is_verified: true });
  }

  // Soft delete: deactivate the account and revoke its refresh token rather
  // than hard-deleting patient-adjacent data. token_version bump invalidates
  // any refresh token issued before this point.
  public async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = false;
    user.has_refresh_token = false;
    user.remember_token = undefined;
    user.token_version += 1;

    await this.usersRepository.save(user);

    return { message: 'User account deactivated.' };
  }

  // Reverses `remove()` — the account can sign in again, but must go
  // through sign-in/OTP fresh since the previous refresh token was revoked.
  public async reactivate(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = true;
    await this.usersRepository.save(user);

    return { message: 'User account reactivated.' };
  }
}
