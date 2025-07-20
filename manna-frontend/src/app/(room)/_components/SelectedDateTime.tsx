import { ScheduleUnit } from "@/types/schedule";
import styles from "./selectedDateTime.module.css";

/** 응답자가 선택한 일정 일시 정보 */
export default function SelectedDateTime({
  selectedUnitNos,
  dates,
  schedule_units,
}: {
  selectedUnitNos?: number[];
  dates?: string[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
}) {
  if (!dates || !schedule_units) return null;
  if (!selectedUnitNos || selectedUnitNos.length === 0) {
    return <p>선택한 시간이 없습니다.</p>;
  }
  return (
    <div className={styles.selectedDateBox}>
      {dates.map((date) => {
        const units = schedule_units[date].filter((unit) =>
          selectedUnitNos.includes(unit.no)
        );
        if (units.length === 0) return null;

        return (
          <div key={date} className={styles.selectedDateItem}>
            <p>
              {new Date(date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </p>
            <ul>
              {units.map((unit) => {
                const hour = unit.time.slice(0, 2);
                const nextHour = String(Number(hour) + 1).padStart(2, "0");
                return (
                  <li key={unit.no}>
                    {hour}:00 - {nextHour}:00
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
