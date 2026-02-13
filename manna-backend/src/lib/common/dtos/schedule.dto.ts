import { ApiProperty } from '@nestjs/swagger';
import { RegionDTO, RegionDetailDTO } from './region.dto';

export class ScheduleDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '하반기 워크샵' })
  name: string;

  @ApiProperty({ type: 'string', example: '사내 팀별 워크샵' })
  description: string;

  @ApiProperty({
    type: 'string',
    example: 'INDIVIDUAL',
    enum: ['INDIVIDUAL', 'COMMON'],
  })
  type: 'INDIVIDUAL' | 'COMMON';

  @ApiProperty({
    type: 'string',
    example: 'OFFLINE',
    enum: ['OFFLINE', 'ONLINE', 'NONE'],
    description: '모임 유형',
  })
  meeting_type: 'OFFLINE' | 'ONLINE' | 'NONE';

  @ApiProperty({
    type: 'string',
    example: '서울 강남구 테헤란로 152',
    description: '상세 주소',
  })
  detail_address: string;

  @ApiProperty({
    type: 'boolean',
    example: true,
    description: '참여자 명단 공개 여부',
  })
  is_participant_visible: boolean;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: '중복 참여 허용 여부',
  })
  is_duplicate_participation: boolean;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: '일정 확정 여부',
  })
  is_confirmed: boolean;

  @ApiProperty({
    type: 'string',
    example: '2025-10-01',
    description: '시작일 (YYYY-MM-DD)',
  })
  start_date: string;

  @ApiProperty({
    type: 'string',
    example: '2025-10-03',
    description: '종료일 (YYYY-MM-DD)',
  })
  end_date: string;

  @ApiProperty({
    type: 'string',
    example: '09:00:00',
    description: '시작시간 (HH:mm:ss)',
  })
  start_time: string;

  @ApiProperty({
    type: 'string',
    example: '18:00:00',
    description: '종료시간 (HH:mm:ss)',
  })
  end_time: string;

  @ApiProperty({
    type: 'string',
    example: 'HOUR',
    enum: ['DAY', 'HOUR', 'MINUTE'],
  })
  time_unit: 'DAY' | 'HOUR' | 'MINUTE';

  @ApiProperty({ type: 'number', example: 3, description: '시간 단위 값' })
  time: number;

  @ApiProperty({ type: 'boolean', example: true })
  enabled: boolean;

  @ApiProperty({ type: 'string', example: 'ABC123' })
  code: string;

  @ApiProperty({
    type: 'string',
    example: '2025-10-03 23:59:59',
    nullable: true,
    description: '만료일시 (YYYY-MM-DD HH:mm:ss)',
  })
  expiry_datetime: string | null;

  @ApiProperty({
    type: 'string',
    example: '2025-10-01 09:00:00',
    description: '생성일시 (YYYY-MM-DD HH:mm:ss)',
  })
  create_datetime: string;

  @ApiProperty({
    type: 'string',
    example: '2025-10-02 12:00:00',
    nullable: true,
    description: '수정일시 (YYYY-MM-DD HH:mm:ss)',
  })
  update_datetime: string | null;

  @ApiProperty({
    type: 'string',
    example: null,
    nullable: true,
    description: '삭제일시 (YYYY-MM-DD HH:mm:ss)',
  })
  delete_datetime: string | null;

  @ApiProperty({
    type: 'number',
    example: 1001,
    description: '사용자 고유번호',
  })
  user_no: number;

  @ApiProperty({ type: 'number', example: 2001, description: '지역 고유번호' })
  region_no: number;

  @ApiProperty({
    type: 'number',
    example: 2101,
    description: '상세 지역 고유번호',
  })
  region_detail_no: number;

  @ApiProperty({ type: RegionDTO })
  region: RegionDTO;

  @ApiProperty({ type: RegionDetailDTO })
  region_detail: RegionDetailDTO;
}
