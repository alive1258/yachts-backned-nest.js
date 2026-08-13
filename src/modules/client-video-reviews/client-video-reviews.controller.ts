import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientVideoReviewsService } from './client-video-reviews.service';
import {
  CreateClientVideoReviewDto,
  ClientVideoReviewResponseDto,
} from './dto/create-client-video-review.dto';
import { UpdateClientVideoReviewDto } from './dto/update-client-video-review.dto';
import { GetClientVideoReviewDto } from './dto/get-client-video-review.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('client-video-reviews')
export class ClientVideoReviewsController {
  constructor(
    private readonly clientVideoReviewsService: ClientVideoReviewsService,
  ) {}

  @ApiDoc({
    summary: 'Create Client Video Review',
    description:
      'Creates a new client video review. Requires proper permission.',
    response: ClientVideoReviewResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('client-video-reviews', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createDto: CreateClientVideoReviewDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.clientVideoReviewsService.create(req, createDto, file);
  }

  @ApiDoc({
    summary: 'Get all Client Video Reviews',
    description:
      'Retrieves all client video reviews. Supports pagination and filters.',
    response: ClientVideoReviewResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetClientVideoReviewDto) {
    return this.clientVideoReviewsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Client Video Reviews',
    description:
      'Retrieves all active client video reviews, ordered by position, for the public homepage.',
    response: ClientVideoReviewResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.clientVideoReviewsService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Client Video Review',
    description: 'Retrieve a single client video review by UUID.',
    response: ClientVideoReviewResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientVideoReviewsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Client Video Review',
    description:
      'Updates an existing client video review. Requires proper permission.',
    response: ClientVideoReviewResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('client-video-reviews', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateClientVideoReviewDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.clientVideoReviewsService.update(id, updateDto, file);
  }

  @ApiDoc({
    summary: 'Delete Client Video Review',
    description: 'Soft deletes a client video review. Requires proper permission.',
    response: ClientVideoReviewResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('client-video-reviews', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientVideoReviewsService.remove(id);
  }
}
