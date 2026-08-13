import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BulletItemDto {
  @ApiProperty({
    description: 'Bullet point title',
    example: 'Real-time stock tracking',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Bullet point description',
    example: 'Monitor stock levels across all warehouses.',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
