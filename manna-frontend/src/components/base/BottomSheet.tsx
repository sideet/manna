"use client";

import { useEffect, useState } from "react";

export default function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const [position, setPosition] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.getElementById("content-area");
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({ left: rect.left, width: rect.width });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <>
      {/* 배경 오버레이 - 전체 화면 */}
      <div
        className="fixed inset-0 bg-[var(--color-opacity-1)] z-40"
        onClick={onClose}
      />

      {/* 바텀시트 - fixed로 뷰포트 하단 고정, 콘텐츠 영역 너비에 맞춤 */}
      <div
        className="fixed bottom-0 z-50 bg-white p-16 rounded-t-[24px]"
        style={
          position
            ? { left: position.left, width: position.width }
            : { left: 0, right: 0, maxWidth: 480, margin: "0 auto" }
        }
      >
        {children}
      </div>
    </>
  );
}
