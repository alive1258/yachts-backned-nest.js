import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { randomBytes } from 'crypto';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { GetPrescriptionDto } from './dto/get-prescription.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';

const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';
const MEDICINE_SEARCH_MIN_LENGTH = 3;
const MEDICINE_SEARCH_MAX_RESULTS = 10;

interface RxNormCandidate {
  rxcui?: string;
  name?: string;
}

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  private generateShareToken(): string {
    return randomBytes(24).toString('hex');
  }

  /**
   * Create a new prescription
   */
  async create(
    req: Request,
    createDto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const prescription = this.prescriptionRepository.create({
      ...createDto,
      prescription_date:
        createDto.prescription_date ?? new Date().toISOString().slice(0, 10),
      share_token: this.generateShareToken(),
      added_by: String(userId),
    });

    return this.prescriptionRepository.save(prescription);
  }

  /**
   * Get all prescriptions with filters/pagination. Staff-only — this is
   * patient medical data, so (like appointments) filtering is applied via
   * a real query builder rather than the shared DataQueryService.
   */
  async findAll(query: GetPrescriptionDto): Promise<IPagination<Prescription>> {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 10, 100);

    const qb = this.prescriptionRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.appointment', 'appointment')
      .leftJoinAndSelect('prescription.addedBy', 'addedBy');

    if (query.appointment_id) {
      qb.andWhere('prescription.appointment_id = :appointmentId', {
        appointmentId: query.appointment_id,
      });
    }
    if (query.date_from) {
      qb.andWhere('prescription.prescription_date >= :dateFrom', {
        dateFrom: query.date_from,
      });
    }
    if (query.date_to) {
      qb.andWhere('prescription.prescription_date <= :dateTo', {
        dateTo: query.date_to,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(prescription.patient_name ILIKE :search OR prescription.patient_phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('prescription.prescription_date', 'DESC')
      .addOrderBy('prescription.created_at', 'DESC')
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

  /**
   * Get a single prescription by UUID — staff-only.
   */
  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['appointment', 'addedBy'],
    });

    if (!prescription) throw new NotFoundException('Prescription not found.');

    return prescription;
  }

  /**
   * Get a prescription by its public share token — no auth. The token is
   * the security boundary here (24 random bytes, effectively unguessable),
   * not the caller's identity.
   */
  async findByShareToken(token: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { share_token: token },
      relations: ['appointment', 'addedBy'],
    });

    if (!prescription) throw new NotFoundException('Prescription not found.');

    return prescription;
  }

  /**
   * Update a prescription
   */
  async update(
    id: string,
    updateDto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id);

    Object.assign(prescription, updateDto);
    return this.prescriptionRepository.save(prescription);
  }

  /**
   * Soft delete a prescription
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const result = await this.prescriptionRepository.softDelete(id);
    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }

  /**
   * Medicine name autocomplete — proxies the NIH's free, keyless RxNorm
   * API (approximateTerm). Best-effort convenience only: staff can always
   * type any medicine name manually, this just speeds that up. Dedupes by
   * rxcui since RxNorm returns one candidate per source vocabulary (the
   * same drug shows up 5-10x otherwise).
   */
  async searchMedicines(query: string): Promise<string[]> {
    const term = query?.trim();
    if (!term || term.length < MEDICINE_SEARCH_MIN_LENGTH) return [];

    try {
      const url = `${RXNORM_BASE_URL}/approximateTerm.json?term=${encodeURIComponent(term)}&maxEntries=20`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return [];

      const data = (await response.json()) as {
        approximateGroup?: { candidate?: RxNormCandidate[] };
      };
      const candidates = data.approximateGroup?.candidate ?? [];

      const seen = new Set<string>();
      const names: string[] = [];

      for (const candidate of candidates) {
        if (!candidate.name) continue;
        const key = candidate.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        names.push(candidate.name);
        if (names.length >= MEDICINE_SEARCH_MAX_RESULTS) break;
      }

      return names;
    } catch (err) {
      // Third-party lookup is a convenience, not a dependency — swallow
      // and let staff fall back to typing the name manually.
      console.warn('RxNorm medicine search failed:', err);
      return [];
    }
  }
}
