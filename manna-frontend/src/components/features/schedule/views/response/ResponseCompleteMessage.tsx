"use client";

import ConfettiIcon from "@/assets/icons/ConfettiIcon.svg";

/** 일정 응답 완료 메시지 컴포넌트 */
export default function ResponseCompleteMessage() {
  return (
    <div className="p-16 mb-12 text-center">
      <div className="flex justify-center mb-4">
        <ConfettiIcon width={64} height={64} />
      </div>
      <h3 className="text-head26 text-black mb-4">일정 답변 완료!</h3>
      <p className="text-body14 text-gray-900">잠시만 기다려주세요</p>
      <p className="text-body14 text-gray-900">일정이 확정되면 입력하신 메일로 안내해드릴게요</p>
    </div>
  );
}
