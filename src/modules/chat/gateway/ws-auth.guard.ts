import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

/**
 * Connection-time auth (JWT verification) happens once, in
 * ChatGateway.handleConnection, which attaches `client.data.user`. This
 * guard just confirms that attachment exists before letting a
 * @SubscribeMessage handler run — cheap, and catches a handler firing on a
 * socket that connection auth never approved (defensive, shouldn't happen
 * since handleConnection disconnects unauthenticated sockets immediately).
 */
@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    if (!client.data?.user) {
      throw new WsException('Unauthorized');
    }
    return true;
  }
}
