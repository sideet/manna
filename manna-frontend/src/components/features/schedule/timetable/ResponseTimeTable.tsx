"use client";

import { ScheduleUnit } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay, getTimeForComparison } from "@/utils/timeDisplay";

interface ResponseTimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
  onSelect?: (unitNo: number) => void;
  selectedUnitNos?: number[];
  schedule_type?: "individual" | "common";
  /** 타 참여자 정보 활성화 여부 */
  is_participant_visible?: boolean;
}

/** 일정 응답용 타임테이블 */
export default function ResponseTimeTable({
  dates,
  schedule_units,
  onSelect,
  selectedUnitNos,
  schedule_type,
  is_participant_visible,
}: ResponseTimeTableProps) {
  // 선택된 시간
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
    </div>
  );
}
