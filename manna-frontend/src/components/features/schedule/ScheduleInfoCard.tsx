"use client";

import Tag from "@/components/base/Tag";
import { IoCopyOutline } from "react-icons/io5";
import {
  GuestScheduleResponseType,
  ScheduleResponseType,
} from "@/types/schedule";
import { useToast } from "@/providers/ToastProvider";

export default function ScheduleInfoCard({
  schedule,
}: {
  schedule: GuestScheduleResponseType | ScheduleResponseType;
}) {
  const { showToast } = useToast();

  const handleCopyCode = async () => {
    if (!schedule) return;
    try {
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
    <div className="w-full bg-white rounded-[8px] border border-gray-200 p-16">
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
      </div>
    </div>
  );
}
