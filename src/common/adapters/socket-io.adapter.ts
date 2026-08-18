import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { getAllowedOrigins } from 'src/config/cors-origins';

/**
 * @WebSocketGateway()'s own `cors` option is evaluated at class-definition
 * time, before Nest's DI container exists, so it can't read ConfigService —
 * this adapter is the standard way to give every gateway's underlying
 * socket.io server the same CORS/credentials setup the HTTP layer already
 * has in main.ts.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: getAllowedOrigins(this.configService),
      credentials: true,
    };
    return super.createIOServer(port, { ...options, cors } as ServerOptions);
  }
}
