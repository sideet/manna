import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetGuestConfirmInfoRequestDTO {
  @ApiProperty({ description: '일정 코드', type: 'string' })
  @IsString()
  code: string;

  @ApiProperty({
    description: '참가자 고유번호 (개인 일정에서 특정 참가자 조회 시)',
    type: 'number',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  participant_no?: number;
}

class GuestConfirmedUnitDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '2025-09-29' })
  date: string;

  @ApiProperty({ type: 'string', example: '09:00:00', nullable: true })
  time: string | null;
}

class GuestParticipantDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '홍길동' })
  name: string;
}

class GuestConfirmedParticipantDTO extends GuestParticipantDTO {
  @ApiProperty({
    type: () => GuestConfirmedUnitDTO,
    nullable: true,
    description: '확정된 일정 단위',
  })
  confirmed_unit: GuestConfirmedUnitDTO | null;
}

export class GetGuestConfirmInfoResponseDTO {
  @ApiProperty({ type: 'number', example: 1 })
  schedule_no: number;

  @ApiProperty({ type: 'string', example: '팀 회의' })
  schedule_name: string;

  @ApiProperty({ type: 'string', example: '회의 전날까지 참여 여부 확정 부탁드립니다.' })
  schedule_description: string;

  @ApiProperty({ type: 'string', enum: ['COMMON', 'INDIVIDUAL'] })
  schedule_type: 'COMMON' | 'INDIVIDUAL';

  @ApiProperty({ type: 'boolean', example: true, description: '일정 확정 여부' })
  is_confirmed: boolean;

  @ApiProperty({
    type: 'boolean',
    example: true,
    description: '참가자 공개 여부',
  })
  is_participant_visible: boolean;

  @ApiProperty({
    type: () => GuestConfirmedUnitDTO,
    nullable: true,
    description: '확정된 일정 단위 (그룹용)',
  })
  confirmed_unit?: GuestConfirmedUnitDTO | null;

  @ApiProperty({
    type: () => [GuestParticipantDTO],
    description: '참여 참가자 목록 (is_participant_visible이 true일 때만 포함)',
    required: false,
  })
  participants?: GuestParticipantDTO[];

  @ApiProperty({
    type: () => [GuestParticipantDTO],
    description: '미참여 참가자 목록 (is_participant_visible이 true일 때만 포함)',
    required: false,
  })
  non_participants?: GuestParticipantDTO[];

  @ApiProperty({
    type: () => [GuestConfirmedParticipantDTO],
    description: '확정된 참가자 목록 (개인 일정용, is_participant_visible이 true일 때만 포함)',
    required: false,
  })
  confirmed_participants?: GuestConfirmedParticipantDTO[];

  @ApiProperty({
    type: 'string',
    nullable: true,
    description: '상세 주소',
  })
  detail_address: string | null;

  @ApiProperty({ type: 'string', example: '박목인', description: '생성자 이름' })
  creator_name: string;

  @ApiProperty({
    type: 'string',
    enum: ['OFFLINE', 'ONLINE', 'NONE'],
    description: '진행 방법',
  })
  meeting_type: 'OFFLINE' | 'ONLINE' | 'NONE';

  @ApiProperty({ type: 'string', example: 'ABCD1234', description: '초대 코드' })
  code: string;
}
