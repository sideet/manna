import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import clientApi from "@/app/api/client";
import {
  GroupConfirmInfoType,
  IndividualConfirmInfoType,
  GuestConfirmInfoType,
} from "@/types/schedule";
import { AxiosError } from "axios";
import { useToast } from "@/providers/ToastProvider";

/** 그룹(COMMON) 확정 일정 조회 훅 */
export function useGroupConfirmInfo(scheduleNo: number, enabled: boolean) {
  return useQuery({
    queryKey: ["groupConfirmInfo", scheduleNo],
    queryFn: async () => {
      const response = await clientApi.get<GroupConfirmInfoType>(
        `/schedule/confirm/group?schedule_no=${scheduleNo}`
      );
      return response.data;
    },
    enabled: !!scheduleNo && enabled,
    staleTime: 1000 * 60, // 1분
  });
}

/** 개인(INDIVIDUAL) 확정 일정 조회 훅 */
export function useIndividualConfirmInfo(scheduleNo: number, enabled: boolean) {
  return useQuery({
    queryKey: ["individualConfirmInfo", scheduleNo],
    queryFn: async () => {
      const response = await clientApi.get<IndividualConfirmInfoType>(
        `/schedule/confirm/individual?schedule_no=${scheduleNo}`
      );
      return response.data;
    },
    enabled: !!scheduleNo && enabled,
    staleTime: 1000 * 60, // 1분
  });
}

/** Guest용 확정 일정 조회 훅 (비로그인 공유 페이지용) */
export function useGuestConfirmInfo(
  code: string,
  participantNo?: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["guestConfirmInfo", code, participantNo],
    queryFn: async () => {
      const params = new URLSearchParams({ code });
      if (participantNo) {
        params.append("participant_no", String(participantNo));
      }
      const response = await clientApi.get<GuestConfirmInfoType>(
        `/schedule/confirm/guest?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!code && enabled,
    staleTime: 1000 * 60, // 1분
  });
}

interface CancelConfirmParams {
  schedule_no: number;
  schedule_participant_no?: number; // 개인 일정일 때 필수
}

interface SendConfirmationEmailParams {
  schedule_no: number;
  schedule_participant_nos: number[];
}

/** 확정 취소 mutation 훅 */
export function useCancelConfirm() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CancelConfirmParams) => {
      const response = await clientApi.post(`/schedule/confirm/cancel`, params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      showToast("일정 확정이 취소되었습니다.", "success");
      // 관련 쿼리 무효화하여 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["schedule"],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduleUnits", variables.schedule_no],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduleParticipants", variables.schedule_no],
      });
      queryClient.invalidateQueries({
        queryKey: ["groupConfirmInfo", variables.schedule_no],
      });
      queryClient.invalidateQueries({
        queryKey: ["individualConfirmInfo", variables.schedule_no],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("확정 취소 실패:", error);
      showToast(
        error.response?.data?.message || "확정 취소에 실패했습니다.",
        "error"
      );
    },
  });
}

/** 확정 메일 전송 mutation 훅 */
export function useSendConfirmationEmail() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendConfirmationEmailParams) => {
      const response = await clientApi.post(`/schedule/confirm/email`, params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      showToast("확정 메일이 전송되었습니다.", "success");
      // 메일 전송 후 확정 정보 갱신 (is_confirmation_mail_sent 업데이트)
      queryClient.invalidateQueries({
        queryKey: ["groupConfirmInfo", variables.schedule_no],
      });
      queryClient.invalidateQueries({
        queryKey: ["individualConfirmInfo", variables.schedule_no],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("메일 전송 실패:", error);
      showToast(
        error.response?.data?.message || "메일 전송에 실패했습니다.",
        "error"
      );
    },
  });
}
