import { RealtimeStats, CachedStats } from "@/types/stats";

const CACHE_KEY = "realtime_stats";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
// const CACHE_DURATION = 1 * 1 * 60 * 1000; // 1분 (test용)

export function getCachedStats(): CachedStats | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedStats = JSON.parse(cached);
    const now = new Date().getTime();
    const expiresAt = new Date(parsed.expires_at).getTime();

    if (now > expiresAt) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("캐시된 통계 데이터 파싱 실패:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

export function setCachedStats(stats: RealtimeStats): void {
  if (typeof window === "undefined") return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION);

  const cachedStats: CachedStats = {
    ...stats,
    cached_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedStats));
  } catch (error) {
    console.error("통계 데이터 캐싱 실패:", error);
  }
}
