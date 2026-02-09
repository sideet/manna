"use client";

import {
  IndividualConfirmInfoType,
  IndividualConfirmedParticipantType,
} from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import { IoCalendarClear, IoTimeOutline, IoPerson } from "react-icons/io5";
import { useState } from "react";
import { useCancelConfirm } from "@/hook/useConfirmInfo";
import ConfirmModal from "@/components/common/ConfirmModal";

interface ConfirmedIndividualViewProps {
  confirmInfo: IndividualConfirmInfoType;
  scheduleNo: number;
  timeUnit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
  /** true면 타임테이블 없이 확정된 일정만 표시 (전원 확정 시) */
  fullView?: boolean;
}

/** 개인(INDIVIDUAL) 확정된 일정 UI */
export default function ConfirmedIndividualView({
  confirmInfo,
  scheduleNo,
  timeUnit = "DAY",
  time = 1,
  fullView = false,
}: ConfirmedIndividualViewProps) {
  // 확정된 참가자만 필터링
  const confirmedParticipants = confirmInfo.confirmed_participants.filter(
    (p) => p.is_confirmed && p.confirmed_unit
  );

  if (confirmedParticipants.length === 0) {
    return null;
  }

  return (
    <div className={fullView ? "" : "mt-24"}>
      <h3 className="text-subtitle16 text-gray-800 mb-12">확정된 일정</h3>
      <div className="space-y-12">
        {confirmedParticipants.map((participant) => (
          <ConfirmedParticipantCard
            key={participant.no}
            participant={participant}
            scheduleNo={scheduleNo}
            timeUnit={timeUnit}
            time={time}
          />
        ))}
      </div>
    </div>
  );
}

interface ConfirmedParticipantCardProps {
  participant: IndividualConfirmedParticipantType;
  scheduleNo: number;
  timeUnit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
}

/** 개인 확정 참가자 카드 */
function ConfirmedParticipantCard({
  participant,
  scheduleNo,
  timeUnit = "DAY",
  time = 1,
}: ConfirmedParticipantCardProps) {
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
      {
        schedule_no: scheduleNo,
        schedule_participant_no: participant.no,
      },
      { onSuccess: () => setShowCancelModal(false) }
    );
  };

  const confirmedUnit = participant.confirmed_unit;

  if (!confirmedUnit) return null;

  return (
    <div className="p-16 bg-white border border-gray-200 rounded-[8px]">
      {/* 헤더: 참가자 이름 + 확정취소 */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <IoPerson className="w-20 h-20 text-gray-400" />
          <p className="text-subtitle16 text-gray-900">{participant.name}</p>
        </div>
        <button
          onClick={() => setShowCancelModal(true)}
          className="text-body14 text-gray-500 underline"
        >
          확정취소
        </button>
      </div>

      {/* 확정된 날짜/시간 */}
      <div className="space-y-6 mb-16">
        <div className="flex items-center gap-8">
          <IoCalendarClear className="w-20 h-20 text-gray-400" />
          <p className="text-body14 text-gray-700">
            {formatToMonthDate(confirmedUnit.date)} (
            {formatToKoreanDay(confirmedUnit.date)})
          </p>
        </div>
        {confirmedUnit.time && (
          <div className="flex items-center gap-8">
            <IoTimeOutline className="w-20 h-20 text-gray-400" />
            <p className="text-body14 text-gray-700">
              {formatTimeDisplay(confirmedUnit.time)}
              {getEndTime(confirmedUnit.time) &&
                ` - ${getEndTime(confirmedUnit.time)}`}
            </p>
          </div>
        )}
      </div>

      {/* 메일 전송 / 공유 버튼 - 추후 구현 */}
      <div className="space-y-8">
        <button className="w-full h-44 bg-blue-500 text-white rounded-[8px] text-subtitle14">
          메일로 내용 전송하기
        </button>
        <button className="w-full h-44 bg-white border border-blue-500 text-blue-500 rounded-[8px] text-subtitle14">
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
