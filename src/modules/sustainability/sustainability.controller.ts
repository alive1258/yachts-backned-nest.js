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
import { SustainabilityService } from './sustainability.service';
import {
  CreateSustainabilityDto,
  SustainabilityResponseDto,
} from './dto/create-sustainability.dto';
import { UpdateSustainabilityDto } from './dto/update-sustainability.dto';
import { GetSustainabilityDto } from './dto/get-sustainability.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('sustainability')
export class SustainabilityController {
  constructor(
    private readonly sustainabilityService: SustainabilityService,
  ) {}

  @ApiDoc({
    summary: 'Create Sustainability Section',
    description:
      'Creates a new sustainability section entry. Requires proper permission.',
    response: SustainabilityResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createSustainabilityDto: CreateSustainabilityDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.sustainabilityService.create(req, createSustainabilityDto, file);
  }

  @ApiDoc({
    summary: 'Get all Sustainability Section entries',
    description:
      'Retrieves all sustainability section entries. Supports pagination and filters.',
    response: SustainabilityResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetSustainabilityDto) {
    return this.sustainabilityService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get the active Sustainability Section',
    description:
      'Retrieves the currently active sustainability section for the public homepage.',
    response: SustainabilityResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.sustainabilityService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Sustainability Section entry',
    description: 'Retrieve a single sustainability section entry by UUID.',
    response: SustainabilityResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Sustainability Section entry',
    description:
      'Updates an existing sustainability section entry. Requires proper permission.',
    response: SustainabilityResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSustainabilityDto: UpdateSustainabilityDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.sustainabilityService.update(id, updateSustainabilityDto, file);
  }

  @ApiDoc({
    summary: 'Delete Sustainability Section entry',
    description:
      'Soft deletes a sustainability section entry. Requires proper permission.',
    response: SustainabilityResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('sustainability', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sustainabilityService.remove(id);
  }
}
