"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const [contentArea, setContentArea] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.getElementById("content-area");
    setContentArea(element);
  }, []);

  const sheet = (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-white p-16 rounded-t-[24px]">
      {children}
    </div>
  );

  return (
    <>
      {/* 배경 오버레이 - 전체 화면 */}
      <div
        className="fixed inset-0 bg-[var(--color-opacity-1)] z-40"
        onClick={onClose}
      />

      {/* 바텀시트 - 콘텐츠 영역 기준 */}
      {contentArea ? createPortal(sheet, contentArea) : null}
    </>
  );
}
