export const getRatioClass = (count: number, total: number): string => {
  // 비율에 따라 파란색 그라디언트 적용
  if (count / total >= 0.9) return "bg-blue-900 border border-blue-900";
  if (count / total >= 0.8) return "bg-blue-700 border border-blue-700";
  if (count / total >= 0.6) return "bg-blue-500 border border-blue-500";
  if (count / total >= 0.4) return "bg-blue-300 border border-blue-300";
  if (count / total >= 0.2) return "bg-blue-100 border border-blue-100";
  return "bg-gray-200 border border-gray-200";
};
