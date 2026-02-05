import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetGroupConfirmInfoRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;
}

class ConfirmedUnitDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '2025-09-29' })
  date: string;

  @ApiProperty({ type: 'string', example: '09:00:00', nullable: true })
  time: string | null;
}

class ParticipantInfoDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '홍길동' })
  name: string;

  @ApiProperty({ type: 'string', example: 'hong@example.com' })
  email: string;

  @ApiProperty({ type: 'boolean', example: true, description: '확정 여부' })
  is_confirmed: boolean;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: '확정 메일 전송 여부',
  })
  is_confirmation_mail_sent: boolean;
}

export class GetGroupConfirmInfoResponseDTO {
  @ApiProperty({ type: 'number', example: 1 })
  schedule_no: number;

  @ApiProperty({ type: 'string', example: '팀 회의' })
  schedule_name: string;

  @ApiProperty({ type: 'boolean', example: true, description: '일정 확정 여부' })
  is_confirmed: boolean;

  @ApiProperty({
    type: () => ConfirmedUnitDTO,
    nullable: true,
    description: '확정된 일정 단위 (날짜/시간)',
  })
  confirmed_unit: ConfirmedUnitDTO | null;

  @ApiProperty({
    type: () => [ParticipantInfoDTO],
    description: '확정 시간에 참여한 참가자 목록',
  })
  participants: ParticipantInfoDTO[];

  @ApiProperty({
    type: () => [ParticipantInfoDTO],
    description: '확정 시간에 미참여한 참가자 목록 (해당 시간 선택 안 함)',
  })
  non_participants: ParticipantInfoDTO[];
}
