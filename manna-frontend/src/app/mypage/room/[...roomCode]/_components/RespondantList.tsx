import { ScheduleParticipant } from "@/types/schedule";
import styles from "./repondantList.module.css";
import { useState } from "react";
import { formatTimeDisplay } from "@/utils/timeDisplay";

export default function RespondantList({
  schedule_participants,
}: {
  schedule_participants: ScheduleParticipant[];
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /** 응답자 상세 내용 조회 */
  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      {schedule_participants.map((participant) => {
        const isExpanded = expandedId === participant.no;
        const groupedTimes = participant.participation_times.reduce(
          (acc, time) => {
            const date = time.schedule_unit.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(formatTimeDisplay(time.schedule_unit.time));
            return acc;
          },
          {} as Record<string, string[]>
        );

        return (
          <div key={participant.no} className={styles.participant}>
            <div
              className={styles.summary}
              onClick={() => toggleExpand(participant.no)}
            >
              <span className={styles.name}>{participant.name}</span>
              <span className={styles.count}>
                {participant.participation_times.length}개 시간대 선택
              </span>
            </div>

            {isExpanded && (
              <div className={styles.details}>
                <div className={styles.info}>
                  <div>번호: {participant.phone}</div>
                  <div>이메일: {participant.email}</div>
                  <div>메모: {participant.memo || "-"}</div>
                </div>
                <div className={styles.times}>
                  {Object.entries(groupedTimes).map(([date, times]) => (
                    <div key={date} className={styles.dayRow}>
                      <div className={styles.date}>{date}</div>
                      <div className={styles.timeSlots}>
                        {times.map((t) => (
                          <span key={t} className={styles.timeBox}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
