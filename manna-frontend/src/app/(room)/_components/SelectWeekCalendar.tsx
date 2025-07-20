"use client";
import { useMemo, useState } from "react";
import {
  addDays,
  format,
  isSameWeek,
  parse,
  startOfWeek,
  subWeeks,
} from "date-fns";
import styles from "./selectWeekCalendar.module.css";

interface Week {
  dates: Date[];
}

interface SelectWeekCalendarProps {
  startDate: string; // "2025-07-19"
  endDate: string; // "2025-07-23"
  onSelectWeek?: (week: Date[]) => void;
}

// TODO: 추후 주간 선택뷰 추가
export default function SelectWeekCalendar({
  startDate,
  endDate,
  onSelectWeek,
}: SelectWeekCalendarProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);

  const calendarWeeks = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = parse(startDate, "yyyy-MM-dd HH:mm:ss", new Date());
    const end = parse(endDate, "yyyy-MM-dd HH:mm:ss", new Date());

    const calendarStart = startOfWeek(subWeeks(start, 1), { weekStartsOn: 0 });
    const weeks: Week[] = [];

    for (let i = 0; i < 6; i++) {
      const dates = Array.from({ length: 7 }, (_, j) =>
        addDays(calendarStart, i * 7 + j)
      );
      weeks.push({ dates });
    }

    return weeks;
  }, [startDate, endDate]);

  const handleWeekClick = (week: Date[]) => {
    setSelectedWeekStart(week[0]);
    onSelectWeek?.(week);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className={styles.dayLabel}>
            {day}
          </div>
        ))}
      </div>
      {calendarWeeks?.map((week, i) => (
        <div
          key={i}
          className={`${styles.weekRow} ${
            selectedWeekStart && isSameWeek(selectedWeekStart, week.dates[0])
              ? styles.selectedWeek
              : ""
          }`}
          onClick={() => handleWeekClick(week.dates)}
        >
          {week.dates.map((date) => (
            <div key={date.toISOString()} className={styles.dateCell}>
              {format(date, "d")}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
