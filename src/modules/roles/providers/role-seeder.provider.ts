import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { DEFAULT_SIGNUP_ROLE_SLUG } from 'src/modules/users/providers/create-user.provider';

@Injectable()
export class RoleSeederProvider implements OnModuleInit {
  private readonly logger = new Logger(RoleSeederProvider.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.roleRepository.findOne({
      where: { slug: DEFAULT_SIGNUP_ROLE_SLUG },
    });
    if (existing) {
      return;
    }

    await this.roleRepository
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values({
        name: 'User',
        slug: DEFAULT_SIGNUP_ROLE_SLUG,
        description: 'Default role assigned to customers on signup',
        is_system: false,
        is_staff: false,
      })
      .orIgnore()
      .execute();

    this.logger.log(
      `Seeded missing default signup role "${DEFAULT_SIGNUP_ROLE_SLUG}".`,
    );
  }
}
