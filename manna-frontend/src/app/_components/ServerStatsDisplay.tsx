import { RealtimeStats } from "@/types/stats";
import styles from "./statsDisplay.module.css";

interface ServerStatsDisplayProps {
  stats: RealtimeStats;
}

export default function ServerStatsDisplay({ stats }: ServerStatsDisplayProps) {
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
