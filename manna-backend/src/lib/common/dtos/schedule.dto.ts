import { ApiProperty } from '@nestjs/swagger';
import { Schedule_participants, Schedules } from '@prisma/client';
import { convertDate, convertDateTime } from 'src/lib/common/prototypes/date';

class schedule_units {
  [date: string]: {
    no: number;
    time: string;
    enabled: boolean;
    date: string;
    schedule_no: number;
  }[];
}

export class ScheduleParticipantDTO {
  @ApiProperty({ description: '응답자고유번호', type: 'number' })
  no: number;
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  schedule_no: number;
  @ApiProperty({ description: '응답자이름', type: 'string' })
  name: string;
  @ApiProperty({ description: '이메일', type: 'string' })
  email: string;
  @ApiProperty({ description: '전화번호', type: 'string' })
  phone: string;
  @ApiProperty({ description: '메모', type: 'string' })
  memo: string;
  @ApiProperty({ description: '생성일시', type: 'string' })
  create_datetime: Date;
  @ApiProperty({ description: '수정일시', type: 'string' })
  update_datetime: Date;
  @ApiProperty({ description: '삭제일시', type: 'string' })
  delete_datetime: Date;
}
export class ScheduleDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  schedule_no: number;
  @ApiProperty({ description: '일정명', type: 'string' })
  name: string;
  @ApiProperty({ description: '일정설명', type: 'string' })
  description?: string | null;
  @ApiProperty({ description: '모임형태', type: 'string', enum: ['individual', 'common'] })
  type: string;
  @ApiProperty({ description: '응답자공개여부', type: 'boolean' })
  is_participant_visible?: boolean;
  @ApiProperty({ description: '중복참여가능여부', type: 'boolean' })
  is_duplicate_participation?: boolean;
  @ApiProperty({ description: '시작날짜', type: 'string' })
  start_date: Date | string;
  @ApiProperty({ description: '종료날짜', type: 'string' })
  end_date: Date | string;
  @ApiProperty({ description: '시간단위', type: 'string', enum: ['day', 'minute', 'hour'] })
  time_unit: string;
  @ApiProperty({ description: '시간', type: 'number' })
  time?: number | null;
  @ApiProperty({ description: '사용여부', type: 'boolean' })
  enabled?: boolean;
  @ApiProperty({ description: '코드', type: 'string' })
  code?: string | null;
  @ApiProperty({ description: '생성일시', type: 'string' })
  create_datetime?: Date | string;
  @ApiProperty({ description: '수정일시', type: 'string' })
  update_datetime?: Date | string;
  @ApiProperty({ description: '삭제일시', type: 'string' })
  delete_datetime?: Date | string | null;
  @ApiProperty({ description: '일정단위', type: 'string' })
  schedule_units: {
    [date: string]: {
      no: number;
      time: string;
      enabled: boolean;
      date: string;
      schedule_no: number;
    }[];
  };
  @ApiProperty({ description: '일정참여자', type: [ScheduleParticipantDTO] })
  schedule_participants: {}[];

  constructor(
    schedule: Schedules & {
      schedule_units: schedule_units;
    } & { schedule_participants?: Schedule_participants[] }
  ) {
    this.schedule_no = schedule.no;
    this.name = schedule.name;
    this.description = schedule.description;
    this.type = schedule.type;
    this.is_duplicate_participation = schedule.is_duplicate_participation;
    this.is_participant_visible = schedule.is_participant_visible;
    this.start_date = convertDate(schedule.start_date);
    this.end_date = convertDate(schedule.end_date);
    this.time_unit = schedule.time_unit;
    this.time = schedule.time;
    this.code = schedule.code;
    this.enabled = schedule.enabled;
    this.create_datetime = convertDateTime(schedule.create_datetime);
    this.update_datetime = convertDateTime(schedule.update_datetime);
    this.schedule_units = { ...schedule.schedule_units };
    this.schedule_participants = schedule.schedule_participants;
  }
}

export class SchedulesDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  schedule_no: number;
  @ApiProperty({ description: '일정명', type: 'string' })
  name: string;
  @ApiProperty({ description: '일정설명', type: 'string' })
  description?: string | null;
  @ApiProperty({ description: '모임형태', type: 'string', enum: ['individual', 'common'] })
  type: string;
  @ApiProperty({ description: '응답자공개여부', type: 'boolean', required: false })
  is_participant_visible?: boolean;
  @ApiProperty({ description: '중복참여가능여부', type: 'boolean', required: false })
  is_duplicate_participation?: boolean;
  @ApiProperty({ description: '시작날짜', type: 'string' })
  start_date: Date | string;
  @ApiProperty({ description: '종료날짜', type: 'string' })
  end_date: Date | string;
  @ApiProperty({ description: '시간단위', type: 'string', enum: ['day', 'minute', 'hour'] })
  time_unit: string;
  @ApiProperty({ description: '시간', type: 'number' })
  time?: number | null;
  @ApiProperty({ description: '사용여부', type: 'string' })
  enabled?: boolean;
  @ApiProperty({ description: '코드', type: 'string' })
  code?: string | null;
  @ApiProperty({ description: '생성일시', type: 'string' })
  create_datetime?: Date | string;
  @ApiProperty({ description: '수정일시', type: 'string' })
  update_datetime?: Date | string;
  @ApiProperty({ description: '삭제일시', type: 'string' })
  delete_datetime?: Date | string | null;
  @ApiProperty({ description: '일정참여자', type: [ScheduleParticipantDTO] })
  schedule_participants: {}[];

  constructor(schedule: Schedules & { schedule_participants: Schedule_participants[] }) {
    this.schedule_no = schedule.no;
    this.name = schedule.name;
    this.description = schedule.description;
    this.type = schedule.type;
    this.is_duplicate_participation = schedule.is_duplicate_participation;
    this.is_participant_visible = schedule.is_participant_visible;
    this.start_date = convertDate(schedule.start_date);
    this.end_date = convertDate(schedule.end_date);
    this.time_unit = schedule.time_unit;
    this.time = schedule.time;
    this.code = schedule.code;
    this.enabled = schedule.enabled;
    this.create_datetime = convertDateTime(schedule.create_datetime);
    this.update_datetime = convertDateTime(schedule.update_datetime);
    this.schedule_participants = schedule.schedule_participants;
  }
}
