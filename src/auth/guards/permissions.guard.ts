import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ActiveUserData } from '../interface/active-user-data.interface';
import {
  PERMISSION_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';
import { SUPER_ADMIN_ONLY_KEY } from '../decorators/super-admin-only.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as ActiveUserData | undefined;

    if (!user) {
      throw new ForbiddenException('User not authenticated.');
    }

    // Super Admin implicitly holds every permission — no further checks.
    if (user.isSuperAdmin) {
      return true;
    }

    const superAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (superAdminOnly) {
      throw new ForbiddenException('Super Admin only.');
    }

    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) {
      // No specific permission required — authenticated is enough
      // (e.g. ownership-scoped customer self-service routes).
      return true;
    }

    const flags = user.permissions?.[required.menuKey];
    if (!flags || !flags[required.action]) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    return true;
  }
}
