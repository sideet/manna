import { ApiProperty } from '@nestjs/swagger';

export class ScheduleUnitDTO {
  @ApiProperty({
    type: 'number',
    example: 1,
    description: '스케줄 유닛 고유번호',
  })
  no: number;

  @ApiProperty({
    type: 'string',
    example: '2025-10-23',
    description: '참여 날짜(YYYY-MM-DD)',
  })
  date: string;

  @ApiProperty({
    type: 'string',
    example: '18:00:00',
    description: '참여 시간(HH:mm:ss)',
    nullable: true,
  })
  time: string | null;

  @ApiProperty({ type: 'boolean', example: true, description: '활성 여부' })
  enabled: boolean;

  @ApiProperty({ type: 'boolean', example: false, description: '확정 여부' })
  is_confirmed: boolean;

  @ApiProperty({ type: 'number', example: 5, description: '일정 고유번호' })
  schedule_no: number;
}
