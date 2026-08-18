import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import environmentValidation from './config/environment.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { DataQueryModule } from './common/data-query/data-query.module';
import { DatabaseExceptionFilter } from './common/errors/global.errors';
import { JwtOrApiKeyGuard } from './auth/guards/jwt-or-api-key.guard';
import { MailModule } from './modules/mail/mail.module';
import { DataResponseInterceptor } from './common/interceptors/data-response/data-response.interceptor';
import { AccessTokenStrategy, RefreshTokenStrategy } from './auth/strategies';
import { FileUploadsModule } from './common/file-uploads/file-uploads.modules';
import { VideoGallaryCategoriesModule } from './modules/video-gallary-categories/video-gallary-categories.module';
import { VideoGallariesModule } from './modules/video-gallaries/video-gallaries.module';
import { BlogCategoryModule } from './modules/blog-category/blog-category.module';
import { BlogModule } from './modules/blog/blog.module';
import { BlogDetailsModule } from './modules/blog-details/blog-details.module';
import { QuestionAnswersModule } from './modules/question-answers/question-answers.module';
import { MenuModule } from './modules/menu/menu.module';
import { RolesModule } from './modules/roles/roles.module';
import { HeroModule } from './modules/hero/hero.module';
import { AboutModule } from './modules/about/about.module';
import { ServicesModule } from './modules/services/services.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { ClientVideoReviewsModule } from './modules/client-video-reviews/client-video-reviews.module';
import { SustainabilityModule } from './modules/sustainability/sustainability.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { AboutExploreModule } from './modules/about-explore/about-explore.module';
import { AboutStatsModule } from './modules/about-stats/about-stats.module';
import { AboutStoryModule } from './modules/about-story/about-story.module';
import { SustainabilityIntroModule } from './modules/sustainability-intro/sustainability-intro.module';
import { SustainabilityPillarsModule } from './modules/sustainability-pillars/sustainability-pillars.module';
import { SustainabilityRoadmapModule } from './modules/sustainability-roadmap/sustainability-roadmap.module';
import { EventsModule } from './modules/events/events.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { InnovationConceptsModule } from './modules/innovation-concepts/innovation-concepts.module';
import { LifeAboardPhotosModule } from './modules/life-aboard-photos/life-aboard-photos.module';
import { YachtsModule } from './modules/yachts/yachts.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChatModule } from './modules/chat/chat.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 60 seconds
        limit: 20,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV ? `.env.${ENV}` : '.env',
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidation,
    }),

    // Database connection with async configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: configService.get<boolean>(
          'database.autoLoadEntities',
        ),
        synchronize: configService.get<boolean>('database.synchronize'),
        // ssl: configService.get('database.ssl'),
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),

    // JWT configure
    JwtModule.register({}),

    // Cron / Scheduler
    ScheduleModule.forRoot(),
    UsersModule,
    EmployeesModule,
    DataQueryModule,
    MailModule,
    FileUploadsModule,
    VideoGallaryCategoriesModule,
    VideoGallariesModule,
    BlogCategoryModule,
    BlogModule,
    BlogDetailsModule,
    QuestionAnswersModule,
    MenuModule,
    RolesModule,
    HeroModule,
    SustainabilityModule,
    SustainabilityIntroModule,
    SustainabilityPillarsModule,
    SustainabilityRoadmapModule,
    EventsModule,
    PortfolioModule,
    InnovationConceptsModule,
    LifeAboardPhotosModule,
    YachtsModule,
    DestinationsModule,
    AboutModule,
    AboutExploreModule,
    AboutStatsModule,
    AboutStoryModule,
    ServicesModule,
    GalleryModule,
    TestimonialsModule,
    ClientVideoReviewsModule,
    ExperiencesModule,
    BookingsModule,
    PaymentsModule,
    ChatModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    JwtOrApiKeyGuard,
    AccessTokenStrategy,
    RefreshTokenStrategy,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },

    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
  exports: [JwtOrApiKeyGuard],
})
export class AppModule {}
