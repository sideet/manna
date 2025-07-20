import { ScheduleUnit } from "@/types/schedule";
import styles from "./timeTable.module.css";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";

interface TimeTableProps {
  dates?: string[];
  hours?: number[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
  onSelect?: (unitNo: number) => void;
  selectedUnitNos?: number[];
}

/** 일정 응답용 타임테이블 */
export default function TimeTable({
  dates,
  hours,
  schedule_units,
  onSelect,
  selectedUnitNos,
}: TimeTableProps) {
  if (!dates || !hours || !schedule_units) return null;

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

      {hours?.map((hour) => (
        <div key={hour} className={styles.timeRow}>
          <div className={styles.timeCol}>{hour}:00</div>
          {dates?.map((date) => {
            const target = schedule_units[date]?.find(
              (unit) => parseInt(unit.time.slice(0, 2)) === hour
            );
            const isSelected = target
              ? selectedUnitNos?.includes(target.no) ?? false
              : false;
            const hasParticipants =
              (target?.schedule_participants.length ?? 0) > 0;

            return (
              <button
                key={`${date}-${hour}`}
                className={`${styles.cell} ${
                  isSelected ? styles.selected : ""
                } ${hasParticipants ? styles.hasParticipants : ""}`}
                onClick={() => target && onSelect?.(target.no)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
