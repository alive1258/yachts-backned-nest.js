import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import {
  Appointment,
  AppointmentSource,
  AppointmentStatus,
} from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { ChambersService } from 'src/modules/chambers/chambers.service';
import { Chamber } from 'src/modules/chambers/entities/chamber.entity';
import { estimatedTimeForSerial } from 'src/common/utils/chamber-time.util';
import { MailService } from 'src/modules/mail/mail.service';

const MAX_SERIAL_RETRY = 3;

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly chambersService: ChambersService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Resolves the active chamber scheduled for the requested date's weekday,
   * checks it isn't already full, and assigns the next serial number + ETA.
   * Runs with a small retry loop: two concurrent bookings for the same
   * chamber+date can both read the same "current count" before either
   * saves, so a unique (chamber_id, appointment_date, serial_number)
   * constraint catches the race and this retries with a fresh count rather
   * than failing the second request outright. This function itself is not
   * the retry loop — see persistWithRetry, which calls it fresh on each
   * attempt.
   */
  private async assignSlot(
    chamber: Chamber,
    appointmentDate: string,
  ): Promise<{ serial_number: number; estimated_time: string }> {
    const capacity = this.chambersService.capacityOf(chamber);

    const bookedCount = await this.appointmentRepository.count({
      where: {
        chamber_id: chamber.id,
        appointment_date: appointmentDate,
      },
    });

    const serialNumber = bookedCount + 1;
    if (serialNumber > capacity) {
      throw new BadRequestException(
        'This chamber is fully booked for the selected date. Please choose another date.',
      );
    }

    const estimatedTime = estimatedTimeForSerial(
      chamber.start_time,
      chamber.avg_minutes_per_patient,
      serialNumber,
    );

    return { serial_number: serialNumber, estimated_time: estimatedTime };
  }

  /**
   * Resolves the chamber for a booking. If chamberId is given (the
   * dashboard's chamber dropdown), that chamber is used as long as it's
   * active and actually scheduled on appointmentDate's weekday — otherwise
   * falls back to auto-resolving from the date alone (the public form's
   * flow, which has no chamber selector).
   */
  private async resolveChamber(
    appointmentDate: string,
    chamberId?: string,
  ): Promise<Chamber> {
    const requestedDate = new Date(`${appointmentDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      throw new BadRequestException('Appointment date cannot be in the past.');
    }

    const dayOfWeek = requestedDate.getDay();

    if (chamberId) {
      const chamber = await this.chambersService.findOne(chamberId);

      if (!chamber.is_active) {
        throw new BadRequestException('Selected chamber is not active.');
      }
      if (chamber.day_of_week !== dayOfWeek) {
        throw new BadRequestException(
          `${chamber.location_name} is not scheduled on the selected date's weekday.`,
        );
      }

      return chamber;
    }

    const chamber = await this.chambersService.findActiveByDayOfWeek(dayOfWeek);

    if (!chamber) {
      throw new BadRequestException(
        'No chamber is scheduled for the selected date.',
      );
    }

    return chamber;
  }

  private async persistWithRetry(
    build: () => Promise<Appointment>,
  ): Promise<Appointment> {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_SERIAL_RETRY; attempt++) {
      try {
        return await build();
      } catch (err) {
        lastError = err;
        // 23505 = Postgres unique_violation — another request took this
        // serial number between our count and our insert; retry once more.
        if ((err as { code?: string })?.code !== '23505') throw err;
      }
    }
    throw lastError;
  }

  /**
   * Public online booking — no auth required (this is the patient-facing
   * "Book an Appointment" form). Heavily throttled at the controller level.
   */
  async createPublic(dto: CreateAppointmentDto): Promise<Appointment> {
    const chamber = await this.resolveChamber(dto.appointment_date, dto.chamber_id);

    const appointment = await this.persistWithRetry(async () => {
      const { serial_number, estimated_time } = await this.assignSlot(
        chamber,
        dto.appointment_date,
      );

      const entity = this.appointmentRepository.create({
        ...dto,
        chamber_id: chamber.id,
        serial_number,
        estimated_time,
        status: AppointmentStatus.PENDING,
        source: AppointmentSource.ONLINE,
      });

      return this.appointmentRepository.save(entity);
    });

    appointment.chamber = chamber;
    await this.sendConfirmation(appointment, chamber);
    return appointment;
  }

  /**
   * Staff-created booking for a patient who called in — same slot logic,
   * but marked confirmed immediately since staff already spoke to them.
   */
  async createManual(
    req: Request,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const chamber = await this.resolveChamber(dto.appointment_date, dto.chamber_id);

    const appointment = await this.persistWithRetry(async () => {
      const { serial_number, estimated_time } = await this.assignSlot(
        chamber,
        dto.appointment_date,
      );

      const entity = this.appointmentRepository.create({
        ...dto,
        chamber_id: chamber.id,
        serial_number,
        estimated_time,
        status: AppointmentStatus.CONFIRMED,
        source: AppointmentSource.STAFF,
        created_by: String(userId),
      });

      return this.appointmentRepository.save(entity);
    });

    appointment.chamber = chamber;
    await this.sendConfirmation(appointment, chamber);
    return appointment;
  }

  private async sendConfirmation(
    appointment: Appointment,
    chamber: Chamber,
  ): Promise<void> {
    if (!appointment.email) return;

    try {
      await this.mailService.sendAppointmentConfirmation({
        email: appointment.email,
        patientName: appointment.full_name,
        status:
          appointment.status === AppointmentStatus.CONFIRMED
            ? 'Confirmed'
            : 'Pending Confirmation',
        service: appointment.service,
        appointmentDate: appointment.appointment_date,
        estimatedTime: appointment.estimated_time,
        serialNumber: appointment.serial_number,
        chamberName: chamber.location_name,
        chamberAddress: chamber.address,
        fee: chamber.fee,
      });
    } catch (err) {
      // A failed email must not fail the booking itself — the appointment
      // is already saved; log and move on.
      console.warn('Failed to send appointment confirmation email:', err);
    }
  }

  /**
   * Get all appointments with filters/pagination. Ordered by
   * appointment_date then serial_number — this reads as a day's queue,
   * which is what front-desk staff actually need, not submission order.
   */
  async findAll(
    query: GetAppointmentDto,
  ): Promise<IPagination<Appointment>> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 10, 100);

    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.chamber', 'chamber')
      .leftJoinAndSelect('appointment.createdBy', 'createdBy');

    if (query.status) {
      qb.andWhere('appointment.status = :status', { status: query.status });
    }
    if (query.source) {
      qb.andWhere('appointment.source = :source', { source: query.source });
    }
    if (query.appointment_type) {
      qb.andWhere('appointment.appointment_type = :appointmentType', {
        appointmentType: query.appointment_type,
      });
    }
    if (query.chamber_id) {
      qb.andWhere('appointment.chamber_id = :chamberId', {
        chamberId: query.chamber_id,
      });
    }
    if (query.appointment_date) {
      qb.andWhere('appointment.appointment_date = :date', {
        date: query.appointment_date,
      });
    }
    if (query.date_from) {
      qb.andWhere('appointment.appointment_date >= :dateFrom', {
        dateFrom: query.date_from,
      });
    }
    if (query.date_to) {
      qb.andWhere('appointment.appointment_date <= :dateTo', {
        dateTo: query.date_to,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(appointment.full_name ILIKE :search OR appointment.phone ILIKE :search OR appointment.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('appointment.appointment_date', 'ASC')
      .addOrderBy('appointment.serial_number', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      meta: { total, page, limit, totalPages },
      links: {
        first: `?page=1&limit=${limit}`,
        last: `?page=${totalPages}&limit=${limit}`,
        current: `?page=${page}&limit=${limit}`,
        next: page < totalPages ? `?page=${page + 1}&limit=${limit}` : '',
        previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : '',
      },
      data,
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['chamber', 'createdBy'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found.');

    return appointment;
  }

  /**
   * Update an appointment. Changing appointment_date and/or chamber_id
   * reassigns the slot — re-resolves the chamber (explicit dropdown pick or
   * date-derived) and computes a fresh serial number/ETA in that day's
   * queue.
   */
  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    const dateChanged =
      dto.appointment_date && dto.appointment_date !== appointment.appointment_date;
    const chamberChanged =
      dto.chamber_id && dto.chamber_id !== appointment.chamber_id;

    if (dateChanged || chamberChanged) {
      const targetDate = dto.appointment_date ?? appointment.appointment_date;
      const chamber = await this.resolveChamber(targetDate, dto.chamber_id);
      const { serial_number, estimated_time } = await this.assignSlot(
        chamber,
        targetDate,
      );

      appointment.chamber_id = chamber.id;
      appointment.appointment_date = targetDate;
      appointment.serial_number = serial_number;
      appointment.estimated_time = estimated_time;
    }

    const { appointment_date: _ignoredDate, chamber_id: _ignoredChamber, ...rest } = dto;
    Object.assign(appointment, rest);

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Soft delete an appointment record entirely. For the normal
   * "patient cancelled" case, prefer PATCH status=cancelled instead — this
   * is for removing a record outright (e.g. a duplicate/test entry).
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.appointmentRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
