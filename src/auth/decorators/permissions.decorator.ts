import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermission';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface RequiredPermission {
  menuKey: string;
  action: PermissionAction;
}

/**
 * Requires the caller's role to have `action` granted on the menu
 * identified by `menuKey` (see Menu.key). Checked against the permission
 * matrix PermissionsGuard reads off req.user.permissions (computed by
 * AccessTokenStrategy). Super Admin bypasses this entirely.
 */
export const RequirePermission = (menuKey: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { menuKey, action } as RequiredPermission);
