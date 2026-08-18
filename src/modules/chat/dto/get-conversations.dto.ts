import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/data-query/dto/data-query.dto';
import type { ChatConversationStatus } from '../entities/chat-conversation.entity';

export class GetConversationsDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: ChatConversationStatus;
}
