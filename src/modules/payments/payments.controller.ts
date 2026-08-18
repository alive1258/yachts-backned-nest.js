import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { GetPaymentDto } from './dto/get-payment.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiDoc({
    summary: 'Create Checkout Session',
    description:
      "Starts a Stripe Checkout session for a booking's deposit or balance. Returns the URL to redirect the browser to.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Throttle({ default: { limit: 20, ttl: 180 } })
  @Post('checkout-session')
  createCheckoutSession(@Req() req: Request, @Body() dto: CreateCheckoutSessionDto) {
    return this.paymentsService.createCheckoutSession(req, dto);
  }

  @ApiDoc({
    summary: 'Stripe Webhook',
    description:
      'Receives Stripe checkout/payment events and reconciles local Payment/Booking records. Called by Stripe, not the frontend.',
    status: HttpStatus.OK,
  })
  @Post('webhook')
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody as Buffer, signature);
  }

  @ApiDoc({
    summary: 'Verify Checkout Session',
    description:
      "Force-syncs a Payment/Booking against Stripe's own record of a Checkout Session. Fallback for when the webhook hasn't landed yet (or can't reach this server, e.g. local dev).",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('verify-session')
  verifySession(@Query('session_id') sessionId: string, @Req() req: Request) {
    return this.paymentsService.verifySession(sessionId, req);
  }

  @ApiDoc({
    summary: 'Get my Payments',
    description: "Retrieves the authenticated user's own payment history.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('mine')
  findMine(@Req() req: Request, @Query() query: GetPaymentDto) {
    return this.paymentsService.findMine(req, query);
  }

  @ApiDoc({
    summary: 'Get Payments for a Booking',
    description:
      "Retrieves every payment for one booking. Allowed for the booking's owner, or staff holding the payments.view permission.",
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOrApiKeyGuard)
  @Get('booking/:bookingId')
  findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Req() req: Request,
  ) {
    return this.paymentsService.findByBooking(bookingId, req);
  }

  @ApiDoc({
    summary: 'Get all Payments',
    description:
      'Retrieves every payment across all customers. Requires proper permission.',
    status: HttpStatus.OK,
  })
  @RequirePermission('payments', 'view')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  findAll(@Query() query: GetPaymentDto) {
    return this.paymentsService.findAllAdmin(query);
  }
}
