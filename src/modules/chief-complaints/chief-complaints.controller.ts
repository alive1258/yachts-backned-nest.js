import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ChiefComplaintsService } from './chief-complaints.service';
import {
  ComplaintTemplateResponseDto,
  CreateComplaintTemplateDto,
} from './dto/create-complaint-template.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

/**
 * Backs the "Add Chief Complaint" modal on the prescription form. Gated by
 * the existing `prescriptions` permission resource rather than a new menu
 * entry — this data has no purpose outside writing a prescription.
 */
@Controller('chief-complaints')
export class ChiefComplaintsController {
  constructor(private readonly chiefComplaintsService: ChiefComplaintsService) {}

  @ApiDoc({
    summary: 'Get quick-pick chief complaints',
    description: 'Staff-only — the shared, curated complaint shortcut list.',
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get('quick-pick')
  getQuickPick() {
    return this.chiefComplaintsService.getQuickPick();
  }

  @ApiDoc({
    summary: 'Get my complaint templates',
    description:
      "Staff-only — the current doctor's own saved complaint shortcuts.",
    response: ComplaintTemplateResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get('my-templates')
  findMyTemplates(@Req() req: Request) {
    return this.chiefComplaintsService.findMyTemplates(req);
  }

  @ApiDoc({
    summary: 'Save a complaint template',
    description:
      'Staff-only — saves a custom complaint for reuse. Idempotent: re-adding the same name (case-insensitive) returns the existing template.',
    response: ComplaintTemplateResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 30, ttl: 180 } })
  @Post('my-templates')
  createTemplate(@Req() req: Request, @Body() dto: CreateComplaintTemplateDto) {
    return this.chiefComplaintsService.createTemplate(req, dto);
  }

  @ApiDoc({
    summary: 'Delete a complaint template',
    description: "Staff-only — soft deletes one of the caller's own templates.",
    status: HttpStatus.OK,
  })
  @RequirePermission('prescriptions', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Throttle({ default: { limit: 30, ttl: 180 } })
  @Delete('my-templates/:id')
  removeTemplate(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.chiefComplaintsService.removeTemplate(req, id);
  }
}
