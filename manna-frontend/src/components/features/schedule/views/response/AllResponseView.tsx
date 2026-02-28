"use client";

import { useState, useCallback, useEffect } from "react";
import { useScheduleUnits } from "../../hooks/useScheduleUnits";
import ResponseTimeTable from "../../timetable/ResponseTimeTable";
import {
  GuestScheduleResponseType,
  GuestScheduleUnitType,
} from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import { IoCalendarClear } from "react-icons/io5";
import { getScheduleResponse } from "@/utils/scheduleResponseStorage";
import { SectionLoading, InlineLoading } from "@/components/base/Loading";

interface AllResponseViewProps {
  schedule: GuestScheduleResponseType;
}

/** 일정 답변 현황 컴포넌트 (응답자 공개 O) */
export default function AllResponseView({ schedule }: AllResponseViewProps) {
  const [selectedUnit, setSelectedUnit] =
    useState<GuestScheduleUnitType | null>(null);
  const [mySelectedUnitNos, setMySelectedUnitNos] = useState<number[]>([]);

  // 로컬스토리지에서 내가 선택한 시간 가져오기
  useEffect(() => {
    const savedResponse = getScheduleResponse(schedule.code);
    if (savedResponse) {
      setMySelectedUnitNos(savedResponse.selectedUnitNos);
    }
  }, [schedule.code]);

  const {
    scheduleUnits,
    dates,
    isLoading,
    isLoadingMore,
    timeTableRef,
    sentinelRef,
  } = useScheduleUnits({
    scheduleNo: schedule.no,
    startDate: schedule.start_date,
    endDate: schedule.end_date,
  });

  // 시간 영역 클릭 핸들러
  const handleTimeSelect = useCallback(
    (unitNo: number) => {
      if (!scheduleUnits) return;

      // 모든 날짜의 units를 순회하며 해당 unitNo를 찾기
      for (const date of Object.keys(scheduleUnits)) {
        const unit = scheduleUnits[date].find((u) => u.no === unitNo);
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
    Object.values(scheduleUnits).forEach((units) => {
      units.forEach((unit) => {
        unit.schedule_participants.forEach((p) => {
          allParticipants.add(p.name);
        });
      });
    });
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

  if (isLoading) {
    return <SectionLoading message="일정 정보를 불러오는 중..." />;
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
      <h3 className="text-head18 text-gray-900">일정 답변 현황</h3>
      <div className="">
        <div ref={timeTableRef} className="relative">
          <ResponseTimeTable
            dates={dates}
            schedule_units={scheduleUnits}
            onSelect={handleTimeSelect}
            selectedUnitNos={mySelectedUnitNos}
            schedule_type={
              schedule.type.toLowerCase() as "individual" | "common"
            }
            is_participant_visible={true}
          />
          {/* scroll 끝을 감지하는 sentinel */}
          <div ref={sentinelRef} className="sentinel w-1 h-10" />
        </div>
        {isLoadingMore && (
          <div className="flex justify-center mt-8">
            <InlineLoading message="다음 주 일정을 불러오는 중..." />
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
