"use client";

import { DetailScheduleUnitType } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import { IoCalendarClear } from "react-icons/io5";
import { useToast } from "@/providers/ToastProvider";

interface SelectedTimeTableInfoProps {
  unit: DetailScheduleUnitType;
  schedule_type: "individual" | "common";
  time_unit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
  allParticipants: Set<string>;
}

/** 선택된 시간의 상세 정보 컴포넌트 */
export default function SelectedTimeTableInfo({
  unit,
  schedule_type,
  time_unit = "DAY",
  time = 1,
  allParticipants,
}: SelectedTimeTableInfoProps) {
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

  // individual 타입 UI
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
            className="w-full h-44 rounded-[8px] text-subtitle16 bg-[#fff] border border-blue-500 text-blue-500"
          >
            이 일정 확정하기
          </button>
        </div>
      </div>
    );
  }

  // common 타입: 참여자와 미참여자 분리
  const selectedUnitParticipants = unit.schedule_participants.map((p) => p.name);
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
          className="w-full h-44 rounded-[8px] text-subtitle16 bg-[#fff] border border-blue-500 text-blue-500"
        >
          이 일정 확정하기
        </button>
      </div>
    </div>
  );
}

