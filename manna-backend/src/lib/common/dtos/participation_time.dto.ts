import { ApiProperty } from '@nestjs/swagger';
import { ScheduleUnitDTO } from './schedule_unit.dto';

export class ParticipationTimeDTO {
  @ApiProperty({
    type: 'number',
    example: 10,
    description: '참여 시간 고유번호',
  })
  no: number;

  @ApiProperty({
    type: 'number',
    example: 5,
    description: '참여자 고유번호',
    required: false,
  })
  schedule_participant_no?: number;

  @ApiProperty({
    type: 'number',
    example: 12,
    description: '일정단위 고유번호',
    required: false,
  })
  schedule_unit_no?: number;

  @ApiProperty({ type: 'boolean', example: true, description: '활성 여부' })
  enabled: boolean;

  @ApiProperty({ type: () => ScheduleUnitDTO, description: '스케줄 유닛 정보' })
  schedule_unit: ScheduleUnitDTO;
}
