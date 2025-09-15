import serverApi from "./server";
import { RealtimeStats } from "@/types/stats";
import {
  getServerCachedStats,
  setServerCachedStats,
} from "@/utils/serverStatsCache";

export async function getServerRealtimeStats(): Promise<RealtimeStats> {
  // 서버사이드 캐시 확인
  const cached = getServerCachedStats();
  if (cached) {
    return {
      schedule_count: cached.schedule_count,
      participant_count: cached.participant_count,
      schedule_total_count: cached.schedule_total_count,
    };
  }

  try {
    // API 호출
    const response = await serverApi.get<RealtimeStats>(
      "/schedule/realtime/ranking",
      {
        headers: { skipAuth: true },
      }
    );

    const stats = response.data;

    // 서버사이드 캐시에 저장
    setServerCachedStats(stats);

    return stats;
  } catch (error) {
    console.error("통계 데이터 조회 실패:", error);

    // 에러 시 기본값 반환
    return {
      schedule_count: 0,
      participant_count: 0,
      schedule_total_count: 0,
    };
  }
}
