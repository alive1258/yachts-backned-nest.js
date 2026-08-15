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
import { InnovationConceptsService } from './innovation-concepts.service';
import {
  CreateInnovationConceptDto,
  InnovationConceptResponseDto,
} from './dto/create-innovation-concept.dto';
import { UpdateInnovationConceptDto } from './dto/update-innovation-concept.dto';
import { GetInnovationConceptDto } from './dto/get-innovation-concept.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('innovation-concepts')
export class InnovationConceptsController {
  constructor(
    private readonly innovationConceptsService: InnovationConceptsService,
  ) {}

  @ApiDoc({
    summary: 'Create Innovation Concept',
    description:
      'Creates a new Innovation Concept entry. Requires proper permission.',
    response: InnovationConceptResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('innovation-concepts', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createInnovationConceptDto: CreateInnovationConceptDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.innovationConceptsService.create(
      req,
      createInnovationConceptDto,
      file,
    );
  }

  @ApiDoc({
    summary: 'Get all Innovation Concepts',
    description:
      'Retrieves all Innovation Concept entries. Supports pagination and filters.',
    response: InnovationConceptResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetInnovationConceptDto) {
    return this.innovationConceptsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Innovation Concepts',
    description:
      'Retrieves every active Innovation Concept, ordered by position, for the public fleet page.',
    response: InnovationConceptResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.innovationConceptsService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Innovation Concept',
    description: 'Retrieve a single Innovation Concept entry by UUID.',
    response: InnovationConceptResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.innovationConceptsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Innovation Concept',
    description:
      'Updates an existing Innovation Concept entry. Requires proper permission.',
    response: InnovationConceptResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('innovation-concepts', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInnovationConceptDto: UpdateInnovationConceptDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.innovationConceptsService.update(
      id,
      updateInnovationConceptDto,
      file,
    );
  }

  @ApiDoc({
    summary: 'Delete Innovation Concept',
    description:
      'Soft deletes an Innovation Concept entry. Requires proper permission.',
    response: InnovationConceptResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('innovation-concepts', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.innovationConceptsService.remove(id);
  }
}
