import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { getAllowedOrigins } from './config/cors-origins';
import { SocketIoAdapter } from './common/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.use(helmet());
  app.use(compression());

  app.setGlobalPrefix('/api');

  // Enable Version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const configService = app.get(ConfigService);

  /**
   * Swagger API documentation configuration:
   */
  const config = new DocumentBuilder()
    .setTitle('Sustainable Yachts Backend Api')
    .setDescription('Nest Sustainable Yachts Backend Api Documentation')
    .addServer('http://localhost:5000/api/v1')
    .setTermsOfService('http://localhost:5000/api/v1/terms-of-conditions')
    .setVersion('1.0.0')
    // .addTag('nest-nest-starter-api')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/swagger', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationSorter: 'alpha',
    },
    customSiteTitle: 'Sustainable Yachts Backend Api',
  });

  app.use(cookieParser());

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  // CORS Configaration
  app.enableCors({
    origin: getAllowedOrigins(configService),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  });

  const PORT = configService.get<number>('SERVER_PORT') || 5000;

  await app.listen(PORT);

  console.log(`Application is running on: ${await app.getUrl()}/api/v1`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api/v1`);
}
void bootstrap();
