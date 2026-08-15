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
import { SustainabilityIntroService } from './sustainability-intro.service';
import {
  CreateSustainabilityIntroDto,
  SustainabilityIntroResponseDto,
} from './dto/create-sustainability-intro.dto';
import { UpdateSustainabilityIntroDto } from './dto/update-sustainability-intro.dto';
import { GetSustainabilityIntroDto } from './dto/get-sustainability-intro.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('sustainability-intro')
export class SustainabilityIntroController {
  constructor(
    private readonly sustainabilityIntroService: SustainabilityIntroService,
  ) {}

  @ApiDoc({
    summary: 'Create Sustainability Intro',
    description:
      'Creates a new Sustainability Intro entry. Requires proper permission.',
    response: SustainabilityIntroResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-intro', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createSustainabilityIntroDto: CreateSustainabilityIntroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.sustainabilityIntroService.create(
      req,
      createSustainabilityIntroDto,
      file,
    );
  }

  @ApiDoc({
    summary: 'Get all Sustainability Intro entries',
    description:
      'Retrieves all Sustainability Intro entries. Supports pagination and filters.',
    response: SustainabilityIntroResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetSustainabilityIntroDto) {
    return this.sustainabilityIntroService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get the active Sustainability Intro',
    description:
      'Retrieves the currently active Sustainability Intro entry for the public sustainability page.',
    response: SustainabilityIntroResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.sustainabilityIntroService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Sustainability Intro entry',
    description: 'Retrieve a single Sustainability Intro entry by UUID.',
    response: SustainabilityIntroResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityIntroService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Sustainability Intro entry',
    description:
      'Updates an existing Sustainability Intro entry. Requires proper permission.',
    response: SustainabilityIntroResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-intro', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSustainabilityIntroDto: UpdateSustainabilityIntroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.sustainabilityIntroService.update(
      id,
      updateSustainabilityIntroDto,
      file,
    );
  }

  @ApiDoc({
    summary: 'Delete Sustainability Intro entry',
    description:
      'Soft deletes a Sustainability Intro entry. Requires proper permission.',
    response: SustainabilityIntroResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability-intro', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityIntroService.remove(id);
  }
}
