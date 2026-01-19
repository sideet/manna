import { useQuery } from "@tanstack/react-query";
import clientApi from "@/app/api/client";
import { ScheduleResponseType } from "@/types/schedule";

export function useSchedule(scheduleNo: string) {
  return useQuery({
    queryKey: ["schedule", scheduleNo],
    queryFn: async () => {
      const response = await clientApi.get<{ schedule: ScheduleResponseType }>(
        `/schedule?schedule_no=${scheduleNo}`
      );
      return response.data.schedule;
    },
    enabled: !!scheduleNo, // scheduleNo가 있을 때만 호출
    staleTime: 1000 * 60 * 2, // 2분 (memo. 현재는 일정 정보 수정 기능 없음)
  });
}

