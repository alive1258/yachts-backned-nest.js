import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateQuestionAnswerDto {
  @ApiProperty({
    description: 'question of the question answer',
    example: 'Enterprise Plan',
    maxLength: 150,
  })
  @IsString({ message: 'question must be a string.' })
  @MaxLength(150, {
    message: 'question can contain a maximum of 150 characters.',
  })
  question: string;

  @ApiProperty({
    description: 'answer of the question answer     (optional)',
    example: 'Best suited for large organizations with custom needs.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'answer must be a string.' })
  @MaxLength(500, {
    message: 'answer can contain a maximum of 500 characters.',
  })
  answer?: string;
}

export class QuestionAnswerResponseDto {
  @ApiProperty({
    example: '8a3f0f7b-6d59-4db4-bdc1-2b45a9c9c5a1',
    description: 'Unique identifier for the question answer record',
  })
  id: string;

  @ApiProperty({
    example: 'Enterprise Plan',
    description: 'question of the question answer',
  })
  question: string;

  @ApiProperty({
    example: 'Best suited for large organizations with custom needs.',
    description: 'Answer of the question answer',
    required: false,
  })
  answer?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the record is active',
  })
  is_active: boolean;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Timestamp when the record was created',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Timestamp when the record was last updated',
  })
  updated_at: Date;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Timestamp when the record was soft deleted (optional)',
    required: false,
  })
  deleted_at?: Date;
}
