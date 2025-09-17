import serverApi from "./server";
import { RealtimeStats } from "@/types/stats";

export async function getServerRealtimeStats(): Promise<RealtimeStats> {
  try {
    // API 호출
    const response = await serverApi.get<RealtimeStats>(
      "/schedule/realtime/ranking",
      {
        headers: { skipAuth: true },
      }
    );

    const stats = response.data;
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
