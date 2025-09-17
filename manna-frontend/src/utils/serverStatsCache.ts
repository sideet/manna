// import { RealtimeStats, CachedStats } from "@/types/stats";

// 메모리 기반 캐시 (서버사이드)
// let memoryCache: CachedStats | null = null;
// const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
// memo. 기존 CACHE_DURATION: 2분 동안은 캐시 만료 전엔 새 요청이 와도 API를 다시 안 보냄!!!
// memo. 추후 페이지에 머무는 상황에 최신 데이터로 폴링을 원한다면 소켓이나 setInterval을 사용할 것
// TODO: 추후 작업 후 이 파일은 제거 / 혹은 서버 캐싱 필요시 주석 해제 후 사용

// export function getServerCachedStats(): CachedStats | null {
//   if (!memoryCache) return null;

//   const now = new Date().getTime();
//   const expiresAt = new Date(memoryCache.expires_at).getTime();

//   if (now > expiresAt) {
//     memoryCache = null;
//     return null;
//   }

//   return memoryCache;
// }

// export function setServerCachedStats(stats: RealtimeStats): void {
//   const now = new Date();
//   const expiresAt = new Date(now.getTime() + CACHE_DURATION);

//   memoryCache = {
//     ...stats,
//     cached_at: now.toISOString(),
//     expires_at: expiresAt.toISOString(),
//   };
// }
