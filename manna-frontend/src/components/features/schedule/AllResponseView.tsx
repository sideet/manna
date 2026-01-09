"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ResponseTimeTable from "./timetable/ResponseTimeTable";
import {
  GuestScheduleResponseType,
  GuestScheduleUnitType,
} from "@/types/schedule";
import axios from "axios";
import { addDays, parse, format } from "date-fns";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import { IoCalendarClear } from "react-icons/io5";

interface ScheduleUnitsResponse {
  schedule_units: {
    [date: string]: GuestScheduleUnitType[];
  };
}

interface AllResponseViewProps {
  schedule: GuestScheduleResponseType;
}

/** 일정 답변 현황 컴포넌트 (응답자 공개 O) */
export default function AllResponseView({ schedule }: AllResponseViewProps) {
  const [scheduleUnits, setScheduleUnits] =
    useState<ScheduleUnitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedDates, setLoadedDates] = useState<Set<string>>(new Set());
  const [selectedUnit, setSelectedUnit] =
    useState<GuestScheduleUnitType | null>(null);
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
  const loadNextWeek = useCallback(() => {
    if (!scheduleUnits) return;

    const dates = Object.keys(scheduleUnits.schedule_units).sort();
    const lastDate = dates[dates.length - 1];
    const nextWeekStart = addDays(parse(lastDate, "yyyy-MM-dd", new Date()), 7);
    const nextWeekStartStr = format(nextWeekStart, "yyyy-MM-dd");

    fetchScheduleUnits(nextWeekStartStr, false);
  }, [scheduleUnits, fetchScheduleUnits]);

  // 시간 영역 클릭 핸들러
  const handleTimeSelect = useCallback(
    (unitNo: number) => {
      if (!scheduleUnits) return;

      // 모든 날짜의 units를 순회하며 해당 unitNo를 찾기
      for (const date of Object.keys(scheduleUnits.schedule_units)) {
        const unit = scheduleUnits.schedule_units[date].find(
          (u) => u.no === unitNo
        );
        if (unit) {
          setSelectedUnit(unit);
          break;
        }
      }
    },
    [scheduleUnits]
  );

  // 모든 참여자 목록 추출
  const allParticipants = new Set<string>();
  if (scheduleUnits) {
    Object.values(scheduleUnits.schedule_units).forEach((units) => {
      units.forEach((unit) => {
        unit.schedule_participants.forEach((p) => {
          allParticipants.add(p.name);
        });
      });
    });
  }

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

  // 종료 시간 계산
  const getEndTime = (startTime: string | null): string => {
    if (!startTime || startTime === "종일") return "";

    const time_unit = schedule.time_unit;
    const time = schedule.time;

    if (!time_unit) return "";

    const [h, m] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);

    if (time_unit === "MINUTE") {
      startDate.setMinutes(startDate.getMinutes() + (time || 30));
    } else if (time_unit === "HOUR") {
      startDate.setHours(startDate.getHours() + (time || 1));
    } else if (time_unit === "DAY") {
      startDate.setDate(startDate.getDate() + (time || 1));
    }

    return startDate.toTimeString().slice(0, 5); // "HH:MM"
  };

  return (
    <div className="space-y-12">
      <h3 className="text-head18 text-gray-900">일정 답변 현황</h3>
      <div className="">
        <div ref={timeTableRef} className="relative">
          <ResponseTimeTable
            dates={dates}
            schedule_units={scheduleUnits.schedule_units}
            onSelect={handleTimeSelect}
            schedule_type={
              schedule.type.toLowerCase() as "individual" | "common"
            }
            is_participant_visible={true}
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

      {/* 선택된 시간의 상세 정보 */}
      {selectedUnit && (
        <SelectedUnitInfo
          unit={selectedUnit}
          schedule_type={schedule.type.toLowerCase() as "individual" | "common"}
          allParticipants={allParticipants}
          getEndTime={getEndTime}
        />
      )}
    </div>
  );
}

const SelectedUnitInfo = ({
  unit,
  schedule_type = "individual",
  allParticipants,
  getEndTime,
}: {
  unit: GuestScheduleUnitType;
  schedule_type?: "individual" | "common";
  allParticipants: Set<string>;
  getEndTime: (startTime: string | null) => string;
}) => {
  // TODO: 개인일 때는 default값에 아무 것도 안 뜰 수 있는 상황...
  if (
    schedule_type === "individual" &&
    unit.schedule_participants.length === 0
  ) {
    return null;
  }

  if (schedule_type === "individual") {
    return (
      <div className="space-y-12">
        <p className="text-subtitle16 text-gray-800">
          <span className="text-subtitle16 text-blue-500">
            {unit.schedule_participants[0]?.name}
          </span>
          님의 가능 일정이에요
        </p>
        <div className="p-16 bg-white border border-gray-200 rounded-[8px] drop-shadow-1">
          <div className="flex items-center gap-4 mb-12">
            <IoCalendarClear className="w-24 h-24 text-blue-200" />
            <p className="text-subtitle16 text-gray-800">
              {formatToMonthDate(unit.date)} ({formatToKoreanDay(unit.date)}){" "}
              {formatTimeDisplay(unit.time)}
              {unit.time && getEndTime(unit.time) && " - "}
              {unit.time && getEndTime(unit.time) && getEndTime(unit.time)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 선택된 유닛의 참여자와 미참여자 분리
  const selectedUnitParticipants = unit
    ? unit.schedule_participants.map((p) => p.name)
    : [];
  const nonParticipants = Array.from(allParticipants).filter(
    (name) => !selectedUnitParticipants.includes(name)
  );

  return (
    <div className="p-16 bg-white border border-gray-200 rounded-[8px] drop-shadow-1">
      <div className="flex items-center gap-4 mb-12">
        <IoCalendarClear className="w-24 h-24 text-blue-200" />
        <p className="text-subtitle16 text-gray-800">
          {formatToMonthDate(unit.date)} ({formatToKoreanDay(unit.date)}){" "}
          {formatTimeDisplay(unit.time)}
          {unit.time && getEndTime(unit.time) && " - "}
          {unit.time && getEndTime(unit.time) && getEndTime(unit.time)}
        </p>
      </div>

      {/* 참여자 목록 */}
      <div className="space-y-12">
        {unit.schedule_participants.length > 0 && (
          <div>
            <p className="text-body14 text-gray-600 mb-4">참여</p>
            <div className="flex flex-wrap gap-6">
              {unit.schedule_participants.map((participant, index) => (
                <span
                  key={`participant-${index}`}
                  className="px-10 py-4 bg-gray-100 text-gray-800 rounded-full text-subtitle14"
                >
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 미참여자 목록 */}
        {nonParticipants.length > 0 && (
          <div>
            <p className="text-body14 text-gray-600 mb-4">미참여 (선택안함)</p>
            <div className="flex flex-wrap gap-6">
              {nonParticipants.map((name, index) => (
                <span
                  key={`non-participant-${index}`}
                  className="px-10 py-4 bg-gray-100 text-gray-800 rounded-full text-subtitle14"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
