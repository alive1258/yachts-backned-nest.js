import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { RolePermissionLookupProvider } from 'src/modules/roles/providers/role-permission-lookup.provider';
import { ChatService } from '../chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { WsAuthGuard } from './ws-auth.guard';

interface ChatSocketUser {
  id: string;
  role: 'customer' | 'staff';
  canReply: boolean;
}

interface SocketData {
  user: ChatSocketUser;
  /** Customers only — resolved once at connect time to avoid a DB hit per message. */
  conversationId?: string;
  recentSends: number[];
}

type ChatSocket = Socket & { data: SocketData };

const SEND_WINDOW_MS = 10_000;
const SEND_LIMIT = 8;

function extractCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = part.slice(0, separatorIndex).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }
  return undefined;
}

@WebSocketGateway({ namespace: '/chat' })
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Tracks every open socket per user, so a user with multiple tabs/devices
  // still gets events on all of them and presence only flips offline once
  // their last socket disconnects.
  private readonly socketsByUser = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly rolePermissionLookup: RolePermissionLookupProvider,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async handleConnection(client: ChatSocket): Promise<void> {
    try {
      const token = extractCookie(client.handshake.headers.cookie, 'accessToken');
      if (!token) throw new Error('Missing access token');

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });
      if (!user || !user.is_active) throw new Error('Account unavailable');

      const isStaff = Boolean(user.role.is_staff || user.role.is_system);

      if (isStaff) {
        const matrix = user.role.is_system
          ? null
          : await this.rolePermissionLookup.getRuntimeMatrix(user.role_id);
        const canView = user.role.is_system || Boolean(matrix?.['support-chat']?.view);
        if (!canView) throw new Error('Missing support-chat permission');

        client.data = {
          user: {
            id: user.id,
            role: 'staff',
            canReply: user.role.is_system || Boolean(matrix?.['support-chat']?.edit),
          },
          recentSends: [],
        };
        await client.join('staff');
      } else {
        const conversation = await this.chatService.getOrCreateForCustomer(user.id);
        client.data = {
          user: { id: user.id, role: 'customer', canReply: true },
          conversationId: conversation.id,
          recentSends: [],
        };
        await client.join(`conversation:${conversation.id}`);
      }

      this.trackSocket(client);
      if (client.data.user.role === 'customer') {
        this.server.to('staff').emit('presence:update', {
          userId: client.data.user.id,
          online: true,
        });
      }
    } catch (error) {
      this.logger.warn(`Rejected socket connection: ${(error as Error).message}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: ChatSocket): void {
    if (!client.data?.user) return;

    const userId = client.data.user.id;
    const sockets = this.socketsByUser.get(userId);
    sockets?.delete(client.id);

    if (sockets && sockets.size === 0) {
      this.socketsByUser.delete(userId);
      if (client.data.user.role === 'customer') {
        this.server.to('staff').emit('presence:update', { userId, online: false });
      }
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody('conversationId') conversationId: string,
  ): Promise<void> {
    if (client.data.user.role !== 'staff') {
      throw new WsException('Only staff can join arbitrary conversations.');
    }
    await client.join(`conversation:${conversationId}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: SendMessageDto,
  ): Promise<void> {
    const { user } = client.data;

    if (!this.checkRateLimit(client)) {
      client.emit('error', { message: 'You are sending messages too fast.' });
      return;
    }

    let conversationId: string;
    if (user.role === 'customer') {
      conversationId = client.data.conversationId!;
    } else {
      if (!user.canReply) throw new WsException('You cannot reply to conversations.');
      if (!dto.conversationId) throw new WsException('conversationId is required.');
      conversationId = dto.conversationId;
    }

    const message = await this.chatService.createMessage(
      conversationId,
      { id: user.id, role: user.role },
      dto.body,
    );

    this.server.to(`conversation:${conversationId}`).emit('message:new', message);

    // Staff not currently viewing this thread still need their inbox list
    // (last message, unread badge) to update live.
    this.server.to('staff').emit('conversation:updated', {
      conversationId,
      lastMessagePreview: message.body.slice(0, 140),
      lastMessageAt: message.created_at,
    });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('conversation:read')
  async handleMarkRead(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody('conversationId') payloadConversationId: string | undefined,
  ): Promise<void> {
    const { user } = client.data;
    const conversationId =
      user.role === 'customer' ? client.data.conversationId! : payloadConversationId;
    if (!conversationId) throw new WsException('conversationId is required.');

    await this.chatService.markRead(conversationId, { id: user.id, role: user.role });
    this.server
      .to(`conversation:${conversationId}`)
      .emit('conversation:read', { conversationId, readBy: user.role });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody('conversationId') payloadConversationId: string | undefined,
  ): void {
    this.broadcastTyping(client, payloadConversationId, true);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody('conversationId') payloadConversationId: string | undefined,
  ): void {
    this.broadcastTyping(client, payloadConversationId, false);
  }

  private broadcastTyping(
    client: ChatSocket,
    payloadConversationId: string | undefined,
    isTyping: boolean,
  ): void {
    const { user } = client.data;
    const conversationId =
      user.role === 'customer' ? client.data.conversationId! : payloadConversationId;
    if (!conversationId) return;

    client.to(`conversation:${conversationId}`).emit('typing', {
      conversationId,
      role: user.role,
      isTyping,
    });
  }

  private trackSocket(client: ChatSocket): void {
    const userId = client.data.user.id;
    const existing = this.socketsByUser.get(userId) ?? new Set<string>();
    existing.add(client.id);
    this.socketsByUser.set(userId, existing);
  }

  /** Simple fixed-window limiter: at most SEND_LIMIT messages per SEND_WINDOW_MS, per socket. */
  private checkRateLimit(client: ChatSocket): boolean {
    const now = Date.now();
    const recent = client.data.recentSends.filter((ts) => now - ts < SEND_WINDOW_MS);
    recent.push(now);
    client.data.recentSends = recent;
    return recent.length <= SEND_LIMIT;
  }
}
