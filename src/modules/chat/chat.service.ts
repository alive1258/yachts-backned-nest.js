import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Request } from 'express';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage, ChatSenderRole } from './entities/chat-message.entity';
import { GetConversationsDto } from './dto/get-conversations.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

const PREVIEW_LENGTH = 140;

interface SenderContext {
  id: string;
  role: ChatSenderRole;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationRepository: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /** Every customer has exactly one thread — created lazily on first contact. */
  async getOrCreateForCustomer(customerId: string): Promise<ChatConversation> {
    const existing = await this.conversationRepository.findOne({
      where: { customer_id: customerId },
    });
    if (existing) return existing;

    return this.conversationRepository.save(
      this.conversationRepository.create({ customer_id: customerId, status: 'open' }),
    );
  }

  async getMyConversation(req: Request): Promise<ChatConversation> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');
    return this.getOrCreateForCustomer(userId);
  }

  async getMyMessages(
    req: Request,
    query: GetMessagesDto,
  ): Promise<IPagination<ChatMessage>> {
    const conversation = await this.getMyConversation(req);
    return this.paginateMessages(conversation.id, query);
  }

  /** Admin inbox — sorted by most recent activity, not creation date. */
  async listConversationsAdmin(
    query: GetConversationsDto,
  ): Promise<IPagination<ChatConversation>> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);

    const qb = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.customer', 'customer')
      .leftJoinAndSelect('conversation.assignedStaff', 'assignedStaff')
      .orderBy('conversation.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('conversation.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('conversation.status = :status', { status: query.status });
    }

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    // DataResponseInterceptor only unwraps {meta,data} at the top level of
    // the HTTP response when `links` is present too (its isPaginated check
    // requires all three) — matches the shape DataQueryService.execute()
    // returns everywhere else, so this list responds the same way every
    // other paginated endpoint in the app does.
    return {
      meta: { total, page, limit, totalPages },
      links: {
        first: `?page=1&limit=${limit}`,
        last: `?page=${totalPages}&limit=${limit}`,
        current: `?page=${page}&limit=${limit}`,
        next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : '',
        previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : '',
      },
      data,
    };
  }

  async getConversationMessages(
    conversationId: string,
    req: Request,
    query: GetMessagesDto,
  ): Promise<IPagination<ChatMessage>> {
    await this.assertCanAccess(conversationId, req);
    return this.paginateMessages(conversationId, query);
  }

  private async paginateMessages(
    conversationId: string,
    query: GetMessagesDto,
  ): Promise<IPagination<ChatMessage>> {
    return this.dataQueryService.execute<ChatMessage>({
      repository: this.messageRepository,
      alias: 'message',
      pagination: { ...query, filters: { conversation_id: conversationId } },
      filterableFields: ['conversation_id'],
      relations: ['sender'],
      selectRelations: ['sender.id', 'sender.name', 'sender.email'],
    });
  }

  /**
   * Persists a message and updates the conversation's activity summary.
   * Called from the chat gateway, which has already authorized the sender.
   */
  async createMessage(
    conversationId: string,
    sender: SenderContext,
    body: string,
  ): Promise<ChatMessage> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');

    const trimmed = body.trim();
    if (!trimmed) throw new ForbiddenException('Message cannot be empty.');

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        conversation_id: conversationId,
        sender_id: sender.id,
        sender_role: sender.role,
        body: trimmed,
      }),
    );

    const patch: Partial<ChatConversation> = {
      last_message_at: message.created_at,
      last_message_preview: trimmed.slice(0, PREVIEW_LENGTH),
      status: 'open',
    };
    if (sender.role === 'customer') {
      patch.staff_unread_count = conversation.staff_unread_count + 1;
    } else {
      patch.customer_unread_count = conversation.customer_unread_count + 1;
      if (!conversation.assigned_staff_id) {
        patch.assigned_staff_id = sender.id;
      }
    }

    await this.conversationRepository.update(conversationId, patch);

    // Selected columns only — this result goes straight into a manual
    // `server.emit()` in the gateway, which (unlike a controller's return
    // value) never passes through ClassSerializerInterceptor, so the
    // User entity's @Exclude()'d password would otherwise be serialized
    // and sent to every socket in the room.
    return this.messageRepository.findOneOrFail({
      where: { id: message.id },
      relations: ['sender'],
      select: {
        id: true,
        conversation_id: true,
        sender_id: true,
        sender_role: true,
        body: true,
        read_at: true,
        created_at: true,
        sender: { id: true, name: true, email: true },
      },
    });
  }

  /** Marks every message from the other side as read and zeroes the requester's unread counter. */
  async markRead(conversationId: string, requester: SenderContext): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');

    const otherRole: ChatSenderRole =
      requester.role === 'customer' ? 'staff' : 'customer';

    await this.messageRepository.update(
      { conversation_id: conversationId, sender_role: otherRole, read_at: IsNull() },
      { read_at: new Date() },
    );

    await this.conversationRepository.update(
      conversationId,
      requester.role === 'customer'
        ? { customer_unread_count: 0 }
        : { staff_unread_count: 0 },
    );
  }

  /** Owner (the customer) or any staff member may read a conversation. */
  async assertCanAccess(conversationId: string, req: Request): Promise<ChatConversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');

    const requester = req?.user;
    const isOwner = requester?.sub === conversation.customer_id;
    const isStaff = Boolean(requester?.isStaff || requester?.isSuperAdmin);

    if (!isOwner && !isStaff) {
      throw new ForbiddenException('You cannot view this conversation.');
    }
    return conversation;
  }

  /** Staff-only: mark a thread resolved or reopen it. */
  async setStatus(
    conversationId: string,
    status: ChatConversation['status'],
  ): Promise<ChatConversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found.');

    await this.conversationRepository.update(conversationId, { status });
    return { ...conversation, status };
  }
}
