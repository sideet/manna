"use client";

import { GuestScheduleUnitType } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { getRatioClass } from "@/utils/style";
import { formatTimeDisplay, getTimeForComparison } from "@/utils/timeDisplay";

interface ResponseTimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: GuestScheduleUnitType[] };
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

  // 모든 참여자 목록 추출 (중복 제거)
  const allParticipants = new Set<string>();
  Object.values(schedule_units).forEach((units) => {
    units.forEach((unit) => {
      unit.schedule_participants.forEach((p) => {
        allParticipants.add(p.name);
      });
    });
  });

  // 시간당, 날짜별 unit 조회
  const getUnitByTime = (units: GuestScheduleUnitType[], time: string) =>
    units.find((unit) => getTimeForComparison(unit.time) === time);

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
              const ratioClass = is_participant_visible
                ? getRatioClass(count, allParticipants.size)
                : "bg-gray-200 border border-gray-200";

              return (
                <button
                  key={`${date}-${time}`}
                  // disabled={
                  //   schedule_type === "individual" &&
                  //   hasParticipants &&
                  //   onSelect
                  // }
                  className={`flex-1 min-w-64 h-30 rounded-[4px] transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-500 border border-blue-500"
                      : schedule_type === "individual" &&
                        hasParticipants &&
                        onSelect
                      ? "bg-gray-300 border border-gray-300 cursor-default relative overflow-hidden"
                      : ratioClass
                  } ${
                    schedule_type === "individual" &&
                    hasParticipants &&
                    onSelect
                      ? ""
                      : onSelect
                      ? "hover:bg-blue-50 cursor-pointer"
                      : ""
                  }`}
                  onClick={() => {
                    if (target) {
                      onSelect?.(target.no);
                    }
                  }}
                >
                  {/* disabled 상태일 때 대각선 (onSelect가 있을 때만 표시) */}
                  {schedule_type === "individual" &&
                    hasParticipants &&
                    onSelect && (
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
