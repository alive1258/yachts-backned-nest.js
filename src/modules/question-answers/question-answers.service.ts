import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Request } from 'express';
import { QuestionAnswer } from './entities/question-answer.entity';
import {
  CreateQuestionAnswerDto,
  QuestionAnswerResponseDto,
} from './dto/create-question-answer.dto';
import { UpdateQuestionAnswerDto } from './dto/update-question-answer.dto';
import { GetQuestionAnswerDto } from './dto/get-question-answer.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
import { DataQueryService } from 'src/common/data-query/data-query.service';

@Injectable()
export class QuestionAnswersService {
  constructor(
    @InjectRepository(QuestionAnswer)
    private readonly questionAnswerRepository: Repository<QuestionAnswer>,
    private readonly dataQueryService: DataQueryService,
  ) {}

  /**
   * Create Question Answer
   */
  public async create(
    req: Request,
    createDto: CreateQuestionAnswerDto,
  ): Promise<QuestionAnswer> {
    const userId = req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    createDto.question = createDto.question.trim();

    const exists = await this.questionAnswerRepository.exists({
      where: { question: createDto.question },
    });

    if (exists) {
      throw new BadRequestException('Question already exists.');
    }

    const qa = this.questionAnswerRepository.create({
      ...createDto,
      added_by: String(userId),
    });

    return this.questionAnswerRepository.save(qa);
  }

  /**
   * Get all Question Answers (pagination + filters)
   */
  public async findAll(
    query: GetQuestionAnswerDto,
  ): Promise<IPagination<Partial<QuestionAnswerResponseDto>>> {
    return this.dataQueryService.execute<Partial<QuestionAnswerResponseDto>>({
      repository: this.questionAnswerRepository,
      alias: 'questionAnswer',
      pagination: query,
      searchableFields: ['question', 'answer'],
      filterableFields: [],
      relations: ['addedBy'],
      select: ['id', 'question', 'answer', 'created_at', 'updated_at'],
      // Without this, the join above still executes but qb.select(select)
      // overwrites the joined columns, so `addedBy` comes back empty on
      // every row — see blog.service.ts for the same pattern done correctly.
      selectRelations: ['addedBy.id', 'addedBy.name'],
    });
  }

  /**
   * Get all active Question Answers, for the public FAQ section
   */
  public async findActive(): Promise<QuestionAnswer[]> {
    return this.questionAnswerRepository.find({
      where: { is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get single Question Answer by UUID
   */
  public async findOne(id: string) {
    const qa = await this.questionAnswerRepository.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!qa) {
      throw new NotFoundException('Question Answer not found.');
    }

    return {
      id: qa.id,
      question: qa.question,
      answer: qa.answer,
      created_at: qa.created_at,
      updated_at: qa.updated_at,
      addedBy: qa.addedBy
        ? {
            id: qa.addedBy.id,
            name: qa.addedBy.name,
          }
        : undefined,
    };
  }

  /**
   * Update Question Answer
   */
  public async update(
    id: string,
    updateDto: UpdateQuestionAnswerDto,
  ): Promise<QuestionAnswer> {
    const qa = await this.questionAnswerRepository.findOne({
      where: { id },
    });

    if (!qa) {
      throw new NotFoundException('Question Answer not found.');
    }

    if (updateDto.question) {
      updateDto.question = updateDto.question.trim();

      const exists = await this.questionAnswerRepository.exists({
        where: {
          question: updateDto.question,
          id: Not(id),
        },
      });

      if (exists) {
        throw new BadRequestException('Question already exists.');
      }
    }

    Object.assign(qa, updateDto);
    return this.questionAnswerRepository.save(qa);
  }

  /**
   * Soft delete Question Answer
   */
  public async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('ID is required.');
    }

    const qa = await this.questionAnswerRepository.findOne({
      where: { id },
    });

    if (!qa) {
      throw new NotFoundException('Question Answer not found.');
    }

    const result = await this.questionAnswerRepository.softDelete(id);

    if (!result.affected) {
      throw new BadRequestException(
        'Delete failed: record might already be removed.',
      );
    }
  }
}
