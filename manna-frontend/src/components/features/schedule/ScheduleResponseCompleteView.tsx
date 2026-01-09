"use client";

import { GuestScheduleResponseType } from "@/types/schedule";
import { ScheduleResponseData } from "@/utils/scheduleResponseStorage";
import MyResponseView from "./MyResponseView";
import AllResponseView from "./AllResponseView";

interface ScheduleResponseCompleteViewProps {
  schedule: GuestScheduleResponseType;
  responseData: ScheduleResponseData;
}

/** 일정 응답 완료 뷰 컴포넌트 */
export default function ScheduleResponseCompleteView({
  schedule,
  responseData,
}: ScheduleResponseCompleteViewProps) {
  return (
    <>
      {/* 응답 현황 섹션 */}
      {schedule.is_participant_visible ? (
        <AllResponseView schedule={schedule} />
      ) : (
        <MyResponseView schedule={schedule} responseData={responseData} />
      )}
    </>
  );
}
