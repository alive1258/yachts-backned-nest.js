import { IsIn } from 'class-validator';
import type { ChatConversationStatus } from '../entities/chat-conversation.entity';

export class UpdateConversationStatusDto {
  @IsIn(['open', 'closed'])
  status: ChatConversationStatus;
}
