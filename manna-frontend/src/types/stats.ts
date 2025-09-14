export interface RealtimeStats {
  schedule_count: number;
  participant_count: number;
  schedule_total_count: number;
}

export interface CachedStats extends RealtimeStats {
  cached_at: string;
  expires_at: string;
}
