import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ScheduleDTO } from 'src/lib/common/dtos';
import {
  MeetingType,
  ScheduleType,
  TimeUnit,
} from 'src/lib/common/enums/schedule.enum';

export class CreateScheduleRequestDTO {
  @ApiProperty({ description: '일정명', type: 'string' })
  name: string;

  @ApiProperty({ description: '설명', type: 'string' })
  description: string;

  @ApiProperty({ description: '지역고유번호', type: 'number', required: false })
  @IsNumber()
  @IsOptional()
  region_no: number | null;

  @ApiProperty({
    description: '지역상세고유번호',
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  region_detail_no: number | null;

  @ApiProperty({
    description: '모임형태',
    type: 'string',
    enum: ScheduleType,
  })
  @IsEnum(ScheduleType)
  type: ScheduleType = ScheduleType.INDIVIDUAL;

  @ApiProperty({
    description: '모임형태',
    type: 'string',
    enum: MeetingType,
  })
  @IsEnum(MeetingType)
  meeting_type: MeetingType = MeetingType.NONE;

  @ApiProperty({
    description: '상세 주소',
    type: 'string',
    required: false,
  })
  @IsOptional()
  detail_address?: string;

  @ApiProperty({
    description: '응답자공개여부',
    type: 'boolean',
    required: false,
  })
  is_participant_visible?: true | false = false;

  @ApiProperty({
    description: '중복참여가능여부',
    type: 'boolean',
    required: false,
  })
  is_duplicate_participation?: true | false = false;

  @ApiProperty({ description: '시작날짜', type: 'string' })
  start_date: string;

  @ApiProperty({ description: '종료날짜', type: 'string' })
  end_date: string;

  @ApiProperty({ description: '시작시간', type: 'string', required: false })
  @IsOptional()
  start_time: string | null;

  @ApiProperty({ description: '종료시간', type: 'string', required: false })
  @IsOptional()
  end_time: string | null;

  @ApiProperty({
    description: '시간단위',
    type: 'string',
    enum: TimeUnit,
  })
  @IsEnum(TimeUnit)
  time_unit: TimeUnit = TimeUnit.DAY;

  @ApiProperty({ description: '시간', type: 'number', required: false })
  @ValidateIf((obj, _) => obj.time_unit === 'HOUR')
  time: number;

  @ApiProperty({ description: '만료 시간', type: 'number', required: false })
  @IsOptional()
  expiry_time?: number | null;

  @ApiProperty({
    description: '안되는 시간 목록',
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  @IsArray()
  @IsOptional()
  blocked_date?: string[] = [];
}

export class CreateScheduleResponseDTO {
  @ApiProperty({ type: ScheduleDTO })
  schedules: ScheduleDTO;
}
