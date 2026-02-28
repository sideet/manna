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
        `/schedule/units?schedule_no=${scheduleNo}&search_date=${pageParam}`
      );
      return response.data;
    },
    initialPageParam: initialDate,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // 데이터가 전혀 없으면 더 이상 진행하지 않음
      const dates = Object.keys(lastPage.schedule_units);
      if (dates.length === 0) return undefined;

      // memo: 백엔드가 search_date ~ search_date+7(포함)으로 내려주기 때문에
      // 응답의 "마지막 날짜"를 기준으로 다음 cursor를 계산하면 경계일이 건너뛰어 보일 수 있다.
      // 따라서 마지막으로 요청한 pageParam(=search_date) 기준으로 7일 단위로 전진한다.
      const nextWeekStart = addDays(
        parse(String(lastPageParam), "yyyy-MM-dd", new Date()),
        7
      );
      return format(nextWeekStart, "yyyy-MM-dd");
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

