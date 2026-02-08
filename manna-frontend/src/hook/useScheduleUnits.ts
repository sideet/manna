import { useInfiniteQuery } from "@tanstack/react-query";
import clientApi from "@/app/api/client";
import { DetailScheduleUnitType } from "@/types/schedule";
import { addDays, parse, format } from "date-fns";

interface ScheduleUnitsResponse {
  schedule_units: {
    [date: string]: DetailScheduleUnitType[];
  };
}

export function useScheduleUnits(scheduleNo: number, startDate: string) {
  // startDate에서 날짜만 추출 (시간 제거)
  const initialDate = startDate.includes(" ")
    ? startDate.split(" ")[0]
    : startDate;

  return useInfiniteQuery({
    queryKey: ["scheduleUnits", scheduleNo],
    queryFn: async ({ pageParam }: { pageParam: string }) => {
      const response = await clientApi.get<ScheduleUnitsResponse>(
        `/schedule/units/guest?schedule_no=${scheduleNo}&search_date=${pageParam}`
      );
      return response.data;
    },
    initialPageParam: initialDate,
    getNextPageParam: (lastPage) => {
      // 마지막 페이지의 날짜들 중 가장 마지막 날짜 찾기
      const dates = Object.keys(lastPage.schedule_units).sort();
      if (dates.length === 0) {
        return undefined;
      }

      const lastDate = dates[dates.length - 1];
      // 다음 주 시작일 계산 (7일 후)
      const nextWeekStart = addDays(
        parse(lastDate, "yyyy-MM-dd", new Date()),
        7
      );
      const nextDate = format(nextWeekStart, "yyyy-MM-dd");
      return nextDate;
    },
    enabled: !!scheduleNo && !!startDate,
    staleTime: 1000 * 60, // 1분 (memo. 타임테이블 데이터는 자주 변경될 수 있음)
    // 자동 prefetch 방지
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // 최대 페이지 수 제한 (무한 루프 방지)
    maxPages: 100,
  });
}

