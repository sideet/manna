"use client";

import { useState, useEffect } from "react";
import { GuestScheduleResponseType } from "@/types/schedule";
import { getScheduleResponse, ScheduleResponseData } from "@/utils/scheduleResponseStorage";
import ResponseCompleteMessage from "../views/response/ResponseCompleteMessage";
import ResponseFormView from "../views/response/ResponseFormView";
import ResponseCompleteView from "../views/response/ResponseCompleteView";

interface ScheduleResponseContainerProps {
  schedule: GuestScheduleResponseType;
}

/** 일정 응답 컨테이너 - 완료 메시지, 폼/완료 뷰 분기 처리 */
export default function ScheduleResponseContainer({
  schedule,
}: ScheduleResponseContainerProps) {
  const [savedResponseData, setSavedResponseData] =
    useState<ScheduleResponseData | null>(null);

  // 로컬스토리지에서 저장된 응답 확인
  useEffect(() => {
    const savedData = getScheduleResponse(schedule.code);
    if (savedData) {
      setSavedResponseData(savedData);
    }
  }, [schedule.code]);

  const handleComplete = () => {
    const savedData = getScheduleResponse(schedule.code);
    if (savedData) {
      setSavedResponseData(savedData);
    }
  };

  return (
    <>
      {savedResponseData && <ResponseCompleteMessage />}
      {savedResponseData ? (
        <ResponseCompleteView
          schedule={schedule}
          responseData={savedResponseData}
        />
      ) : (
        <ResponseFormView schedule={schedule} onComplete={handleComplete} />
      )}
    </>
  );
}

