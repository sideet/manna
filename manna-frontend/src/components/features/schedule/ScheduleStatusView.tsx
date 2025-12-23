"use client";

import { useToast } from "@/providers/ToastProvider";
import ManageTimeTable from "./timetable/ManageTimeTable";
import {
  DetailScheduleUnitType,
  ScheduleParticipantsResponseType,
  ScheduleResponseType,
} from "@/types/schedule";
import { useCallback, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { addDays, parse, format } from "date-fns";
import clientApi from "@/app/api/client";
import BlankResponseBox from "@/components/common/BlankResponseBox";

interface ScheduleUnitsResponse {
  schedule_units: {
    [date: string]: DetailScheduleUnitType[];
  };
}

/** 관리자 일정 조회 > 일정 현황 컴포넌트 */
export default function ScheduleStatusView({
  schedule,
}: {
  schedule: ScheduleResponseType;
}) {
  const { showToast } = useToast();
  const [scheduleUnits, setScheduleUnits] =
    useState<ScheduleUnitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedDates, setLoadedDates] = useState<Set<string>>(new Set());
  const timeTableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 응답자 존재 여부 (ScheduleResponseView에서 사용하는 api로 임시 판별.
  // TODO: tanstackquery등 사용하여서 리팩토링시 불필요한 api 호출 방지 가능할 것으로 생각됨.
  const [isResponseExists, setIsResponseExists] = useState(false);
  const fetchIsResponseExists = useCallback(async () => {
    const response = await clientApi.get<ScheduleParticipantsResponseType>(
      `/schedule/participants?schedule_no=${schedule.no}`
    );
    setIsResponseExists(response.data?.schedule_participants?.length > 0);
  }, [schedule.no]);

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

        const response = await clientApi.get<ScheduleUnitsResponse>(
          `/schedule/units/guest?schedule_no=${schedule.no}&search_date=${searchDate}`
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
        if (isInitial) {
          showToast(
            axiosError.response?.data?.message ||
              "일정 시간 정보를 불러올 수 없습니다.",
            "error"
          );
        }
      } finally {
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [schedule.no, loadedDates, showToast]
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

  useEffect(() => {
    if (schedule.no) {
      fetchIsResponseExists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.no]);

  // 가로 무한스크롤
  //TODO: 호출 타이밍 확인 필요
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
            loadNextWeek(); // 이 부분에서 API 호출
          }
        });
      },
      {
        root: timeTableRef.current, // 가로 스크롤 대상
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

  if (!isResponseExists) {
    return (
      <BlankResponseBox
        handleCopyLink={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/schedule/${schedule.code}`
          );
          showToast("링크가 복사되었습니다.");
        }}
      />
    );
  }

  return (
    <div className="">
      <div ref={timeTableRef} className="relative">
        <ManageTimeTable
          dates={dates}
          schedule_units={scheduleUnits?.schedule_units}
          schedule_type={schedule.type.toLowerCase() as "individual" | "common"}
          is_participant_visible={schedule.is_participant_visible}
          time_unit={schedule.time_unit}
          time={schedule.time}
        />
        {/* scroll 끝을 감지하는 sentinel */}
        <div ref={sentinelRef} className="sentinel w-1 h-10" />
      </div>
    </div>
  );
}
