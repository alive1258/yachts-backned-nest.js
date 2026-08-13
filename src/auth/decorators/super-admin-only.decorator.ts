import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_ONLY_KEY = 'superAdminOnly';

/**
 * Restricts a route to the built-in Super Admin role specifically —
 * for actions no delegated/custom role should ever be grantable
 * (managing roles themselves, provisioning new staff accounts).
 */
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_ONLY_KEY, true);
