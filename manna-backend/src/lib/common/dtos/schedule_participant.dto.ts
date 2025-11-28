import { ApiProperty } from '@nestjs/swagger';
import { ParticipationTimeDTO } from './participation_time.dto';

export class ScheduleParticipantDTO {
  @ApiProperty({ type: 'number', example: 1, description: '참석자 고유번호' })
  no: number;

  @ApiProperty({ type: 'number', example: 5, description: '일정 고유번호' })
  schedule_no: number;

  @ApiProperty({ type: 'string', example: '홍길동', description: '이름' })
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'hong@test.com',
    description: '이메일',
  })
  email: string;

  @ApiProperty({
    type: 'string',
    example: '01012345678',
    description: '전화번호',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    type: 'string',
    example: '회의 후 의견 전달',
    description: '메모',
    nullable: true,
  })
  memo: string | null;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: '확정 메일 전송 여부',
    nullable: true,
  })
  is_confirmation_mail_sent: boolean;

  @ApiProperty({
    type: 'string',
    example: '2025-10-21 14:32:00',
    description: '생성일시',
  })
  create_datetime: string;

  @ApiProperty({
    type: 'string',
    example: '2025-10-22 09:00:00',
    description: '수정일시',
    nullable: true,
  })
  update_datetime: string | null;

  @ApiProperty({
    type: 'string',
    example: null,
    description: '삭제일시',
    nullable: true,
  })
  delete_datetime: string | null;

  @ApiProperty({
    type: () => [ParticipationTimeDTO],
    description: '참여 시간 정보 리스트',
  })
  participation_times: ParticipationTimeDTO[];
}
