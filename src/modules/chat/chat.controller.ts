import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ChatService } from './chat.service';
import { GetConversationsDto } from './dto/get-conversations.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { UpdateConversationStatusDto } from './dto/update-conversation-status.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiDoc({
    summary: 'Get my conversation',
    description:
      "Returns the authenticated customer's single support thread, creating it on first contact.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('conversations/mine')
  getMine(@Req() req: Request) {
    return this.chatService.getMyConversation(req);
  }

  @ApiDoc({
    summary: 'Get my message history',
    description: "Paginated message history for the authenticated customer's thread.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('messages/mine')
  getMyMessages(@Req() req: Request, @Query() query: GetMessagesDto) {
    return this.chatService.getMyMessages(req, query);
  }

  @ApiDoc({
    summary: 'Get all conversations',
    description:
      'Support inbox — every customer thread, sorted by most recent activity. Requires the support-chat view permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('support-chat', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get('conversations')
  getAll(@Query() query: GetConversationsDto) {
    return this.chatService.listConversationsAdmin(query);
  }

  @ApiDoc({
    summary: 'Get conversation messages',
    description:
      "Paginated message history for one conversation. Allowed for the thread's owner or any staff member.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('conversations/:id/messages')
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Query() query: GetMessagesDto,
  ) {
    return this.chatService.getConversationMessages(id, req, query);
  }

  @ApiDoc({
    summary: 'Mark conversation read',
    description:
      "Marks the other side's messages as read and clears the caller's unread counter.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Patch('conversations/:id/read')
  async markRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const conversation = await this.chatService.assertCanAccess(id, req);
    const isOwner = req.user?.sub === conversation.customer_id;
    await this.chatService.markRead(id, {
      id: req.user!.sub,
      role: isOwner ? 'customer' : 'staff',
    });
    return { success: true };
  }

  @ApiDoc({
    summary: 'Update conversation status',
    description:
      'Marks a support thread resolved or reopens it. Requires the support-chat edit permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('support-chat', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Patch('conversations/:id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationStatusDto,
  ) {
    return this.chatService.setStatus(id, dto.status);
  }
}
