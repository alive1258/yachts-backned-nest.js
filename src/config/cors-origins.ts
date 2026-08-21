import { ConfigService } from '@nestjs/config';

/**
 * Shared between the HTTP CORS setup and the Socket.IO adapter in main.ts
 * so the two never drift apart — a socket handshake and a regular API
 * request from the same frontend must be allowed by the same origin list.
 */
export function getAllowedOrigins(configService: ConfigService): string[] {
  return [
    'http://localhost:3000',
    'https://eco.doctordairytools.com',
    'https://sustainable-yacht-website.vercel.app',
    configService.getOrThrow<string>('FRONTEND_URL'),
  ];
}
