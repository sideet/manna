import { RealtimeStats, CachedStats } from "@/types/stats";

// 메모리 기반 캐시 (서버사이드)
let memoryCache: CachedStats | null = null;
// const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
const CACHE_DURATION = 1 * 1 * 60 * 1000; // 1분 (test용)

export function getServerCachedStats(): CachedStats | null {
  if (!memoryCache) return null;

  const now = new Date().getTime();
  const expiresAt = new Date(memoryCache.expires_at).getTime();

  if (now > expiresAt) {
    memoryCache = null;
    return null;
  }

  return memoryCache;
}

export function setServerCachedStats(stats: RealtimeStats): void {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION);

  memoryCache = {
    ...stats,
    cached_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
}
