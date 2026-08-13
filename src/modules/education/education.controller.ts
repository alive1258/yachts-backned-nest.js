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
} from '@nestjs/common';
import { EducationService } from './education.service';
import {
  CreateEducationDto,
  EducationResponseDto,
} from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { GetEducationDto } from './dto/get-education.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @ApiDoc({
    summary: 'Create Education Section',
    description:
      'Creates a new education section entry. Requires proper permission.',
    response: EducationResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('education', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createEducationDto: CreateEducationDto,
  ) {
    return this.educationService.create(req, createEducationDto);
  }

  @ApiDoc({
    summary: 'Get all Education Section entries',
    description:
      'Retrieves all education section entries. Supports pagination and filters.',
    response: EducationResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetEducationDto) {
    return this.educationService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get the active Education Section',
    description:
      'Retrieves the currently active education section for the public homepage.',
    response: EducationResponseDto,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.educationService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Education Section entry',
    description: 'Retrieve a single education section entry by UUID.',
    response: EducationResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.educationService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Education Section entry',
    description:
      'Updates an existing education section entry. Requires proper permission.',
    response: EducationResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('education', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEducationDto: UpdateEducationDto,
  ) {
    return this.educationService.update(id, updateEducationDto);
  }

  @ApiDoc({
    summary: 'Delete Education Section entry',
    description:
      'Soft deletes an education section entry. Requires proper permission.',
    response: EducationResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('education', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.educationService.remove(id);
  }
}
