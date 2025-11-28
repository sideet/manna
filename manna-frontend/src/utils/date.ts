export function formatToMonthDate(date: string) {
  const d = new Date(date);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export function formatToKoreanDay(date: string) {
  return ["일", "월", "화", "수", "목", "금", "토"][new Date(date).getDay()];
}
