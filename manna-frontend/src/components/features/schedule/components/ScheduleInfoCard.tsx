"use client";

import Tag from "@/components/base/Tag";
import { IoCopyOutline, IoTime } from "react-icons/io5";
import { useToast } from "@/providers/ToastProvider";
import { getPageGroup, maskScheduleCode, trackEvent } from "@/lib/analytics/ga";
import { format, isValid, parse } from "date-fns";

type ScheduleInfoCardSchedule = {
  type: "INDIVIDUAL" | "COMMON";
  name: string;
  description?: string | null;
  meeting_type: "OFFLINE" | "ONLINE" | "NONE" | (string & {});
  detail_address?: string | null;
  code: string;
  user?: {
    name?: string | null;
  } | null;
  expiry_datetime: string | null;
};

export default function ScheduleInfoCard({
  schedule,
}: {
  schedule: ScheduleInfoCardSchedule;
}) {
  const { showToast } = useToast();

  const expiryDate = schedule.expiry_datetime
    ? parse(schedule.expiry_datetime, "yyyy-MM-dd HH:mm:ss", new Date())
    : null;
  const isExpired =
    expiryDate && isValid(expiryDate) && expiryDate.getTime() < Date.now();
  const formattedExpiry =
    expiryDate && isValid(expiryDate)
      ? format(expiryDate, "yyyy. MM. dd HH:mm")
      : schedule.expiry_datetime ?? "";

  const handleCopyCode = async () => {
    if (!schedule) return;
    try {
      trackEvent("cta_click", {
        cta_name: "schedule_code_copy",
        page_group: getPageGroup(window.location.pathname),
        schedule_code_masked: maskScheduleCode(schedule.code),
      });
      await navigator.clipboard.writeText(schedule.code);
      showToast("초대코드를 복사했습니다.");
    } catch (err) {
      console.error("복사 실패: ", err);
      showToast("코드 복사에 실패했습니다.", "error");
    }
  };

  const handleCopyAddress = async () => {
    if (!schedule?.detail_address) return;
    try {
      await navigator.clipboard.writeText(schedule.detail_address);
      showToast("주소를 복사했습니다.");
    } catch (err) {
      console.error("복사 실패: ", err);
      showToast("주소 복사에 실패했습니다.", "error");
    }
  };

  const meetingTypeMap: Record<string, string> = {
    ONLINE: "온라인",
    OFFLINE: "오프라인",
    NONE: "미정",
  };

  return (
    <div className="w-full bg-white rounded-[8px] p-16 shadow-1">
      {/* 헤더: 타입 태그와 제목 */}
      <div className="flex items-center gap-6 mb-8">
        <Tag theme={schedule.type === "COMMON" ? "blue" : "purple"}>
          {schedule.type === "COMMON" ? "단체모임" : "개별미팅"}
        </Tag>
        <h2 className="text-head18 text-gray-900 flex-1">{schedule.name}</h2>
      </div>

      {/* 설명 */}
      {schedule.description && (
        <p className="text-body14 text-gray-600 whitespace-pre-line">
          {schedule.description}
        </p>
      )}

      <hr className="border-gray-200 my-12" />

      {/* 상세 정보 */}
      <div className="space-y-8">
        {/* 생성자 */}
        <div className="flex items-center">
          <span className="w-66 text-subtitle14 text-gray-500">생성자</span>
          <span className="text-body14 text-gray-900">
            {schedule.user?.name || "-"}
          </span>
        </div>

        {/* 진행방법 */}
        <div className="flex items-center">
          <span className="w-66 text-subtitle14 text-gray-500">진행방법</span>
          <span className="text-body14 text-gray-900">
            {meetingTypeMap[schedule.meeting_type] || schedule.meeting_type}
          </span>
        </div>

        {/* 모임주소 */}
        {schedule.detail_address && (
          <div className="w-full flex items-center">
            <span className="w-66 text-subtitle14 text-gray-500 flex-shrink-0">
              {schedule.type === "COMMON" ? "모임주소" : "미팅주소"}
            </span>
            <div className="w-full flex items-center justify-between gap-6 flex-1 min-w-0">
              <span className="text-body14 text-gray-600 underline flex-1 truncate">
                {schedule.detail_address}
              </span>
              <button
                onClick={handleCopyAddress}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700"
              >
                <IoCopyOutline className="w-24 h-24" />
              </button>
            </div>
          </div>
        )}

        {/* 초대코드 */}
        <div className="w-full flex items-center">
          <span className="w-66 text-subtitle14 text-gray-500 flex-shrink-0">
            초대코드
          </span>
          <div className="w-full flex items-center justify-between gap-6 flex-1 min-w-0">
            <span className="text-body14 text-gray-600 underline flex-1">
              {schedule.code}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700"
            >
              <IoCopyOutline className="w-24 h-24" />
            </button>
          </div>
        </div>

        {/* 마감시간 */}
        {schedule.expiry_datetime && (
          <div
            className={`w-full flex items-center gap-8 px-12 py-10 rounded-[8px] ${
              isExpired ? "bg-red-50" : "bg-blue-50"
            }`}
          >
            <IoTime
              className={`w-16 h-16 ${
                isExpired ? "text-red-400" : "text-blue-500"
              }`}
            />
            <p
              className={`text-body14 ${
                isExpired ? "text-red-600" : "text-blue-600"
              }`}
            >
              {isExpired
                ? "답변 시간이 마감되었어요"
                : `${formattedExpiry} 까지 답변 가능해요`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
