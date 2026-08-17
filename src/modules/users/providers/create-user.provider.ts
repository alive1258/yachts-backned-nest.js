import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { DataSource, QueryFailedError } from 'typeorm';
// import { OtpService } from 'src/common/otp-send/otp-send.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { MailService } from 'src/modules/mail/mail.service';

export const DEFAULT_SIGNUP_ROLE_SLUG = 'user';

@Injectable()
export class CreateUserProvider {
  constructor(
    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,

    // @Inject(forwardRef(() => OtpService))
    // private readonly otpService: OtpService,
    private readonly mailService: MailService,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new user and sends OTP for verification.
   */
  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.hashingProvider.hashPassword(
        createUserDto.password,
      );

      const defaultRole = await queryRunner.manager.findOne(Role, {
        where: { slug: DEFAULT_SIGNUP_ROLE_SLUG },
      });
      if (!defaultRole) {
        throw new InternalServerErrorException(
          'Default signup role is not configured.',
        );
      }

//check email
//chek verifired
      const newUser = queryRunner.manager.create(User, {
        ...createUserDto,
        password: hashedPassword,
        role_id: defaultRole.id,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      // Send OTP (same transaction)
      await this.mailService.sendOtp(savedUser, queryRunner.manager);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Unique constraint (PostgreSQL)
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };

        if (driverError.code === '23505') {
          throw new BadRequestException('Email already exists.');
        }
      }

      console.error('Create user transaction failed:', error);
      throw new InternalServerErrorException(
        'Unable to create user at this time.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
