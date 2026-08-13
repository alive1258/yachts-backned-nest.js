import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Request } from 'express';
import { ComplaintTemplate } from './entities/complaint-template.entity';
import { CreateComplaintTemplateDto } from './dto/create-complaint-template.dto';
import { QUICK_PICK_COMPLAINTS } from './constants/quick-pick-complaints.constant';

@Injectable()
export class ChiefComplaintsService {
  constructor(
    @InjectRepository(ComplaintTemplate)
    private readonly complaintTemplateRepository: Repository<ComplaintTemplate>,
  ) {}

  /**
   * Shared "Quick pick" list — same for every doctor.
   */
  getQuickPick(): readonly string[] {
    return QUICK_PICK_COMPLAINTS;
  }

  /**
   * The current doctor's own saved complaint shortcuts ("My Templates"),
   * most recently used first.
   */
  async findMyTemplates(req: Request): Promise<ComplaintTemplate[]> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    return this.complaintTemplateRepository.find({
      where: { added_by: String(userId) },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Save a custom complaint as a personal template. Idempotent by design —
   * this is called silently whenever a doctor types a complaint that isn't
   * already in the quick-pick list or their templates, so re-adding the
   * same name (case-insensitive) just returns the existing row instead of
   * erroring or creating a duplicate.
   */
  async createTemplate(
    req: Request,
    dto: CreateComplaintTemplateDto,
  ): Promise<ComplaintTemplate> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Complaint name is required.');

    const existing = await this.complaintTemplateRepository.findOne({
      where: { added_by: String(userId), name: ILike(name) },
    });
    if (existing) return existing;

    const template = this.complaintTemplateRepository.create({
      name,
      added_by: String(userId),
    });

    return this.complaintTemplateRepository.save(template);
  }

  /**
   * Remove one of the current doctor's own templates.
   */
  async removeTemplate(req: Request, id: string): Promise<void> {
    const userId = req?.user?.sub;
    if (!userId) throw new UnauthorizedException('Authentication required.');

    const template = await this.complaintTemplateRepository.findOne({
      where: { id },
    });
    if (!template) throw new NotFoundException('Complaint template not found.');
    if (template.added_by !== String(userId)) {
      throw new ForbiddenException('You can only remove your own templates.');
    }

    await this.complaintTemplateRepository.softDelete(id);
  }
}
