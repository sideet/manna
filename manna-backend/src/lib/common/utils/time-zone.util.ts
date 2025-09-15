import { DateTime } from 'luxon';

export const DEFAULT_TIME_ZONE = 'Asia/Seoul';

export function convertToZonedISODateTime(
  date: Date,
  tz = DEFAULT_TIME_ZONE
): string {
  return DateTime.fromJSDate(new Date(date))
    .setZone(tz)
    .toFormat('yyyy-MM-dd HH:mm:ss');
}

export function convertToZonedISODate(
  date: Date,
  tz = DEFAULT_TIME_ZONE
): string {
  return DateTime.fromJSDate(new Date(date)).setZone(tz).toFormat('yyyy-MM-dd');
}

export function convertDate<T>(input: T, tz = DEFAULT_TIME_ZONE): T {
  if (!input && input === null) return input;

  if (input instanceof Date) {
    return convertToZonedISODateTime(input, tz) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((v) => convertDate(v, tz)) as unknown as T;
  }

  if (typeof input === 'object') {
    const output: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      output[k] = convertDate(v, tz);
    }
    return output as T;
  }

  return input;
}
