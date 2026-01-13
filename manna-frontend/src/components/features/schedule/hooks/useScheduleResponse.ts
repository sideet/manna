import { useState, useEffect } from "react";
import { useToast } from "@/providers/ToastProvider";
import clientApi from "@/app/api/client";
import { AxiosError } from "axios";
import {
  saveScheduleResponse,
  getScheduleResponse,
  ScheduleResponseData,
} from "@/utils/scheduleResponseStorage";

interface SubmitResponseParams {
  scheduleNo: number;
  scheduleCode: string;
  name: string;
  email: string;
  phone?: string;
  memo?: string;
  selectedUnitNos: number[];
}

/** 일정 응답 관련 훅 */
export function useScheduleResponse(scheduleCode: string) {
  const { showToast } = useToast();
  const [savedResponseData, setSavedResponseData] =
    useState<ScheduleResponseData | null>(null);

  // 로컬스토리지에서 저장된 응답 확인
  useEffect(() => {
    const savedData = getScheduleResponse(scheduleCode);
    if (savedData) {
      setSavedResponseData(savedData);
    }
  }, [scheduleCode]);

  // 응답 제출
  const submitResponse = async (params: SubmitResponseParams) => {
    try {
      await clientApi.post(
        `/schedule/answer`,
        {
          schedule_no: params.scheduleNo,
          name: params.name,
          email: params.email,
          phone: params.phone || undefined,
          memo: params.memo || undefined,
          schedule_unit_nos: params.selectedUnitNos,
        },
        {
          headers: { skipAuth: true },
        }
      );

      // 로컬스토리지에 응답 정보 저장
      const responseData: ScheduleResponseData = {
        schedule_no: params.scheduleNo,
        selectedUnitNos: params.selectedUnitNos,
        name: params.name,
        email: params.email,
        phone: params.phone || undefined,
        memo: params.memo || undefined,
        submittedAt: new Date().toISOString(),
      };
      saveScheduleResponse(params.scheduleCode, responseData);

      showToast("응답이 제출되었습니다.", "success");
      setSavedResponseData(responseData);
      return responseData;
    } catch (error) {
      console.error("응답 제출 실패:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      showToast(
        axiosError.response?.data?.message || "응답 제출에 실패했습니다.",
        "error"
      );
      throw error;
    }
  };

  return {
    savedResponseData,
    submitResponse,
  };
}

