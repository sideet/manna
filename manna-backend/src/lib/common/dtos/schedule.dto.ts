import { ApiProperty } from '@nestjs/swagger';
import { Schedule_participants, Schedules } from '@prisma/client';
import { convertDate, convertDateTime } from 'src/lib/common/prototypes/date';

type schedule_units = {
  [date: string]: {
    no: number;
    time: string;
    enabled: boolean;
    date: string;
    schedule_no: number;
    schedule_participants?: {
      no: number;
      email: string;
      name: string;
      phone: string;
      memo: string;
      create_datetime: string;
      update_datetime: string;
    }[];
  }[];
};

export class ScheduleUnitDTO {
  @ApiProperty({ description: '일정단위고유번호', type: 'number' })
  no: number;
  @ApiProperty({ description: '날짜', type: 'string' })
  date: string;
  @ApiProperty({ description: '시간', type: 'string' })
  time: string;
  @ApiProperty({ description: '사용여부', type: 'boolean' })
  enabled: boolean;
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  schedule_no: number;

  constructor(schedule_unit: ScheduleUnitDTO) {
    this.no = schedule_unit.no;
    this.date = schedule_unit.date;
    this.time = schedule_unit.time;
    this.enabled = schedule_unit.enabled;
    this.schedule_no = schedule_unit.schedule_no;
  }
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
  create_datetime: Date | string | null;
  @ApiProperty({ description: '수정일시', type: 'string' })
  update_datetime: Date | string | null;
  @ApiProperty({ description: '삭제일시', type: 'string' })
  delete_datetime?: Date | string | null;
  @ApiProperty({ description: '참석시간', type: 'string' })
  participation_times: ParticipationTimeDTO[];

  constructor(schedule_participant: ScheduleParticipantDTO) {
    this.no = schedule_participant.no;
    this.email = schedule_participant.email;
    this.name = schedule_participant.name;
    this.phone = schedule_participant.phone;
    this.memo = schedule_participant.memo;
    this.schedule_no = schedule_participant.schedule_no;
    this.create_datetime = convertDateTime(schedule_participant.create_datetime);
    this.update_datetime = convertDateTime(schedule_participant.update_datetime);
    this.participation_times = schedule_participant.participation_times.map((time) => {
      return {
        ...new ParticipationTimeDTO(time),
        schedule_unit: time.schedule_unit,
      };
    });
  }
}

export class ParticipationTimeDTO {
  @ApiProperty({ description: '참석시간고유번호', type: 'number' })
  no: number;
  @ApiProperty({ description: '일정참석자고유번호', type: 'number' })
  schedule_participant_no: number;
  @ApiProperty({ description: '일정단위고유번호', type: 'number' })
  schedule_unit_no: number;
  @ApiProperty({ description: '생성일시', type: 'string' })
  create_datetime: Date | string | null;
  @ApiProperty({ description: '수정일시', type: 'string' })
  update_datetime?: Date | string | null;
  @ApiProperty({ description: '삭제일시', type: 'string' })
  delete_datetime?: Date | string | null;
  @ApiProperty({ description: '사용여부', type: 'boolean' })
  enabled: boolean;
  @ApiProperty({ description: '일정단위', type: ScheduleUnitDTO })
  schedule_unit: ScheduleUnitDTO;

  constructor(participation_time: ParticipationTimeDTO) {
    this.no = participation_time.no;
    this.schedule_participant_no = participation_time.schedule_participant_no;
    this.schedule_unit_no = participation_time.schedule_unit_no;
    this.enabled = participation_time.enabled;
    this.create_datetime = convertDateTime(participation_time.create_datetime);
    this.update_datetime = convertDateTime(participation_time.update_datetime);
    this.schedule_unit = participation_time.schedule_unit;
  }
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
  schedule_participants: ScheduleParticipantDTO[];

  constructor(
    schedule: Schedules & {
      schedule_units: schedule_units;
    } & { schedule_participants?: ScheduleParticipantDTO[] }
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
