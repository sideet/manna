"use client";

import { DetailScheduleUnitType } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay, getTimeForComparison } from "@/utils/timeDisplay";
import { getRatioClass } from "@/utils/style";

interface ManageTimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: DetailScheduleUnitType[] };
  onSelect?: (unitNo: number) => void;
  selectedUnitNos?: number[];
  schedule_type?: "individual" | "common";
  /** 타 참여자 정보 활성화 여부 */
  is_participant_visible?: boolean;
  /** 무한스크롤용 sentinel ref */
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}

/** 관리자 일정 조회용 타임테이블 */
export default function ManageTimeTable({
  dates,
  schedule_units,
  onSelect,
  selectedUnitNos,
  schedule_type,
  sentinelRef,
}: ManageTimeTableProps) {

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
      <div className="w-full overflow-x-auto py-20 pl-16 bg-gray-100 rounded-[8px] relative" ref={sentinelRef ? undefined : undefined}>
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
          {/* scroll 끝을 감지하는 sentinel - 헤더 행의 마지막에 배치 */}
          {sentinelRef && (
            <div
              ref={sentinelRef}
              className="sentinel inline-block w-1 h-31 pointer-events-none flex-shrink-0"
              style={{ minWidth: "1px" }}
            />
          )}
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
                  } ${onSelect ? "hover:bg-blue-50 cursor-pointer" : ""}`}
                  onClick={() => {
                    if (unit && onSelect) {
                      onSelect(unit.no);
                    }
                  }}
                ></button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
