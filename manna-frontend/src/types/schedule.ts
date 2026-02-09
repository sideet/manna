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
  /** 해당 참가자의 확정 여부 */
  is_confirmed?: boolean;
}

/** GET /schedule/participants 응답 타입 */
export interface ScheduleParticipantsResponseType {
  total_count: number;
  schedule_participants: {
    no: number;
    schedule_no: number;
    name: string;
    email: string;
    phone: string | null;
    memo: string | null;
    create_datetime: string; // YYYY-MM-DD HH:mm:ss
    update_datetime: string | null; // YYYY-MM-DD HH:mm:ss
    delete_datetime: string | null; // YYYY-MM-DD HH:mm:ss
    participation_times: { // 참여 시간 정보 리스트
      no: number;
      schedule_unit: {
        no: number;
        date: string; // 참여 날짜
        time: string | null; // 참여 시간
        enabled: boolean;
      };
    }[];
  }[];
}

/** 일정 단위 타입 (manage)  */
interface ScheduleUnitType {
  no: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  enabled: boolean;
  schedule_no?: number;
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

  // 일정 확정 여부 (하나라도 확정되어 있다면 true)
  is_confirmed: boolean;

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

/** 확정된 일정 정보 API 응답용 (메일 보냄 여부 포함) */

/** GET /schedule/confirm/group 응답 - 확정된 단위 정보 */
export interface ConfirmedUnitInfoType {
  no: number;
  date: string;
  time: string | null;
}

/** 확정된 일정의 참가자 정보 (메일 보냄 여부 포함) */
export interface ConfirmParticipantInfoType {
  no: number;
  name: string;
  email: string;
  is_confirmed: boolean;
  /** 메일 보냄 여부 */
  is_confirmation_mail_sent: boolean;
}

/** GET /schedule/confirm/group 응답 타입 */
export interface GroupConfirmInfoType {
  schedule_no: number;
  schedule_name: string;
  is_confirmed: boolean;
  confirmed_unit: ConfirmedUnitInfoType | null;
  participants: ConfirmParticipantInfoType[];
  non_participants: ConfirmParticipantInfoType[];
}

/** GET /schedule/confirm/individual - 참가자별 확정 단위 */
export interface IndividualConfirmedParticipantType {
  no: number;
  name: string;
  email: string;
  is_confirmed: boolean;
  /** 메일 보냄 여부 */
  is_confirmation_mail_sent: boolean;
  confirmed_unit: ConfirmedUnitInfoType | null;
}

/** GET /schedule/confirm/individual 응답 타입 */
export interface IndividualConfirmInfoType {
  schedule_no: number;
  schedule_name: string;
  is_confirmed: boolean;
  confirmed_participants: IndividualConfirmedParticipantType[];
}

/** Guest용 확정 일정 조회 - 참가자 정보 (email 없음) */
export interface GuestConfirmParticipantType {
  no: number;
  name: string;
}

/** Guest용 확정 일정 조회 - 확정된 참가자 정보 (개인 일정용) */
export interface GuestConfirmedParticipantType extends GuestConfirmParticipantType {
  confirmed_unit: ConfirmedUnitInfoType | null;
}

/** GET /schedule/confirm/guest 응답 타입 */
export interface GuestConfirmInfoType {
  schedule_no: number;
  schedule_name: string;
  schedule_description: string;
  schedule_type: "COMMON" | "INDIVIDUAL";
  is_confirmed: boolean;
  is_participant_visible: boolean;
  /** 확정된 일정 단위 (그룹용) */
  confirmed_unit?: ConfirmedUnitInfoType | null;
  /** 참여 참가자 목록 (is_participant_visible이 true일 때만 포함) */
  participants?: GuestConfirmParticipantType[];
  /** 미참여 참가자 목록 (is_participant_visible이 true일 때만 포함) */
  non_participants?: GuestConfirmParticipantType[];
  /** 확정된 참가자 목록 (개인 일정용, is_participant_visible이 true일 때만 포함) */
  confirmed_participants?: GuestConfirmedParticipantType[];
  /** 상세 주소 */
  detail_address: string | null;
  /** 생성자 이름 */
  creator_name: string;
  /** 진행 방법 */
  meeting_type: "OFFLINE" | "ONLINE" | "NONE";
  /** 초대 코드 */
  code: string;
}
