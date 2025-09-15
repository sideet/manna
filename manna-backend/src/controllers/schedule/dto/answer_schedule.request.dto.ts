import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class AnswerScheduleRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;

  @ApiProperty({ description: '이메일', type: 'string' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '이름', type: 'string' })
  name: string;

  @ApiProperty({ description: '휴대폰번호', type: 'string' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '메모', type: 'string', required: false })
  @IsOptional()
  memo: string;

  @ApiProperty({ description: '참석 시간', type: 'array' })
  schedule_unit_nos: number[];
}
