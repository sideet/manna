import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class CancelConfirmScheduleRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '일정고유번호를 확인해 주세요.' }
  )
  schedule_no: number;

  @ApiProperty({
    description: '참가자고유번호 (개별일정인 경우 필수)',
    type: 'number',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '참가자고유번호를 확인해 주세요.' }
  )
  schedule_participant_no?: number;
}
