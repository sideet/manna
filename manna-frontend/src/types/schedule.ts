interface ParticipationTime {
  no: number;
  schedule_participant_no: number;
  schedule_unit_no: number;
  create_datetime: string;
  update_datetime: string;
  enabled: boolean;
  schedule_unit: {
    no: number;
    date: string;
    time: string;
    enabled: boolean;
    schedule_no: number;
  };
}

export interface ScheduleParticipant {
  no: number;
  schedule_no: number;
  name: string;
  email: string;
  phone: string;
  memo: string;
  create_datetime: string;
  update_datetime: string;
  participation_times: ParticipationTime[];
}

export interface ScheduleUnit {
  no: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  enabled: boolean;
  schedule_no: number;
  schedule_participants: ScheduleParticipant[];
}

export interface ScheduleType {
  no: number;
  /** 일정 이름 */
  name: string;
  nickname: string;
  /** 생성 유저 이름 */
  user_name: string;
  description: string;
  type: "individual" | "common";
  is_participant_visible: boolean;
  is_duplicate_participation: boolean;
  start_date: string; // "YYYY-MM-DD HH:mm:ss"
  end_date: string;
  time_unit: "day" | "hour" | "minute";
  time: number;
  enabled: boolean;
  code: string;
  create_datetime: string;
  update_datetime: string;
  schedule_units: {
    [date: string]: ScheduleUnit[];
  };
  schedule_participants: ScheduleParticipant[];

  // 미팅타입
  meeting_type: "offline" | "online" | "none";

  // 지역
  region?: {
    no: number;
    name: string;
  };
  region_detail?: {
    no: number;
    name: string;
  };
}
