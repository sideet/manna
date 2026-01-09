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
  onError?: (error: AxiosError<{ message?: string }>) => void;
}

/** 일정 단위 데이터 조회 훅 */
export function useScheduleUnits({
  scheduleNo,
  startDate,
  onError,
}: UseScheduleUnitsOptions) {
  const [scheduleUnits, setScheduleUnits] =
    useState<ScheduleUnitsResponse | null>(null);
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
          `/api/schedule/units/guest?schedule_no=${scheduleNo}&search_date=${searchDate}`
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
            const existingNos = new Set(
              merged.schedule_units[date].map((u) => u.no)
            );
            const newUnits = response.data.schedule_units[date].filter(
              (u) => !existingNos.has(u.no)
            );
            merged.schedule_units[date] = [
              ...merged.schedule_units[date],
              ...newUnits,
            ];
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
    [scheduleNo, loadedDates, onError]
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (scheduleNo && startDate) {
      const searchDate = startDate.includes(" ")
        ? startDate.split(" ")[0]
        : startDate;

      fetchScheduleUnits(searchDate, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleNo, startDate]);

  // 가로 무한스크롤
  const loadNextWeek = useCallback(() => {
    if (!scheduleUnits) return;

    const dates = Object.keys(scheduleUnits.schedule_units).sort();
    const lastDate = dates[dates.length - 1];
    const nextWeekStart = addDays(parse(lastDate, "yyyy-MM-dd", new Date()), 7);
    const nextWeekStartStr = format(nextWeekStart, "yyyy-MM-dd");

    fetchScheduleUnits(nextWeekStartStr, false);
  }, [scheduleUnits, fetchScheduleUnits]);

  // 무한스크롤 observer 설정
  useEffect(() => {
    if (!timeTableRef.current || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoadingMore) {
            loadNextWeek();
          }
        });
      },
      {
        root: timeTableRef.current,
        threshold: 0.8,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [scheduleUnits, isLoadingMore, loadNextWeek]);

  // 날짜 배열 추출
  const dates = scheduleUnits
    ? Object.keys(scheduleUnits.schedule_units).sort()
    : [];

  return {
    scheduleUnits: scheduleUnits?.schedule_units ?? null,
    dates,
    isLoading,
    isLoadingMore,
    timeTableRef,
    sentinelRef,
  };
}

