import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

const SUPER_ADMIN_ROLE_SLUG = 'super_admin';
const SUPER_ADMIN_EMAIL = 'zamirulkabir999@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Admin1234@';

@Injectable()
export class SuperAdminSeederProvider implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminSeederProvider.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingUser = await this.userRepository.findOneBy({
      email: SUPER_ADMIN_EMAIL,
    });
    if (existingUser) {
      return;
    }

    let role = await this.roleRepository.findOneBy({
      slug: SUPER_ADMIN_ROLE_SLUG,
    });
    if (!role) {
      role = await this.roleRepository.save(
        this.roleRepository.create({
          name: 'Super Admin',
          slug: SUPER_ADMIN_ROLE_SLUG,
          description: 'Built-in role with unrestricted system access',
          is_system: true,
          is_staff: true,
        }),
      );
    }

    const hashedPassword = await this.hashingProvider.hashPassword(
      SUPER_ADMIN_PASSWORD,
    );

    await this.userRepository.save(
      this.userRepository.create({
        name: 'Super Admin',
        mobile: '0000000000',
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role_id: role.id,
        is_verified: true,
        is_active: true,
      }),
    );

    this.logger.log(`Seeded Super Admin account (${SUPER_ADMIN_EMAIL}).`);
  }
}
