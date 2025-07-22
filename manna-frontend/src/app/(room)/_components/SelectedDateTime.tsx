import { ScheduleUnit } from "@/types/schedule";
import styles from "./selectedDateTime.module.css";

/** 응답자가 선택한 일정 일시 정보 */
export default function SelectedDateTime({
  selectedUnitNos,
  dates,
  schedule_units,
  time_unit = "hour",
  time = 1,
}: {
  selectedUnitNos?: number[];
  dates?: string[];
  schedule_units?: { [date: string]: ScheduleUnit[] };
  time_unit?: "minute" | "hour" | "day";
  time?: number;
}) {
  if (!dates || !schedule_units) return null;
  if (!selectedUnitNos || selectedUnitNos.length === 0) {
    return <p>선택한 시간이 없습니다.</p>;
  }

  /** 일정 간격 마지막 시간 */
  const getEndTime = (
    start: string,
    unit: "minute" | "hour" | "day",
    value: number
  ) => {
    const [h, m] = start.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);

    if (unit === "minute") startDate.setMinutes(startDate.getMinutes() + 30);
    else if (unit === "hour") startDate.setHours(startDate.getHours() + value);
    else if (unit === "day") startDate.setDate(startDate.getDate() + 1);

    return startDate.toTimeString().slice(0, 5); // "HH:MM"
  };

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
                const start = unit.time.slice(0, 5);
                const end = getEndTime(start, time_unit, time);
                return (
                  <li key={unit.no}>
                    {start} - {end}
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
