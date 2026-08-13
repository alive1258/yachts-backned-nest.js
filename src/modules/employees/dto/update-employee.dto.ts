import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';

// Role changes go through the existing admin-only PATCH /users/:id/admin
// route, and deactivation goes through DELETE /employees/:id (soft-delete,
// same pattern as the users module) — this DTO stays scoped to the
// HR-profile fields only, deliberately omitting email/password/role_id.
export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['email', 'password', 'role_id'] as const),
) {}
