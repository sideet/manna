import { ApiProperty } from '@nestjs/swagger';
import { ScheduleDTO } from 'src/lib/common/dtos';

export class ScheduleWithParticipantDTO extends ScheduleDTO {
  @ApiProperty({ type: 'number', example: 42, description: '참여자 수' })
  participant_count: number;
}

export class GetScheduleResponseDTO {
  @ApiProperty({ type: [ScheduleWithParticipantDTO] })
  schedules: ScheduleWithParticipantDTO[];
}
