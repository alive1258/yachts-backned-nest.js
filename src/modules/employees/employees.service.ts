import { randomUUID } from 'crypto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { MailService } from 'src/modules/mail/mail.service';
import { UsersService } from 'src/modules/users/users.service';

interface PaginationQuery {
  page?: number;
  limit?: number;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly dataSource: DataSource,
    private readonly hashingProvider: HashingProvider,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  public async create(
    dto: CreateEmployeeDto,
    createdBy: string,
  ): Promise<Employee> {
    const role = await this.roleRepository.findOne({
      where: { id: dto.role_id },
    });
    if (!role) {
      throw new BadRequestException('Role does not exist.');
    }
    if (role.is_system) {
      throw new BadRequestException(
        'The Super Admin role cannot be assigned to a staff account.',
      );
    }
    if (!role.is_staff) {
      throw new BadRequestException(
        'Only staff/dashboard roles can be assigned to a staff account.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.hashingProvider.hashPassword(
        dto.password,
      );

      const user = queryRunner.manager.create(User, {
        name: dto.name,
        mobile: dto.mobile,
        email: dto.email,
        password: hashedPassword,
        role_id: role.id,
        // An admin creating this account in-app is the verification step —
        // there is no separate self-serve OTP-signup flow for staff.
        is_verified: true,
        is_active: true,
      });
      const savedUser = await queryRunner.manager.save(user);

      const employee = queryRunner.manager.create(Employee, {
        user_id: savedUser.id,
        staff_code: `EMP-${randomUUID().slice(0, 8).toUpperCase()}`,
        designation: dto.designation,
        department: dto.department,
        created_by: createdBy,
      });
      const savedEmployee = await queryRunner.manager.save(employee);

      await queryRunner.commitTransaction();

      await this.mailService.sendAccountCreatedNotice(savedUser, role.name);

      return savedEmployee;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError.code === '23505') {
          throw new BadRequestException('Email already exists.');
        }
      }

      throw new InternalServerErrorException(
        'Unable to create employee at this time.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // The frontend's EmployeeUser.role is a plain string (role slug) — flatten
  // the loaded Role relation down to that shape rather than leaking the
  // full Role entity through the response.
  private flattenRole(employee: Employee): Employee {
    if (employee.user?.role) {
      (employee.user as unknown as { role: string }).role = (
        employee.user.role as unknown as { slug: string }
      ).slug;
    }
    return employee;
  }

  public async findAll(
    query: PaginationQuery,
  ): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;

    const [data, total] = await this.employeeRepository.findAndCount({
      relations: ['user', 'user.role'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: data.map((e) => this.flattenRole(e)), total, page, limit };
  }

  public async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'user.role'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.flattenRole(employee);
  }

  public async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    Object.assign(employee, dto);

    return this.employeeRepository.save(employee);
  }

  // Deactivates the underlying user account (same soft-delete path used for
  // patient accounts) rather than duplicating deactivation logic here.
  public async remove(id: string): Promise<{ message: string }> {
    const employee = await this.findOne(id);
    return this.usersService.remove(employee.user_id);
  }

  // Reverses remove() — lets the staff account sign in again.
  public async reactivate(id: string): Promise<{ message: string }> {
    const employee = await this.findOne(id);
    return this.usersService.reactivate(employee.user_id);
  }
}
