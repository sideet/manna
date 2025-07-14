import { ApiProperty } from '@nestjs/swagger';

export class GetScheduleRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  schedule_no: number;
}
