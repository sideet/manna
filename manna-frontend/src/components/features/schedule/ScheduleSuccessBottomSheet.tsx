"use client";

import React from "react";
import { IoCopyOutline } from "react-icons/io5";
import Button from "@/components/base/Button";
import ConfettiIcon from "@/assets/icons/confettiIcon.svg";

interface ScheduleSuccessBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
  onCopyLink: () => void;
  onCheckSchedule: () => void;
}

export default function ScheduleSuccessBottomSheet({
  isOpen,
  onClose,
  shareLink,
  onCopyLink,
  onCheckSchedule,
}: ScheduleSuccessBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-[var(--color-opacity-1)] z-40"
        // onClick={onClose}
      />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white px-16 pt-30 pb-40 max-w-480 mx-auto rounded-t-[24px]">
        {/* 성공 아이콘 */}
        <div className="flex justify-center mb-16">
          <ConfettiIcon width={64} height={64} />
        </div>

        {/* 성공 메시지 */}
        <h3 className="text-head22 text-gray-900 text-center mb-8">
          일정 생성이 완료됐어요!
        </h3>

        {/* 안내 문구 */}
        <p className="text-body16 text-gray-600 text-center mb-24">
          링크를 공유하고,
          <br />
          응답을 받아 약속을 정해보세요.
        </p>

        {/* 링크 공유 영역 */}
        <div className="h-60 flex items-center justify-between p-8 bg-gray-50 border border-gray-200 rounded-[8px] mb-16">
          <p className="text-body14 text-gray-800 truncate">{shareLink}</p>
          <button
            onClick={onCopyLink}
            className="h-44 px-12 bg-blue-500 text-white rounded-[6px] flex items-center gap-4 text-subtitle14 hover:bg-blue-600 transition-colors"
          >
            복사하기
            <IoCopyOutline className="w-20 h-20" />
          </button>
        </div>

        {/* 확인 버튼 */}
        <Button onClick={onCheckSchedule} lightStyle>
          내 일정 확인하기
        </Button>
      </div>
    </>
  );
}
