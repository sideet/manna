"use client";

import { GroupConfirmInfoType } from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import { IoCalendarClear, IoTimeOutline } from "react-icons/io5";
import { useState } from "react";
import { useCancelConfirm } from "@/hook/useConfirmInfo";
import ConfirmModal from "@/components/common/ConfirmModal";

interface ConfirmedGroupViewProps {
  confirmInfo: GroupConfirmInfoType;
  scheduleNo: number;
  timeUnit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
}

/** 그룹(COMMON) 확정된 일정 UI */
export default function ConfirmedGroupView({
  confirmInfo,
  scheduleNo,
  timeUnit = "DAY",
  time = 1,
}: ConfirmedGroupViewProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { mutate: cancelConfirm, isPending: isCancelling } = useCancelConfirm();

  // 종료 시간 계산
  const getEndTime = (startTime: string | null): string => {
    if (!startTime || startTime === "종일") return "";
    if (!timeUnit) return "";

    const [h, m] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);

    if (timeUnit === "MINUTE") {
      startDate.setMinutes(startDate.getMinutes() + 30);
    } else if (timeUnit === "HOUR") {
      startDate.setHours(startDate.getHours() + (time || 1));
    } else if (timeUnit === "DAY") {
      return "";
    }

    return startDate.toTimeString().slice(0, 5);
  };

  const handleCancelConfirm = () => {
    cancelConfirm(
      { schedule_no: scheduleNo },
      { onSuccess: () => setShowCancelModal(false) }
    );
  };

  const confirmedUnit = confirmInfo.confirmed_unit;

  return (
    <div className="p-16 bg-white border border-gray-200 rounded-[8px]">
      {/* 헤더: 모임 날짜가 정해졌어요! + 확정취소 */}
      <div className="flex items-center justify-between mb-12">
        <p className="text-subtitle16 text-gray-800">모임 날짜가 정해졌어요!</p>
        <button
          onClick={() => setShowCancelModal(true)}
          className="text-body14 text-gray-500 underline"
        >
          확정취소
        </button>
      </div>

      {/* 확정된 날짜/시간 */}
      {confirmedUnit && (
        <div className="space-y-8 mb-16">
          <div className="flex items-center gap-8">
            <IoCalendarClear className="w-20 h-20 text-gray-400" />
            <p className="text-subtitle16 text-gray-900">
              {formatToMonthDate(confirmedUnit.date)} (
              {formatToKoreanDay(confirmedUnit.date)})
            </p>
          </div>
          {confirmedUnit.time && (
            <div className="flex items-center gap-8">
              <IoTimeOutline className="w-20 h-20 text-gray-400" />
              <p className="text-subtitle16 text-gray-900">
                {formatTimeDisplay(confirmedUnit.time)}
                {getEndTime(confirmedUnit.time) &&
                  ` - ${getEndTime(confirmedUnit.time)}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 참여자 목록 */}
      {confirmInfo.participants.length > 0 && (
        <div className="mb-12">
          <p className="text-body14 text-gray-600 mb-6">참여</p>
          <div className="flex flex-wrap gap-6">
            {confirmInfo.participants.map((participant) => (
              <span
                key={participant.no}
                className="px-10 py-4 bg-gray-100 text-gray-800 rounded-full text-subtitle14"
              >
                {participant.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 미참여자 목록 */}
      {confirmInfo.non_participants.length > 0 && (
        <div className="mb-16">
          <p className="text-body14 text-gray-600 mb-6">미참여 (선택안함)</p>
          <div className="flex flex-wrap gap-6">
            {confirmInfo.non_participants.map((participant) => (
              <span
                key={participant.no}
                className="px-10 py-4 bg-gray-100 text-gray-500 rounded-full text-subtitle14"
              >
                {participant.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 메일 전송 / 공유 버튼 - 추후 구현 */}
      <div className="space-y-8">
        <button className="w-full h-48 bg-blue-500 text-white rounded-[8px] text-subtitle16">
          메일로 내용 전송하기
        </button>
        <button className="w-full h-48 bg-white border border-blue-500 text-blue-500 rounded-[8px] text-subtitle16">
          내용 직접 공유하기
        </button>
      </div>

      {/* 확정취소 확인 모달 */}
      {showCancelModal && (
        <ConfirmModal
          title="일정 확정을 취소하시겠습니까?"
          description="지금 선택한 일정은 제거됩니다. 변경되었다는 메일은 전송되지 않습니다. 변경 일정을 확정한 후 메일을 다시 전송해 주세요."
          confirmText="확정 취소"
          cancelText="닫기"
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelModal(false)}
          isLoading={isCancelling}
        />
      )}
    </div>
  );
}
