"use client";

import { useState } from "react";
import { ScheduleUnit } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay, getTimeForComparison } from "@/utils/timeDisplay";
import { IoCalendarClear } from "react-icons/io5";

interface TimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
  onSelect?: (unitNo: number) => void;
  selectedUnitNos?: number[];
  schedule_type?: "individual" | "common";
  /** 타 참여자 정보 활성화 여부 */
  is_participant_visible?: boolean;
  /** 일정 정보 (시간 범위 계산용) */
  time_unit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
}

/** 일정 응답용 타임테이블 */
export default function TimeTable({
  dates,
  schedule_units,
  onSelect,
  selectedUnitNos,
  schedule_type,
  is_participant_visible,
  time_unit,
  time,
}: TimeTableProps) {
  // 선택된 시간
  const [selectedUnit, setSelectedUnit] = useState<ScheduleUnit | null>(null);
  if (!dates || !schedule_units) return null;

  // 시간 단위 추출 (정렬 포함)
  const allTimes = Array.from(
    new Set(
      dates.flatMap((date) =>
        (schedule_units[date] ?? []).map((unit) => formatTimeDisplay(unit.time))
      )
    )
  ).sort((a, b) => {
    // "종일"은 맨 앞으로 정렬
    if (a === "종일") return -1;
    if (b === "종일") return 1;
    return a.localeCompare(b);
  });

  // 시간당, 날짜별 unit 조회
  const getUnitByTime = (units: ScheduleUnit[], time: string) =>
    units.find((unit) => getTimeForComparison(unit.time) === time);

  // 참여자 수에 따라 클래스 적용 (파란색 그라디언트)
  const getRatioClass = (count: number): string => {
    if (!is_participant_visible) return "bg-gray-200 border border-gray-200";

    // 참여자 수에 따라 파란색 그라디언트 적용 (TODO: 응답자 인원에 따라 수정 필요. figma)
    if (count >= 5) return "bg-blue-900 border border-blue-900";
    if (count === 4) return "bg-blue-700 border border-blue-700";
    if (count === 3) return "bg-blue-500 border border-blue-500";
    if (count === 2) return "bg-blue-300 border border-blue-300";
    if (count === 1) return "bg-blue-100 border border-blue-100";
    return "bg-gray-200 border border-gray-200";
  };

  // 모든 참여자 목록 추출 (중복 제거)
  const allParticipants = new Set<string>();
  Object.values(schedule_units).forEach((units) => {
    units.forEach((unit) => {
      unit.schedule_participants.forEach((p) => {
        allParticipants.add(p.name);
      });
    });
  });

  // 선택된 유닛의 참여자와 미참여자 분리
  const selectedUnitParticipants = selectedUnit
    ? selectedUnit.schedule_participants.map((p) => p.name)
    : [];
  const nonParticipants = Array.from(allParticipants).filter(
    (name) => !selectedUnitParticipants.includes(name)
  );

  // 종료 시간 계산
  const getEndTime = (startTime: string | null): string => {
    if (!startTime || startTime === "종일") return "";

    if (!time_unit || !time) return "";

    const [h, m] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);

    if (time_unit === "MINUTE") {
      startDate.setMinutes(startDate.getMinutes() + 30);
    } else if (time_unit === "HOUR") {
      startDate.setHours(startDate.getHours() + (time || 1));
    } else if (time_unit === "DAY") {
      startDate.setDate(startDate.getDate() + 1);
    }

    return startDate.toTimeString().slice(0, 5); // "HH:MM"
  };

  return (
    <div className="w-full space-y-12">
      {/* 캘린더 */}
      <div className="w-full overflow-x-auto py-20 pl-16 bg-gray-100 rounded-[8px]">
        {/* 헤더 행 */}
        <div className="flex gap-2 justify-start h-31">
          <div className="w-36 min-w-36 sticky left-0 z-10"></div>
          {dates?.map((date) => (
            <div
              key={date}
              className="flex-1 min-w-64 h-31 text-center text-caption12-1 text-gray-600 bg-white
              flex items-center justify-center rounded-[7px]
              "
            >
              {formatToMonthDate(date)} ({formatToKoreanDay(date)})
            </div>
          ))}
        </div>

        {/* 시간 행 */}
        {allTimes?.map((time) => (
          <div key={time} className="flex gap-2 items-center h-36 min-h-36">
            {/* 시간 라벨 (sticky) */}
            <div className="w-36 min-w-36 text-left text-caption12-2 sticky left-0 z-10 text-gray-500">
              {time}
            </div>
            {dates?.map((date) => {
              const target = schedule_units[date]?.find(
                (unit) => getTimeForComparison(unit.time) === time
              );
              const isSelected = target
                ? selectedUnitNos?.includes(target.no) ?? false
                : false;
              const hasParticipants =
                (target?.schedule_participants.length ?? 0) > 0;

              const unit = getUnitByTime(schedule_units[date], time);
              const count = unit?.schedule_participants.length ?? 0;
              const ratioClass = getRatioClass(count);

              return (
                <button
                  key={`${date}-${time}`}
                  disabled={schedule_type === "individual" && hasParticipants}
                  className={`flex-1 min-w-64 h-30 rounded-[4px] transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500 border border-blue-500"
                      : schedule_type === "individual" && hasParticipants
                      ? "bg-gray-300 border border-gray-300 cursor-default relative overflow-hidden"
                      : ratioClass
                  } ${
                    schedule_type === "individual" && hasParticipants
                      ? ""
                      : "hover:bg-blue-50 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (unit) {
                      setSelectedUnit(unit);
                    }
                    if (target) {
                      onSelect?.(target.no);
                    }
                  }}
                >
                  {/* disabled 상태일 때 대각선 */}
                  {schedule_type === "individual" && hasParticipants && (
                    <div className="absolute top-1/2 left-0 w-[141%] h-px bg-gray-400 transform rotate-[160deg] origin-center -translate-x-[20%]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 선택된 시간의 상세 정보 */}
      {is_participant_visible && selectedUnit && (
        <div className="p-16 bg-white border border-gray-200 rounded-[8px] drop-shadow-1">
          <div className="flex items-center gap-6 mb-12">
            <IoCalendarClear className="w-24 h-24 text-blue-200" />
            <p className="text-subtitle16 text-gray-800">
              {formatToMonthDate(selectedUnit.date)} (
              {formatToKoreanDay(selectedUnit.date)}){" "}
              {formatTimeDisplay(selectedUnit.time)}
              {selectedUnit.time && getEndTime(selectedUnit.time) && " - "}
              {selectedUnit.time &&
                getEndTime(selectedUnit.time) &&
                getEndTime(selectedUnit.time)}
            </p>
          </div>

          {/* 참여자 목록 */}
          {selectedUnitParticipants.length > 0 && (
            <div className="mb-16">
              <p className="text-body14 text-gray-600 mb-4">참여</p>
              <div className="flex flex-wrap gap-6">
                {selectedUnitParticipants.map((name, index) => (
                  <span
                    key={`participant-${index}`}
                    className="px-10 py-4 bg-gray-100 text-gray-800 rounded-full text-subtitle14"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 미참여자 목록 */}
          {nonParticipants.length > 0 && (
            <div>
              <p className="text-body14 text-gray-600 mb-4">
                미참여 (선택안함)
              </p>
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
      )}
    </div>
  );
}
