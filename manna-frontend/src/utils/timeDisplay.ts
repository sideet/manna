/**
 * 시간을 표시용 문자열로 변환
 * @param time - 시간 문자열 (HH:mm:ss 형식)
 * @returns 표시용 시간 문자열 또는 "종일"
 */
export function formatTimeDisplay(time?: string | null): string {
  if (!time) return "종일";
  return time.slice(0, 5); // "HH:MM"
}

/**
 * 시간 비교를 위한 함수
 * @param time - 시간 문자열 (HH:mm:ss 형식)
 * @returns 비교용 시간 문자열 또는 "종일"
 */
export function getTimeForComparison(time?: string | null): string {
  if (!time) return "종일";
  return time.slice(0, 5); // "HH:MM"
}
