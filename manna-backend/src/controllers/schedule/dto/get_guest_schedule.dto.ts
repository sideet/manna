import { ApiProperty } from '@nestjs/swagger';
import { ScheduleDTO } from 'src/lib/common/dtos';

export class GetGuestScheduleRequestDTO {
  @ApiProperty({
    description: '일정코드',
    type: 'string',
    example: 'Q1234',
  })
  code: string;
}

export class ScheduleDetailDTO extends ScheduleDTO {
  @ApiProperty({ type: 'number', example: 42, description: '참여자 수' })
  participant_count: number;
}

export class GetGuestScheduleResponseDTO {
  @ApiProperty({ type: ScheduleDetailDTO })
  schedule: ScheduleDetailDTO;
}
