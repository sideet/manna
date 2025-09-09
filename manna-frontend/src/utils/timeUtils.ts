import { addMinutes } from "date-fns";

/**
 * 생성 간격을 분 단위로 변환
 */
export const getIntervalInMinutes = (
  selectedInterval: string,
  customInterval: string
): number => {
  if (selectedInterval === "종일") return 1440; // 24시간 = 1440분
  if (selectedInterval === "30분") return 30;
  if (selectedInterval === "1시간") return 60;
  if (selectedInterval === "2시간") return 120;
  if (selectedInterval === "3시간") return 180;
  if (selectedInterval === "기타" && customInterval) {
    return Number(customInterval) * 60;
  }
  return 60; // 기본값
};

/**
 * 시작시간 선택 옵션 생성 (30분 간격으로 00:00~최대시간까지)
 */
export const buildStartTimeOptions = (intervalMinutes: number): Date[] => {
  const options: Date[] = [];
  const maxTime = new Date();
  maxTime.setHours(24, 0, 0, 0); // 24:00
  const maxStartTime = addMinutes(maxTime, -intervalMinutes);

  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0); // 00:00부터 시작

  while (cursor <= maxStartTime) {
    options.push(new Date(cursor));
    cursor = addMinutes(cursor, 30); // 30분 간격
  }

  return options;
};

/**
 * 종료시간 선택 옵션 생성 (시작시간 기준)
 */
export const buildEndTimeOptions = (
  startTime: Date,
  intervalMinutes: number
): Date[] => {
  const options: Date[] = [];
  const endOfDay = new Date(startTime);
  endOfDay.setHours(23, 59, 59, 999);

  let cursor = new Date(startTime);
  cursor = addMinutes(cursor, intervalMinutes); // 첫 번째 종료시간

  while (cursor <= endOfDay) {
    if (addMinutes(cursor, intervalMinutes - 1) > endOfDay) {
      // 간격을 더했을 때 자정이 넘어가면 넣지 않음
      break;
    }
    options.push(new Date(cursor));
    cursor = addMinutes(cursor, intervalMinutes);
  }

  return options;
};

/**
 * HH:mm 포맷 (자정 넘어가는 00:00은 24:00으로 표기)
 */
export const formatTimeDisplay = (date: Date, baseDay: Date): string => {
  const hh = date.getHours();
  const mm = date.getMinutes();

  // 다음날 00:00인 경우 24:00로 표기 (같은 날 자정 넘김 허용 UX)
  if (
    hh === 0 &&
    mm === 0 &&
    date.getDate() !== baseDay.getDate() // 날짜가 다음날이면
  ) {
    return "24:00";
  }

  const h = String(hh).padStart(2, "0");
  const m = String(mm).padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * 시간 슬롯 생성 (시작시간부터 마지막 시작시간까지)
 */
export const buildTimeSlots = (
  startTime: Date,
  endTime: Date,
  intervalMinutes: number
): Array<{ from: Date; to: Date }> => {
  const slots: Array<{ from: Date; to: Date }> = [];
  let cursor = new Date(startTime);

  while (cursor <= endTime) {
    const to = addMinutes(cursor, intervalMinutes);
    slots.push({ from: new Date(cursor), to });
    cursor = to;
  }

  return slots;
};
