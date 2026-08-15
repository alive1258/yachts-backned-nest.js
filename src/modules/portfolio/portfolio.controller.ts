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
import { PortfolioService } from './portfolio.service';
import {
  CreatePortfolioDto,
  PortfolioResponseDto,
} from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { GetPortfolioDto } from './dto/get-portfolio.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @ApiDoc({
    summary: 'Create Portfolio card',
    description:
      'Creates a new Portfolio card entry. Requires proper permission.',
    response: PortfolioResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('portfolio', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(
    @Req() req: Request,
    @Body() createPortfolioDto: CreatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.portfolioService.create(req, createPortfolioDto, file);
  }

  @ApiDoc({
    summary: 'Get all Portfolio cards',
    description:
      'Retrieves all Portfolio card entries. Supports pagination and filters.',
    response: PortfolioResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetPortfolioDto) {
    return this.portfolioService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Portfolio cards',
    description:
      'Retrieves every active Portfolio card, ordered by position, for the public portfolio page.',
    response: PortfolioResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.portfolioService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Portfolio card',
    description: 'Retrieve a single Portfolio card entry by UUID.',
    response: PortfolioResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Portfolio card',
    description:
      'Updates an existing Portfolio card entry. Requires proper permission.',
    response: PortfolioResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('portfolio', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.portfolioService.update(id, updatePortfolioDto, file);
  }

  @ApiDoc({
    summary: 'Delete Portfolio card',
    description:
      'Soft deletes a Portfolio card entry. Requires proper permission.',
    response: PortfolioResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('portfolio', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.portfolioService.remove(id);
  }
}
