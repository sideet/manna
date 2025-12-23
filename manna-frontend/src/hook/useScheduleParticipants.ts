import { useQuery } from "@tanstack/react-query";
import clientApi from "@/app/api/client";
import { ScheduleParticipantsResponseType } from "@/types/schedule";

export function useScheduleParticipants(scheduleNo: number) {
  return useQuery({
    queryKey: ["scheduleParticipants", scheduleNo],
    queryFn: async () => {
      const response = await clientApi.get<ScheduleParticipantsResponseType>(
        `/schedule/participants?schedule_no=${scheduleNo}`
      );
      return response.data;
    },
    enabled: !!scheduleNo, // scheduleNo가 있을 때만 호출
    staleTime: 1000 * 30, // 30초: 참여자가 응답할 수 있으므로 짧게
  });
}

