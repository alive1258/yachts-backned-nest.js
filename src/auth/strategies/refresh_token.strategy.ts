import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { RolePermissionLookupProvider } from 'src/modules/roles/providers/role-permission-lookup.provider';

interface CustomRequest extends Request {
  cookies: Record<string, any>;
}

const tokenExtractor: JwtFromRequestFunction = (
  req: CustomRequest,
): string | null => {
  if (!req) return null;

  // Type-safe cookie extraction
  const cookieToken = req.cookies?.refreshToken as string | undefined;
  if (typeof cookieToken === 'string') return cookieToken;

  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource, // TypeORM DataSource
    private readonly permissionLookup: RolePermissionLookupProvider,
  ) {
    super({
      jwtFromRequest: tokenExtractor,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // needed to access request in validate()
      ignoreExpiration: false,
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; email?: string },
  ): Promise<ActiveUserData> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const refreshToken = tokenExtractor(req);
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const userRepository = this.dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
      select: {
        id: true,
        email: true,
        remember_token: true,
        has_refresh_token: true,
        role_id: true,
        role: { id: true, slug: true, is_system: true, is_staff: true },
      },
    });

    if (!user || !user.has_refresh_token || !user.remember_token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.remember_token);

    if (!isValid) {
      throw new UnauthorizedException('Refresh token invalid');
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
