import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// `is_verified` is deliberately excluded: this DTO is for self-service
// updates, and a user must never be able to flip their own verification
// status by PATCHing themselves. Admin-driven verification/role changes go
// through AdminUpdateUserDto instead.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['is_verified'] as const),
) {}
