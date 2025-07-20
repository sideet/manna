interface ScheduleParticipant {
  // 실제 구조에 따라 더 추가 가능
  name?: string;
  email?: string;
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
  schedule_no: number;
  name: string;
  nickname: string;
  description: string;
  type: "individual" | "common";
  is_participant_visible: boolean;
  is_duplicate_participation: boolean;
  start_date: string; // "YYYY-MM-DD HH:mm:ss"
  end_date: string;
  time_unit: "day" | "hour" | "time";
  time: number;
  enabled: boolean;
  code: string;
  create_datetime: string;
  update_datetime: string;
  schedule_units: {
    [date: string]: ScheduleUnit[];
  };
  schedule_participants: ScheduleParticipant[];
}
