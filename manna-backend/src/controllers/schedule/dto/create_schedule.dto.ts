import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
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
  @IsString({ message: '일정명을 확인해 주세요.' })
  @Length(2, 24, { message: '일정명은 2자에서 24자이하로 작성해 주세요.' })
  name: string;

  @ApiProperty({ description: '설명', type: 'string' })
  @IsString({ message: '설명을 확인해 주세요.' })
  @MaxLength(300, { message: '설명은 300자이하로 작성해 주세요.' })
  description: string;

  @ApiProperty({
    description: '모임형태',
    type: 'string',
    enum: ScheduleType,
  })
  @IsEnum(ScheduleType, { message: '모임형태을 확인해 주세요.' })
  type: ScheduleType = ScheduleType.INDIVIDUAL;

  @ApiProperty({
    description: '모임형태',
    type: 'string',
    enum: MeetingType,
  })
  @IsEnum(MeetingType, { message: '모임타입을 확인해 주세요.' })
  meeting_type: MeetingType = MeetingType.NONE;

  @ApiProperty({
    description: '상세 주소',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '상세 주소를 확인해 주세요.' })
  @MaxLength(150, { message: '상세 주소는 150자이하로 작성해 주세요.' })
  detail_address?: string;

  @ApiProperty({
    description: '응답자공개여부',
    type: 'boolean',
    required: false,
  })
  @IsBoolean({ message: '응답자공개여부를 확인해 주세요.' })
  is_participant_visible?: true | false = false;

  @ApiProperty({
    description: '중복참여가능여부',
    type: 'boolean',
    required: false,
  })
  @IsBoolean({ message: '중복참여가능여부를 확인해 주세요.' })
  is_duplicate_participation?: true | false = false;

  @ApiProperty({ description: '시작날짜', type: 'string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '시작날짜 YYYY-MM-DD 형식이어야 합니다.',
  })
  start_date: string;

  @ApiProperty({ description: '종료날짜', type: 'string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '종료날짜 YYYY-MM-DD 형식이어야 합니다.',
  })
  end_date: string;

  @ApiProperty({ description: '시작시간', type: 'string', required: false })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: '시작시간 HH:mm:ss 형식이어야 합니다.',
  })
  start_time: string | null;

  @ApiProperty({ description: '종료시간', type: 'string', required: false })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: '종료시간 HH:mm:ss 형식이어야 합니다.',
  })
  end_time: string | null;

  @ApiProperty({
    description: '시간단위',
    type: 'string',
    enum: TimeUnit,
  })
  @IsEnum(TimeUnit, { message: '시간단위를 확인해 주세요.' })
  time_unit: TimeUnit = TimeUnit.DAY;

  @ApiProperty({ description: '진행 시간', type: 'number', required: false })
  @ValidateIf((obj, _) => obj.time_unit === 'HOUR')
  @IsNumber()
  @Min(10, { message: '진행 시간은 10분 단위이어야 합니다.' })
  time: number;

  @ApiProperty({ description: '만료 날짜', type: 'string', required: false })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @Matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, {
    message: '만료 날짜 YYYY-MM-DD HH:mm:ss 형식이어야 합니다.',
  })
  expiry_datetime?: string | null;

  // TODO 1차 보류
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
