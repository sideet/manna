import { ScheduleUnit } from "@/types/schedule";
import styles from "./timeTable.module.css";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";

interface TimeTableProps {
  dates?: string[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
  onSelect?: (unitNo: number) => void;
  selectedUnitNos?: number[];
  schedule_type?: "individual" | "common";
}

/** 일정 응답용 타임테이블 */
export default function TimeTable({
  dates,
  schedule_units,
  onSelect,
  selectedUnitNos,
  schedule_type,
}: TimeTableProps) {
  if (!dates || !schedule_units) return null;

  // 시간 단위 추출 (정렬 포함)
  const allTimes = Array.from(
    new Set(
      dates.flatMap((date) =>
        (schedule_units[date] ?? []).map((unit) => unit.time.slice(0, 5))
      )
    )
  ).sort();

  return (
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
                }`}
                onClick={() => target && onSelect?.(target.no)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
