import { IsOptional, IsUUID, Length } from 'class-validator';

/**
 * Socket payload for `message:send`. `conversationId` is required for staff
 * (which thread they're replying in) and ignored for customers — a customer
 * always writes to their own conversation, resolved server-side, so they
 * can never inject someone else's id.
 */
export class SendMessageDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @Length(1, 2000)
  body: string;
}
