import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuestionAnswersService } from './question-answers.service';
import {
  CreateQuestionAnswerDto,
  QuestionAnswerResponseDto,
} from './dto/create-question-answer.dto';
import { UpdateQuestionAnswerDto } from './dto/update-question-answer.dto';
import { GetQuestionAnswerDto } from './dto/get-question-answer.dto';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';
import type { Request } from 'express';

@Controller('question-answers')
export class QuestionAnswersController {
  constructor(
    private readonly questionAnswersService: QuestionAnswersService,
  ) {}

  @ApiDoc({
    summary: 'Create Question Answer',
    description: 'Creates a new Question Answer. Requires proper permission.',
    response: QuestionAnswerResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('question-answer', 'create')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Post()
  create(
    @Req() req: Request,
    @Body() createQuestionAnswerDto: CreateQuestionAnswerDto,
  ) {
    return this.questionAnswersService.create(req, createQuestionAnswerDto);
  }

  @ApiDoc({
    summary: 'Get all Question Answers',
    description:
      'Retrieves all Question Answers. Supports pagination & filters.',
    response: QuestionAnswerResponseDto,
    status: HttpStatus.OK,
  })
  @Get()
  findAll(@Query() query: GetQuestionAnswerDto) {
    return this.questionAnswersService.findAll(query);
  }

  @ApiDoc({
    summary: 'Get active Question Answers',
    description:
      'Retrieves every active Question Answer, for the public FAQ section.',
    response: QuestionAnswerResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Get('active')
  findActive() {
    return this.questionAnswersService.findActive();
  }

  @ApiDoc({
    summary: 'Get single Question Answer',
    description: 'Retrieve a single Question Answer by UUID.',
    response: QuestionAnswerResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionAnswersService.findOne(id);
  }

  @ApiDoc({
    summary: 'Update Question Answer',
    description:
      'Updates an existing Question Answer. Requires proper permission.',
    response: QuestionAnswerResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('question-answer', 'edit')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionAnswerDto: UpdateQuestionAnswerDto,
  ) {
    return this.questionAnswersService.update(id, updateQuestionAnswerDto);
  }

  @ApiDoc({
    summary: 'Delete Question Answer',
    description: 'Soft deletes a Question Answer. Requires proper permission.',
    response: QuestionAnswerResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermission('question-answer', 'delete')
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionAnswersService.remove(id);
  }
}
