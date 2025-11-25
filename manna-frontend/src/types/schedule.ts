// export interface ParticipationTime {
//   no: number;
//   schedule_participant_no: number;
//   schedule_unit_no: number;
//   create_datetime: string;
//   update_datetime: string;
//   enabled: boolean;
//   schedule_unit: {
//     no: number;
//     date: string;
//     time: string;
//     enabled: boolean;
//     schedule_no: number;
//   };
// }

/** 일정 응답자 타입 (guest) */
export interface ScheduleParticipantType {
  no: number;
  name: string;
  create_datetime: string;
  update_datetime: string;
}

/** 일정 응답자 상세 타입 (manage) */
export interface ScheduleParicipantDetailType extends ScheduleParticipantType {
  email: string;
  phone?: string;
  memo?: string;
}

/** 일정 단위 타입 (manage)  */
interface ScheduleUnitType {
  no: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  enabled: boolean;
  schedule_no: number;
}

/** GET /schedule/units/guest 응답 타입 */
export interface GuestScheduleUnitType extends ScheduleUnitType {
  schedule_participants: ScheduleParticipantType[];
}

/** GET /schedule/units (manage) 응답 타입 */
export interface DetailScheduleUnitType extends ScheduleUnitType {
  schedule_participants: ScheduleParicipantDetailType[];
}

/***********************************************************/

// 공통 스케줄 기본 타입
export interface ScheduleType {
  no: number;
  name: string;
  description: string;
  type: "INDIVIDUAL" | "COMMON";
  meeting_type: "OFFLINE" | "ONLINE" | "NONE";
  detail_address?: string;
  is_participant_visible: boolean;
  is_duplicate_participation: boolean;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  time_unit: "DAY" | "HOUR" | "MINUTE";
  time: number;
  enabled: boolean;
  code: string;
  expiry_datetime: string | null; // YYYY-MM-DD HH:mm:ss
  create_datetime: string;
  update_datetime: string | null;
  delete_datetime: string | null;

  // 생성자 정보
  user_no: number;
  user: {
    no: number;
    name: string;
    email: string;
  };

  //  memo. 추후 필요시 사용
  region_no?: number;
  region_detail_no?: number;
  region?: {
    no: number;
    name: string;
  };
  region_detail?: {
    no: number;
    name: string;
  };
}

// guest schedule 조회 응답 타입
export interface GuestScheduleResponseType extends ScheduleType {
  detail_address: string; // required로 오버라이드
}

// /schedules 응답 타입
export interface ScheduleItemType extends ScheduleType {
  participant_count: number;
}

/** schedule 조회 응답 타입 */
export interface ScheduleResponseType extends ScheduleType {
  detail_address: string; // required로 오버라이드
}
