import { Module } from '@nestjs/common';
import { BlogDetailsService } from './blog-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogDetail } from './entities/blog-detail.entity';
import { BlogDetailsController } from './blog-details.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BlogDetail])],
  controllers: [BlogDetailsController],
  providers: [BlogDetailsService],
  exports: [BlogDetailsService],
})
export class BlogDetailsModule {}
