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
import { EventsService } from './events.service';
import { CreateEventDto, EventResponseDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { GetEventDto } from './dto/get-event.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiDoc({
    summary: 'Create Event',
    description: 'Creates a new event entry. Requires proper permission.',
    response: EventResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('events', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post()
  create(@Req() req: Request, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req, createEventDto);
  }

  @ApiDoc({
    summary: 'Get all Events',
    description: 'Retrieves all event entries. Supports pagination and filters.',
    response: EventResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetEventDto) {
    return this.eventsService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Events',
    description:
      'Retrieves all active events, ordered by position, for the public events page.',
    response: EventResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.eventsService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Event',
    description: 'Retrieve a single event entry by UUID.',
    response: EventResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Event',
    description: 'Updates an existing event entry. Requires proper permission.',
    response: EventResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('events', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @ApiDoc({
    summary: 'Delete Event',
    description: 'Soft deletes an event entry. Requires proper permission.',
    response: EventResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('events', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
