import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateScheduleRequestDTO {
  @ApiProperty({ description: '일정명', type: 'string' })
  name: string;

  @ApiProperty({ description: '설명', type: 'string' })
  description: string;

  @ApiProperty({ description: '지역고유번호', type: 'number', required: false })
  @IsNumber()
  @IsOptional()
  shop_region_no: number | null;

  @ApiProperty({
    description: '지역상세고유번호',
    type: 'number',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  shop_region_detail_no: number | null;

  @ApiProperty({
    description: '모임형태',
    type: 'string',
    enum: ['individual', 'common', 'coffeechat'],
  })
  type: 'individual' | 'common' | 'coffeechat';

  @ApiProperty({
    description: '모임형태',
    type: 'string',
    enum: ['offline', 'online', 'none'],
  })
  meeting_type: 'offline' | 'online' | 'none' = 'none';

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
  start_time: string;

  @ApiProperty({ description: '종료시간', type: 'string', required: false })
  @IsOptional()
  end_time: string;

  @ApiProperty({
    description: '시간단위',
    type: 'string',
    enum: ['day', 'minute', 'hour'],
  })
  time_unit: 'day' | 'minute' | 'hour';

  @ApiProperty({ description: '시간', type: 'number' })
  @IsOptional()
  time: number;
}
