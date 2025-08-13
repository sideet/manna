import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetScheduleParticipantsRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;

  @ApiProperty({ description: '커서', type: 'string', required: false })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({ description: '개수', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  count: number;

  @ApiProperty({ description: '정렬', enum: ['asc', 'desc'] })
  @IsString()
  @IsOptional()
  sort?: 'asc' | 'desc';
}
