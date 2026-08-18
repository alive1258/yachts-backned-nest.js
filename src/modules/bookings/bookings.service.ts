import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetBookingDto } from './dto/get-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Yacht } from 'src/modules/yachts/entities/yacht.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Yacht)
    private readonly yachtRepository: Repository<Yacht>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create a booking request for the authenticated user. Snapshots the
   * yacht's current pricing onto the booking (so later rate changes don't
   * retroactively change what a guest already booked at) and rejects
   * dates that overlap an existing pending/confirmed booking for the same
   * yacht.
   */
  async create(req: Request, dto: CreateBookingDto): Promise<Booking> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const yacht = await this.yachtRepository.findOne({
      where: { id: dto.yacht_id, is_active: true },
    });
    if (!yacht) throw new NotFoundException('Yacht not found.');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Authentication required.');

    if (dto.guests > yacht.guests) {
      throw new BadRequestException(
        `This yacht sleeps a maximum of ${yacht.guests} guests.`,
      );
    }

    const checkIn = new Date(dto.check_in);
    const checkOut = new Date(dto.check_out);
    const nights = Math.round(
      (checkOut.getTime() - checkIn.getTime()) / MS_PER_NIGHT,
    );
    if (nights < 1) {
      throw new BadRequestException('Check-out must be after check-in.');
    }

    const overlapping = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.yacht_id = :yachtId', { yachtId: yacht.id })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: ['pending', 'confirmed'],
      })
      .andWhere('booking.check_in < :checkOut', { checkOut: dto.check_out })
      .andWhere('booking.check_out > :checkIn', { checkIn: dto.check_in })
      .getExists();
    if (overlapping) {
      throw new ConflictException(
        'This yacht is already booked for part of the selected dates.',
      );
    }

    const pricePerNight = Number(yacht.price_per_night);
    const subtotalAmount = Number((pricePerNight * nights).toFixed(2));
    const depositPercentage = 30;
    const depositAmount = Number(
      ((subtotalAmount * depositPercentage) / 100).toFixed(2),
    );
    const balanceAmount = Number((subtotalAmount - depositAmount).toFixed(2));

    const booking = this.bookingRepository.create({
      yacht_id: yacht.id,
      user_id: user.id,
      check_in: dto.check_in,
      check_out: dto.check_out,
      nights,
      guests: dto.guests,
      guest_name: user.name ?? user.email,
      guest_email: user.email,
      guest_phone: user.mobile,
      message: dto.message,
      currency: yacht.currency,
      price_per_night: pricePerNight,
      subtotal_amount: subtotalAmount,
      deposit_percentage: depositPercentage,
      deposit_amount: depositAmount,
      balance_amount: balanceAmount,
      status: 'pending',
      payment_status: 'unpaid',
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * Admin listing across every booking.
   */
  async findAllAdmin(query: GetBookingDto): Promise<IPagination<Booking>> {
    return this.dataQueryService.execute<Booking>({
      repository: this.bookingRepository,
      alias: 'booking',
      pagination: query,
      searchableFields: ['guest_name', 'guest_email'],
      filterableFields: ['status', 'payment_status', 'yacht_id', 'user_id'],
      relations: ['yacht', 'user'],
      selectRelations: [
        'yacht.id',
        'yacht.name',
        'yacht.slug',
        'yacht.hero_image',
        'user.id',
        'user.name',
        'user.email',
      ],
    });
  }

  /**
   * Booking history for the authenticated user.
   */
  async findMine(req: Request, query: GetBookingDto): Promise<IPagination<Booking>> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    return this.dataQueryService.execute<Booking>({
      repository: this.bookingRepository,
      alias: 'booking',
      pagination: { ...query, filters: { ...query.filters, user_id: userId } },
      filterableFields: ['status', 'payment_status', 'user_id'],
      relations: ['yacht'],
      selectRelations: [
        'yacht.id',
        'yacht.name',
        'yacht.slug',
        'yacht.hero_image',
      ],
    });
  }

  /**
   * Single booking — owner or a staff member holding `bookings.view` (or
   * Super Admin) may read it.
   */
  async findOne(id: string, req: Request): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['yacht', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    const requester = req?.user;
    const isOwner = requester?.sub === booking.user_id;
    const isAuthorizedStaff =
      requester?.isSuperAdmin || requester?.permissions?.['bookings']?.view;

    if (!isOwner && !isAuthorizedStaff) {
      throw new ForbiddenException('You cannot view this booking.');
    }

    return booking;
  }

  /**
   * Admin status transition (confirm / cancel / complete).
   */
  async updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');

    booking.status = dto.status;
    return this.bookingRepository.save(booking);
  }
}
