"use client";

import {
  IndividualConfirmInfoType,
  IndividualConfirmedParticipantType,
} from "@/types/schedule";
import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import { IoCalendarClear, IoTime, IoPerson } from "react-icons/io5";
import { useState } from "react";
import {
  useCancelConfirm,
  useSendConfirmationEmail,
} from "@/hook/useConfirmInfo";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/providers/ToastProvider";
import Button from "@/components/base/Button";

interface ConfirmedIndividualViewProps {
  confirmInfo: IndividualConfirmInfoType;
  scheduleNo: number;
  scheduleCode: string;
  timeUnit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
  /** true면 타임테이블 없이 확정된 일정만 표시 (전원 확정 시) */
  fullView?: boolean;
}

/** 개인(INDIVIDUAL) 확정된 일정 UI */
export default function ConfirmedIndividualView({
  confirmInfo,
  scheduleNo,
  scheduleCode,
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
            scheduleCode={scheduleCode}
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
  scheduleCode: string;
  timeUnit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
}

/** 개인 확정 참가자 카드 */
function ConfirmedParticipantCard({
  participant,
  scheduleNo,
  scheduleCode,
  timeUnit = "DAY",
  time = 1,
}: ConfirmedParticipantCardProps) {
  const { showToast } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { mutate: cancelConfirm, isPending: isCancelling } = useCancelConfirm();
  const { mutate: sendEmail, isPending: isSendingEmail } =
    useSendConfirmationEmail();

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

  const handleSendEmail = () => {
    sendEmail(
      {
        schedule_no: scheduleNo,
        schedule_participant_nos: [participant.no],
      },
      { onSuccess: () => setShowEmailModal(false) }
    );
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/schedule/${scheduleCode}/confirmed?participant=${participant.no}`;
    navigator.clipboard.writeText(shareUrl);
    showToast("링크가 복사되었습니다.");
  };

  const confirmedUnit = participant.confirmed_unit;

  if (!confirmedUnit) return null;

  return (
    <div className="p-16 bg-white border border-gray-200 rounded-[8px]">
      <div className="space-y-6 mb-26">
        {/* 헤더: 참가자 이름 + 확정취소 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <IoPerson className="w-20 h-20 text-blue-200" />
            <p className="text-subtitle16 text-gray-800">{participant.name}</p>
          </div>
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-body14 text-gray-500 underline"
          >
            확정취소
          </button>
        </div>

        {/* 확정된 날짜/시간 */}

        <div className="flex items-center gap-8">
          <IoCalendarClear className="w-20 h-20 text-blue-200" />
          <p className="text-subtitle16 text-gray-800">
            {formatToMonthDate(confirmedUnit.date)} (
            {formatToKoreanDay(confirmedUnit.date)})
          </p>
        </div>
        {confirmedUnit.time && (
          <div className="flex items-center gap-8">
            <IoTime className="w-20 h-20 text-blue-200" />
            <p className="text-subtitle16 text-gray-800">
              {formatTimeDisplay(confirmedUnit.time)}
              {getEndTime(confirmedUnit.time) &&
                ` - ${getEndTime(confirmedUnit.time)}`}
            </p>
          </div>
        )}
      </div>

      {/* 메일 전송 / 공유 버튼 */}
      <div className="space-y-8">
        <Button size="sm" onClick={() => setShowEmailModal(true)}>
          메일로 내용 전송하기
        </Button>
        <Button size="sm" variant="light" onClick={handleCopyShareLink}>
          내용 직접 공유하기
        </Button>
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

      {/* 메일 전송 확인 모달 */}
      {showEmailModal && (
        <ConfirmModal
          title="이메일을 전송하시겠습니까?"
          description={`${participant.name}님에게 확정된 일정 안내 메일이 전송됩니다.`}
          confirmText="전송"
          cancelText="취소"
          onConfirm={handleSendEmail}
          onCancel={() => setShowEmailModal(false)}
          isLoading={isSendingEmail}
        />
      )}
    </div>
  );
}
