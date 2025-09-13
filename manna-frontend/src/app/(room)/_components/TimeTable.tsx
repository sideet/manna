import { ScheduleUnit } from "@/types/schedule";
import styles from "./timeTable.module.css";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { useState } from "react";

interface TimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
  onSelect?: (unitNo: number) => void;
  selectedUnitNos?: number[];
  schedule_type?: "individual" | "common";
  /** 타 참여자 정보 활성화 여부 */
  is_participant_visible?: boolean;
}

/** 일정 응답용 타임테이블 */
export default function TimeTable({
  dates,
  schedule_units,
  onSelect,
  selectedUnitNos,
  schedule_type,
  is_participant_visible,
}: TimeTableProps) {
  // 선택된 시간
  const [selectedUnit, setSelectedUnit] = useState<ScheduleUnit | null>(null);
  if (!dates || !schedule_units) return null;

  // 시간 단위 추출 (정렬 포함)
  const allTimes = Array.from(
    new Set(
      dates.flatMap((date) =>
        (schedule_units[date] ?? []).map((unit) => unit.time.slice(0, 5))
      )
    )
  ).sort();

  // 시간당, 날짜별 unit 조회
  const getUnitByTime = (units: ScheduleUnit[], time: string) =>
    units.find((unit) => unit.time.slice(0, 5) === time);

  // 참여자 비율에 따라 클래스 적용
  const getRatioClass = (count: number, total: number): string => {
    const ratio = total === 0 ? 0 : (count / total) * 100;
    if (ratio === 100) return "bg-100";
    if (ratio >= 75) return "bg-75";
    if (ratio >= 50) return "bg-50";
    if (ratio >= 25) return "bg-25";
    if (ratio > 0) return "bg-10";
    return "bg-0";
  };

  // 최대 참여 인원 수 계산
  const maxParticipants = Math.max(
    ...Object.values(schedule_units).flatMap((units) =>
      units.map((u) => u.schedule_participants.length)
    ),
    0
  );

  return (
    <>
      <div className={styles.timeTableWrapper}>
        <div className={styles.headerRow}>
          <div className={styles.timeCol}></div>
          {dates?.map((date) => (
            <div key={date} className={styles.dateCol}>
              {formatToMonthDate(date)} {formatToKoreanDay(date)}
            </div>
          ))}
        </div>

        {allTimes?.map((time) => (
          <div key={time} className={styles.timeRow}>
            <div className={styles.timeCol}>{time}</div>
            {dates?.map((date) => {
              const target = schedule_units[date]?.find(
                (unit) => unit.time.slice(0, 5) === time
              );
              const isSelected = target
                ? selectedUnitNos?.includes(target.no) ?? false
                : false;
              const hasParticipants =
                (target?.schedule_participants.length ?? 0) > 0;

              const unit = getUnitByTime(schedule_units[date], time);
              const count = unit?.schedule_participants.length ?? 0;
              const ratioClass = getRatioClass(count, maxParticipants);
              return (
                <button
                  key={`${date}-${time}`}
                  disabled={schedule_type === "individual" && hasParticipants}
                  className={`${styles.cell} ${
                    isSelected ? styles.selected : ""
                  } ${
                    schedule_type === "individual" && hasParticipants
                      ? styles.disabledTime
                      : ""
                  } ${
                    is_participant_visible ? styles[ratioClass] : styles["bg-0"]
                  }
                `}
                  onClick={() => {
                    if (unit) {
                      setSelectedUnit(unit);
                    }
                    if (target) {
                      onSelect?.(target.no);
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {is_participant_visible && selectedUnit && (
        <div className={styles.selectedInfoBox}>
          <p>
            {selectedUnit.date} {selectedUnit.time.slice(0, 5)} 참여자 (
            {selectedUnit.schedule_participants.length})
          </p>
          <div className={styles.participantList}>
            {selectedUnit.schedule_participants.map((p) => (
              <span key={p.no}>{p.name}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
