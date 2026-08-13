import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { SignInProvider } from './providers/sign-in.provider';
import { RefreshTokensProvider } from './providers/refresh-tokens.provider';
import { VerifyOTPProvider } from './providers/veryfy-otp.provider';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/modules/mail/mail.service';
import { HashingProvider } from './providers/hashing.provider';
import { UserOTPDto } from './dto/user-otp.dto';
import { OtpResponse } from './response';
import { Request } from 'express';
import { AdminSignInProvider } from './providers/admin-sign-in.provider';
import { RolePermissionLookupProvider } from 'src/modules/roles/providers/role-permission-lookup.provider';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    /**
     * Inject SigInProvider
     */
    private readonly signInProvider: SignInProvider,

    // AdminSignInProvider
    private readonly adminSignInProvider: AdminSignInProvider,
    /**
     * Inject RefreshTokensProvider
     */
    private readonly refreshTokensProvider: RefreshTokensProvider,
    /**
     * Inject verifyOTPProvider
     */
    private readonly verifyOTPProvider: VerifyOTPProvider,
    /**
     * Inject usersService
     */
    private readonly usersService: UsersService,
    /**
     * Inject otpService
     */

    private readonly mailService: MailService,

    // Inject hashingPassword
    private readonly hashingProvider: HashingProvider,

    private readonly permissionLookup: RolePermissionLookupProvider,
  ) {}
  
  public async signIn(signInDto: SignInDto) {
    return await this.signInProvider.signIn(signInDto);
  }

  public async adminSignIn(signInDto: SignInDto) {
    return await this.adminSignInProvider.adminSignIn(signInDto);
  }

  public async refreshTokens(refreshToken: string) {
    return await this.refreshTokensProvider.refreshTokens(refreshToken);
  }

  public async verifyOTP(userOTPDto: UserOTPDto) {
    return await this.verifyOTPProvider.verifyOTP(userOTPDto);
  }

  public async resendOTP(
    email: string,
    expireTime: number = 5 * 60 * 1000,
  ): Promise<OtpResponse> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new BadRequestException('User not found.');
    if (user.is_verified)
      throw new BadRequestException('User is already verified.');

    await this.mailService.resendOtp(user, expireTime);

    return { message: 'OTP has been resent successfully.' };
  }

  public async getMe(req: Request) {
    const user_id = req?.user?.sub;

    if (!user_id) {
      throw new BadRequestException('You have to Sign in.');
    }

    const user = await this.usersService.findOneForResendOTP(user_id);
    const permissions = await this.permissionLookup.getRuntimeMatrix(user.role_id);
    const role = user.role;

    return {
      // `role` normalized to its slug here to match the string shape every
      // other endpoint (verify-otp, employees list, etc.) returns for it —
      // the richer object lives in the sibling `role` field below.
      user: { ...user, role: role.slug },
      role: {
        slug: role.slug,
        name: role.name,
        isSuperAdmin: role.is_system,
        isStaff: role.is_staff,
      },
      permissions,
    };
  }

  // forget password
  public async forgetPassword(
    email: string,
    expireTime: number = 5 * 60 * 1000,
  ): Promise<OtpResponse> {
    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    // Find user
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found. Please check the email.');
    }

    // Resend OTP with expire time
    await this.mailService.resendOtp(user, expireTime);

    return {
      message: 'OTP has been sent to your email successfully.',
    };
  }

  public async resendForgetPasswordOtp(
    userId: string,
    email: string,
    expireTime: number = 5 * 60 * 1000, // default 5 minutes
  ): Promise<OtpResponse> {
    // Validate user
    const user = await this.usersService.findOneForResendOTP(userId);
    if (!user || user.email !== email) {
      throw new BadRequestException('User not found or email mismatch.');
    }

    // Send OTP via mail service
    await this.mailService.resendOtp(user, expireTime);

    return { message: 'OTP has been resent successfully.' };
  }

  /**
   * Clean up expired refresh tokens (call this from cron job)
   */
}
