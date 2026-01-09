"use client";

import { useState, useEffect } from "react";
import { GuestScheduleResponseType } from "@/types/schedule";
import { getScheduleResponse } from "@/utils/scheduleResponseStorage";
import ScheduleResponseCompleteMessage from "./ScheduleResponseCompleteMessage";

interface ScheduleResponseWrapperProps {
  schedule: GuestScheduleResponseType;
}

/** 일정 응답 완료 메시지 래퍼 - 완료 상태일 때만 메시지 표시 */
export default function ScheduleResponseWrapper({
  schedule,
}: ScheduleResponseWrapperProps) {
  const [savedResponseData, setSavedResponseData] = useState(
    typeof window !== "undefined" ? getScheduleResponse(schedule.code) : null
  );

  // 클라이언트에서만 실행되도록 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = getScheduleResponse(schedule.code);
      setSavedResponseData(data);
    }
  }, [schedule.code]);

  if (!savedResponseData) return null;

  return <ScheduleResponseCompleteMessage />;
}

