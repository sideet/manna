"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ResponseTimeTable from "./timetable/ResponseTimeTable";
import {
  GuestScheduleResponseType,
  GuestScheduleUnitType,
} from "@/types/schedule";
import axios from "axios";
import { addDays, parse, format } from "date-fns";
import { ScheduleResponseData } from "@/utils/scheduleResponseStorage";

interface ScheduleUnitsResponse {
  schedule_units: {
    [date: string]: GuestScheduleUnitType[];
  };
}

interface MyResponseViewProps {
  schedule: GuestScheduleResponseType;
  responseData: ScheduleResponseData;
}

/** 내가 응답한 일정 컴포넌트 (응답자 공개 X) */
export default function MyResponseView({
  schedule,
  responseData,
}: MyResponseViewProps) {
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
          `/api/schedule/units/guest?schedule_no=${schedule.no}&search_date=${searchDate}`
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
      } finally {
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [schedule.no, loadedDates]
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (schedule.no) {
      const searchDate = schedule.start_date.includes(" ")
        ? schedule.start_date.split(" ")[0]
        : schedule.start_date;

      fetchScheduleUnits(searchDate, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.no]);

  // 가로 무한스크롤
  const loadNextWeek = () => {
    if (!scheduleUnits) return;

    const dates = Object.keys(scheduleUnits.schedule_units).sort();
    const lastDate = dates[dates.length - 1];
    const nextWeekStart = addDays(parse(lastDate, "yyyy-MM-dd", new Date()), 7);
    const nextWeekStartStr = format(nextWeekStart, "yyyy-MM-dd");

    fetchScheduleUnits(nextWeekStartStr, false);
  };

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
  }, [scheduleUnits, isLoadingMore]);

  // 날짜 배열 추출
  const dates = scheduleUnits
    ? Object.keys(scheduleUnits.schedule_units).sort()
    : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">일정 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!scheduleUnits) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">
          일정 시간 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <h3 className="text-head18 text-gray-900">내가 응답한 일정</h3>
      <div className="">
        <div ref={timeTableRef} className="relative">
          <ResponseTimeTable
            dates={dates}
            schedule_units={scheduleUnits.schedule_units}
            selectedUnitNos={responseData.selectedUnitNos}
            schedule_type={
              schedule.type.toLowerCase() as "individual" | "common"
            }
            is_participant_visible={false}
          />
          {/* scroll 끝을 감지하는 sentinel */}
          <div ref={sentinelRef} className="sentinel w-1 h-10" />
        </div>
        {isLoadingMore && (
          <div className="text-center mt-8">
            <p className="text-body14 text-gray-500">
              다음 주 일정을 불러오는 중...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
