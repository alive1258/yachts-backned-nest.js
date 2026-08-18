import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import Stripe from 'stripe';
import { Payment } from './entities/payment.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { GetPaymentDto } from './dto/get-payment.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly configService: ConfigService,
    private readonly dataQueryService: DataQueryService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('Secret_key'));
  }

  /**
   * Starts a Stripe Checkout session for a booking's deposit or balance.
   * Only the booking's owner may pay for it, and only the amount that's
   * actually currently owed (deposit while unpaid, balance once the
   * deposit has cleared).
   */
  async createCheckoutSession(
    req: Request,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const booking = await this.bookingRepository.findOne({
      where: { id: dto.booking_id },
      relations: ['yacht'],
    });
    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.user_id !== userId) {
      throw new ForbiddenException('This booking does not belong to you.');
    }

    let amount: number;
    if (dto.type === 'deposit') {
      if (booking.payment_status !== 'unpaid') {
        throw new BadRequestException('The deposit for this booking is already paid.');
      }
      amount = Number(booking.deposit_amount);
    } else {
      if (booking.payment_status !== 'deposit_paid') {
        throw new BadRequestException(
          'The balance can only be paid after the deposit has cleared.',
        );
      }
      if (Number(booking.balance_amount) <= 0) {
        throw new BadRequestException('There is no balance owed on this booking.');
      }
      amount = Number(booking.balance_amount);
    }

    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        booking_id: booking.id,
        user_id: userId,
        type: dto.type,
        amount,
        currency: booking.currency,
        status: 'pending',
      }),
    );

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const label = dto.type === 'deposit' ? 'Deposit' : 'Balance';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: booking.guest_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `${label} — ${booking.yacht.name} charter`,
              description: `${booking.check_in} to ${booking.check_out}`,
            },
          },
        },
      ],
      success_url: `${frontendUrl}/booking/confirmation?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/booking/cancelled?bookingId=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
        type: dto.type,
      },
    });

    payment.stripe_checkout_session_id = session.id;
    await this.paymentRepository.save(payment);

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL.');
    }

    return { url: session.url };
  }

  /**
   * Verifies the Stripe signature and reconciles the local Payment/Booking
   * rows against the event. Stripe is the source of truth for whether
   * money actually moved — this only ever reacts to it, never anticipates it.
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<{ received: true }> {
    const webhookSecret = this.configService.getOrThrow<string>('Webhook_secret');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }

    if (event.type === 'checkout.session.completed') {
      await this.markSessionSucceeded(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'checkout.session.expired') {
      await this.markSessionFailed((event.data.object as Stripe.Checkout.Session).id);
    }

    return { received: true };
  }

  private async markSessionSucceeded(session: Stripe.Checkout.Session): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripe_checkout_session_id: session.id },
    });
    if (!payment || payment.status === 'succeeded') return;

    payment.status = 'succeeded';
    payment.stripe_payment_intent_id =
      typeof session.payment_intent === 'string' ? session.payment_intent : undefined;

    if (payment.stripe_payment_intent_id) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(
          payment.stripe_payment_intent_id,
          { expand: ['latest_charge'] },
        );
        const charge = paymentIntent.latest_charge as Stripe.Charge | null;
        payment.receipt_url = charge?.receipt_url ?? undefined;
      } catch {
        // Receipt link is a nicety, not required for reconciling the payment.
      }
    }

    await this.paymentRepository.save(payment);

    const booking = await this.bookingRepository.findOne({
      where: { id: payment.booking_id },
    });
    if (!booking) return;

    booking.payment_status = payment.type === 'deposit' ? 'deposit_paid' : 'paid_in_full';
    if (payment.type === 'deposit' && booking.status === 'pending') {
      booking.status = 'confirmed';
    }
    await this.bookingRepository.save(booking);
  }

  /**
   * Fallback reconciliation, called by the frontend when it lands back on
   * the confirmation page. Webhooks are the source of truth, but they
   * require Stripe to be able to reach this server (a public URL, or the
   * Stripe CLI tunnel in local dev) — this lets the browser force a sync
   * against Stripe directly so the UI doesn't hang if the webhook was
   * delayed or never delivered.
   */
  async verifySession(sessionId: string, req: Request): Promise<{ status: string }> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const payment = await this.paymentRepository.findOne({
      where: { stripe_checkout_session_id: sessionId },
    });
    if (!payment) throw new NotFoundException('Payment not found for this session.');

    const isOwner = payment.user_id === userId;
    const isAuthorizedStaff =
      req.user?.isSuperAdmin || req.user?.permissions?.['payments']?.view;
    if (!isOwner && !isAuthorizedStaff) {
      throw new ForbiddenException('You cannot verify this payment.');
    }

    if (payment.status === 'succeeded') {
      return { status: payment.status };
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' || session.status === 'complete') {
      await this.markSessionSucceeded(session);
      return { status: 'succeeded' };
    }
    if (session.status === 'expired') {
      await this.markSessionFailed(session.id);
      return { status: 'failed' };
    }

    return { status: payment.status };
  }

  private async markSessionFailed(sessionId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { stripe_checkout_session_id: sessionId },
    });
    if (!payment || payment.status !== 'pending') return;

    payment.status = 'failed';
    await this.paymentRepository.save(payment);
  }

  async findAllAdmin(query: GetPaymentDto): Promise<IPagination<Payment>> {
    return this.dataQueryService.execute<Payment>({
      repository: this.paymentRepository,
      alias: 'payment',
      pagination: query,
      filterableFields: ['status', 'type', 'booking_id', 'user_id'],
      // DataQueryService only supports joining direct relations of the root
      // alias (see QueryBuilderHelper.applyRelations) — no dotted nested
      // paths — so `booking.yacht` isn't joinable here. The admin payments
      // table links out to the booking detail view for the yacht name.
      relations: ['booking', 'user'],
      selectRelations: [
        'booking.id',
        'booking.check_in',
        'booking.check_out',
        'user.id',
        'user.name',
        'user.email',
      ],
    });
  }

  async findMine(req: Request, query: GetPaymentDto): Promise<IPagination<Payment>> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    return this.dataQueryService.execute<Payment>({
      repository: this.paymentRepository,
      alias: 'payment',
      pagination: { ...query, filters: { ...query.filters, user_id: userId } },
      filterableFields: ['status', 'type', 'booking_id', 'user_id'],
      relations: ['booking'],
    });
  }

  async findByBooking(bookingId: string, req: Request): Promise<Payment[]> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found.');

    const requester = req?.user;
    const isOwner = requester?.sub === booking.user_id;
    const isAuthorizedStaff =
      requester?.isSuperAdmin || requester?.permissions?.['payments']?.view;

    if (!isOwner && !isAuthorizedStaff) {
      throw new ForbiddenException('You cannot view these payments.');
    }

    return this.paymentRepository.find({
      where: { booking_id: bookingId },
      order: { created_at: 'DESC' },
    });
  }
}
