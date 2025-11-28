"use client";

import { useEffect, useState } from "react";
import { DetailScheduleUnitType } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay, getTimeForComparison } from "@/utils/timeDisplay";
import { IoCalendarClear } from "react-icons/io5";
import { getRatioClass } from "@/utils/style";
import { useToast } from "@/providers/ToastProvider";

interface ManageTimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: DetailScheduleUnitType[] };
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
export default function ManageTimeTable({
  dates,
  schedule_units,
  selectedUnitNos,
  schedule_type,
  time_unit,
  time,
}: ManageTimeTableProps) {
  // 선택된 시간
  const [selectedUnit, setSelectedUnit] =
    useState<DetailScheduleUnitType | null>(null);

  useEffect(() => {
    if (dates && schedule_units && dates.length > 0) {
      // TODO: 임시로 첫날 첫시간 기본값 배치, 기획에 맞게 수정 필요 (단 이 경우 배열 전체 순회가 필요해서 방안 찾기...)
      const firstDate = dates[0];
      const firstUnit = schedule_units[firstDate]?.[0];
      if (firstUnit && !selectedUnit) {
        setSelectedUnit(firstUnit);
      }
    }
  }, [dates, schedule_units, selectedUnit]);

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
  const getUnitByTime = (units: DetailScheduleUnitType[], time: string) =>
    units.find((unit) => getTimeForComparison(unit.time) === time);

  // 모든 참여자 목록 추출 (중복 제거)
  const allParticipants = new Set<string>();
  Object.values(schedule_units).forEach((units) => {
    units.forEach((unit) => {
      unit.schedule_participants.forEach((p) => {
        allParticipants.add(p.name);
      });
    });
  });

  // 참여자별 색상 팔레트 (7개 색상 순환)
  const participantColorClasses = [
    { bg: "bg-blue-500", border: "border-blue-500" },
    { bg: "bg-purple-500", border: "border-purple-500" },
    { bg: "bg-red-500", border: "border-red-500" },
    { bg: "bg-cyan-500", border: "border-cyan-500" },
    { bg: "bg-pink-500", border: "border-pink-500" },
    { bg: "bg-orange-500", border: "border-orange-500" },
    { bg: "bg-sky-500", border: "border-sky-500" },
  ];

  // 참여자별 색상 할당
  const getParticipantColor = (participantNo: number) => {
    const colorIndex = (participantNo - 1) % participantColorClasses.length;
    return participantColorClasses[colorIndex];
  };

  // individual 타입일 때 참여자 색상 클래스 가져오기
  const getIndividualParticipantClass = (
    unit: DetailScheduleUnitType | null
  ): string => {
    if (!unit || unit.schedule_participants.length === 0) {
      return "bg-gray-200 border border-gray-200";
    }
    // 첫 번째 참여자의 색상 사용
    const firstParticipant = unit.schedule_participants[0];
    const colorClasses = getParticipantColor(firstParticipant.no);
    return `${colorClasses.bg} ${colorClasses.border}`;
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
              // memo: common인 경우 ratioClass, individual인 경우 참여자별 색상
              const ratioClass = getRatioClass(count, allParticipants.size);
              const individualParticipantClass = getIndividualParticipantClass(
                unit || null
              );

              return (
                <button
                  key={`${date}-${time}`}
                  className={`flex-1 min-w-64 h-30 rounded-[4px] transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500 border border-blue-500"
                      : schedule_type === "individual" && hasParticipants
                      ? individualParticipantClass
                      : schedule_type === "common"
                      ? ratioClass
                      : "bg-gray-200 border border-gray-200"
                  } ${"hover:bg-blue-50 cursor-pointer"}`}
                  onClick={() => {
                    if (unit) {
                      setSelectedUnit(unit);
                    }
                  }}
                ></button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 선택된 시간의 상세 정보 */}
      {selectedUnit && (
        <SelectedUnitInfo
          unit={selectedUnit}
          schedule_type={schedule_type}
          time_unit={time_unit}
          time={time}
          allParticipants={allParticipants}
        />
      )}
    </div>
  );
}

const SelectedUnitInfo = ({
  unit,
  schedule_type = "individual",
  time_unit = "DAY",
  time = 1,
  allParticipants,
}: {
  unit: DetailScheduleUnitType;
  schedule_type?: "individual" | "common";
  time_unit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
  allParticipants: Set<string>;
}) => {
  const { showToast } = useToast();

  // 종료 시간 계산
  const getEndTime = (startTime: string | null): string => {
    if (!startTime || startTime === "종일") return "";

    if (!time_unit) return "";

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
          <button
            onClick={() => {
              showToast("확정 기능은 곧 출시될 예정이에요!", "warning");
            }}
            className="
          w-full h-44 rounded-[8px] text-subtitle16 bg-[#fff] border border-blue-500 text-blue-500
          "
          >
            이 일정 확정하기
          </button>
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

        <button
          onClick={() => {
            showToast("확정 기능은 곧 출시될 예정이에요!", "warning");
          }}
          className="
          w-full h-44 rounded-[8px] text-subtitle16 bg-[#fff] border border-blue-500 text-blue-500
          "
        >
          이 일정 확정하기
        </button>
      </div>
    </div>
  );
};
