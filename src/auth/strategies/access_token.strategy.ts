import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { RolePermissionLookupProvider } from 'src/modules/roles/providers/role-permission-lookup.provider';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
    private readonly permissionLookup: RolePermissionLookupProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email?: string }): Promise<ActiveUserData> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload?.sub },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    const permissions = await this.permissionLookup.getRuntimeMatrix(user.role_id);

    return {
      sub: user.id,
      email: user.email,
      role: user.role.slug,
      isSuperAdmin: user.role.is_system,
      isStaff: user.role.is_staff,
      permissions,
    };
  }
}
