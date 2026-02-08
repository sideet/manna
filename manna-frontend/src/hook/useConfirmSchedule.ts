import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientApi from "@/app/api/client";
import { AxiosError } from "axios";
import { useToast } from "@/providers/ToastProvider";

interface ConfirmScheduleParams {
  schedule_no: number;
  schedule_unit_no: number;
  schedule_participant_nos: number[];
}

/** 일정 확정 mutation 훅 */
export function useConfirmSchedule() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ConfirmScheduleParams) => {
      const response = await clientApi.post(`/schedule/confirm`, {
        schedule_no: params.schedule_no,
        schedule_unit_no: params.schedule_unit_no,
        schedule_participant_nos: params.schedule_participant_nos,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      showToast("일정이 확정되었습니다.", "success");
      // 관련 쿼리 무효화하여 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["scheduleUnits", variables.schedule_no],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduleParticipants", variables.schedule_no],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("일정 확정 실패:", error);
      showToast(
        error.response?.data?.message || "일정 확정에 실패했습니다.",
        "error",
      );
    },
  });
}
