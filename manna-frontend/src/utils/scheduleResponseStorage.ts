/** 일정 응답 정보를 로컬스토리지에 저장하는 유틸리티 */

export interface ScheduleResponseData {
  schedule_no: number;
  selectedUnitNos: number[];
  name: string;
  email: string;
  phone?: string;
  memo?: string;
  submittedAt: string; // ISO string
}

const STORAGE_PREFIX = "schedule_response_";

/**
 * 일정 응답 정보를 로컬스토리지에 저장
 */
export function saveScheduleResponse(
  code: string,
  data: ScheduleResponseData
): void {
  try {
    const key = `${STORAGE_PREFIX}${code}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("로컬스토리지 저장 실패:", error);
  }
}

/**
 * 일정 응답 정보를 로컬스토리지에서 조회
 */
export function getScheduleResponse(code: string): ScheduleResponseData | null {
  try {
    const key = `${STORAGE_PREFIX}${code}`;
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as ScheduleResponseData;
  } catch (error) {
    console.error("로컬스토리지 조회 실패:", error);
    return null;
  }
}

/**
 * 일정 응답 정보를 로컬스토리지에서 삭제
 */
export function removeScheduleResponse(code: string): void {
  try {
    const key = `${STORAGE_PREFIX}${code}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("로컬스토리지 삭제 실패:", error);
  }
}
