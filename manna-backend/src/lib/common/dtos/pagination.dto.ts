import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CursorPaginationRequestDTO {
  @ApiProperty({
    type: 'string',
    example: 'abcdefg',
    description: '커서',
    required: false,
  })
  @IsString()
  @IsOptional()
  cursor?: string | null;

  @ApiProperty({
    type: 'number',
    example: '20',
    description: '개수',
    required: false,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  count?: number = 20;

  @ApiProperty({
    enum: ['asc', 'desc'],
    example: 'desc',
    description: '정렬기준',
    required: false,
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sort?: 'asc' | 'desc' = 'desc';
}

export class CursorPaginationResponsetDTO {
  @ApiProperty({ type: 'number', example: 12, description: '총 개수' })
  total_count: number;

  @ApiProperty({
    type: 'string',
    example: 'eyJwYWdlIjoyfQ==',
    description: '다음 페이지 커서',
    nullable: true,
  })
  next_cursor: string | null;
}
