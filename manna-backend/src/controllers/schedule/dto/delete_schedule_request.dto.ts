import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteScheduleRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;
}
