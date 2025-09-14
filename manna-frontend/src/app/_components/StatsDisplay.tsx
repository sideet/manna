"use client";

import { useEffect, useState } from "react";
import { RealtimeStats } from "@/types/stats";
import { getRealtimeStats } from "@/app/api/stats";
import styles from "./statsDisplay.module.css";

export default function StatsDisplay() {
  const [stats, setStats] = useState<RealtimeStats>({
    schedule_count: 0,
    participant_count: 0,
    schedule_total_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getRealtimeStats();
        setStats(data);
      } catch (error) {
        console.error("통계 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        <div className={`${styles.statBubble} ${styles.statBubble1}`}>
          <p>통계를 불러오는 중...</p>
        </div>
        <div className={`${styles.statBubble} ${styles.statBubble2}`}>
          <p>잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      <div className={`${styles.statBubble} ${styles.statBubble1}`}>
        <p>
          지금까지{" "}
          <span className={styles.highlight}>
            {stats.schedule_total_count.toLocaleString()}건
          </span>
          의 일정이 생성되었어요!
        </p>
      </div>
      <div className={`${styles.statBubble} ${styles.statBubble2}`}>
        <p>
          지난 일주일간{" "}
          <span className={styles.highlight}>
            {stats.participant_count.toLocaleString()}명
          </span>
          이 일정에 응답했어요!
        </p>
      </div>
    </div>
  );
}
