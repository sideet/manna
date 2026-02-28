import { useState, useEffect, useRef, useCallback } from "react";
import { GuestScheduleUnitType } from "@/types/schedule";
import axios, { AxiosError } from "axios";
import { addDays, parse, format } from "date-fns";

interface ScheduleUnitsResponse {
  schedule_units: {
    [date: string]: GuestScheduleUnitType[];
  };
}

interface UseScheduleUnitsOptions {
  scheduleNo: number;
  startDate: string;
  endDate: string;
  onError?: (error: AxiosError<{ message?: string }>) => void;
}

/** 일정 단위 데이터 조회 훅 */
export function useScheduleUnits({ scheduleNo, startDate, endDate, onError }: UseScheduleUnitsOptions) {
  const [scheduleUnits, setScheduleUnits] = useState<ScheduleUnitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedDates, setLoadedDates] = useState<Set<string>>(new Set());
  const timeTableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 스케줄 단위 데이터 조회 함수
  const fetchScheduleUnits = useCallback(
    async (searchDate: string, isInitial = false) => {
      // 이미 로드된 날짜인지 확인
      if (loadedDates.has(searchDate)) {
        return;
      }

      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await axios.get<ScheduleUnitsResponse>(
          `/api/schedule/units/guest?schedule_no=${scheduleNo}&search_date=${searchDate}`,
        );

        setScheduleUnits((prev) => {
          if (!prev) {
            return response.data;
          }

          // 기존 데이터와 병합
          const merged: ScheduleUnitsResponse = {
            schedule_units: { ...prev.schedule_units },
          };

          // 새 데이터 병합
          Object.keys(response.data.schedule_units).forEach((date) => {
            if (!merged.schedule_units[date]) {
              merged.schedule_units[date] = [];
            }
            // 중복 제거 (no 기준)
            const existingNos = new Set(merged.schedule_units[date].map((u) => u.no));
            const newUnits = response.data.schedule_units[date].filter(
              (u) => !existingNos.has(u.no),
            );
            merged.schedule_units[date] = [...merged.schedule_units[date], ...newUnits];
          });

          return merged;
        });

        setLoadedDates((prev) => new Set([...prev, searchDate]));
      } catch (error) {
        console.error("스케줄 단위 조회 실패:", error);
        const axiosError = error as AxiosError<{ message?: string }>;
        if (isInitial && onError) {
          onError(axiosError);
        }
      } finally {
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [scheduleNo, loadedDates, onError],
  );

  // 초기 데이터 로드 (1주차 + 2주차 선제 로드)
  useEffect(() => {
    if (scheduleNo && startDate) {
      const searchDate = startDate.includes(" ") ? startDate.split(" ")[0] : startDate;

      fetchScheduleUnits(searchDate, true);

      const week2StartDate = format(addDays(parse(searchDate, "yyyy-MM-dd", new Date()), 7), "yyyy-MM-dd");
      if (week2StartDate <= endDate) {
        fetchScheduleUnits(week2StartDate, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleNo, startDate]);

  // 가로 무한스크롤
  const loadNextWeek = useCallback(() => {
    if (!scheduleUnits) return;

    // memo: 백엔드가 search_date ~ search_date+7(포함)으로 내려주기 때문에
    // 응답 데이터의 "마지막 날짜"를 기준으로 다음 주를 계산하면 경계일(예: 3/8)이 건너뛰어 보일 수 있음.
    // 따라서 "마지막으로 요청했던 search_date"를 기준으로 7일 단위로 cursor를 전진시킨다.
    const lastRequestedStartDate = Array.from(loadedDates).sort().at(-1);
    if (!lastRequestedStartDate) return;

    const nextWeekStart = addDays(parse(lastRequestedStartDate, "yyyy-MM-dd", new Date()), 7);
    const nextWeekStartStr = format(nextWeekStart, "yyyy-MM-dd");

    if (nextWeekStartStr > endDate) return;

    fetchScheduleUnits(nextWeekStartStr, false);
  }, [scheduleUnits, fetchScheduleUnits, loadedDates, endDate]);

  // 무한스크롤 observer 설정
  useEffect(() => {
    if (!timeTableRef.current) return;

    // 실제 가로 스크롤 컨테이너 + 내부 sentinel 기준으로 감지
    const scrollContainer = timeTableRef.current.querySelector(
      ".overflow-x-auto",
    ) as HTMLElement | null;
    const xSentinel = timeTableRef.current.querySelector(
      "[data-x-sentinel='true']",
    ) as HTMLElement | null;

    if (!scrollContainer || !xSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || isLoadingMore) return;

          const isNearEnd =
            scrollContainer.scrollLeft + scrollContainer.clientWidth >=
            scrollContainer.scrollWidth - 100;

          if (isNearEnd) loadNextWeek();
        });
      },
      {
        root: scrollContainer,
        threshold: 0.1,
      },
    );

    observer.observe(xSentinel);
    return () => observer.disconnect();
  }, [scheduleUnits, isLoadingMore, loadNextWeek]);

  // 날짜 배열 추출
  const dates = scheduleUnits ? Object.keys(scheduleUnits.schedule_units).sort() : [];

  return {
    scheduleUnits: scheduleUnits?.schedule_units ?? null,
    dates,
    isLoading,
    isLoadingMore,
    timeTableRef,
    sentinelRef,
  };
}
