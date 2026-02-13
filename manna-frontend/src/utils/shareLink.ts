// 모바일 기기 여부 확인
import { getPageGroup, maskScheduleCode, trackEvent } from "@/lib/analytics/ga";

const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

type ShareScheduleOptions = {
  entryPoint?: string;
};

export const shareSchedule = async (
  scheduleCode: string,
  options?: ShareScheduleOptions
): Promise<void> => {
  if (typeof window === "undefined") return;

  const baseParams = {
    page_group: getPageGroup(window.location.pathname),
    entry_point: options?.entryPoint,
    schedule_code_masked: maskScheduleCode(scheduleCode),
  };

  // UX 목적: "헤더 공유(링크/공유하기)" CTA 클릭만 추적
  trackEvent("cta_click", { ...baseParams, cta_name: "header_share_link" });

  const shareUrl = `${window.location.origin}/schedule/${scheduleCode}`;
  const shareData: ShareData = {
    title: document.title,
    text: "일정 공유하기",
    url: shareUrl,
  };

  // Web Share API 지원 여부 확인
  const isWebShareSupported =
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    (typeof navigator.canShare !== "function" || navigator.canShare(shareData));

  if (isWebShareSupported) {
    try {
      // PC 웹에서만 클립보드에 먼저 복사 (모바일은 네이티브 공유만)
      if (!isMobileDevice()) {
        await navigator.clipboard.writeText(shareUrl);
        alert("링크가 복사되었습니다.");
      }
      // memo. navigator.share는 localhost에서 작동하지 않을 수 있음
      await navigator.share(shareData);
      return;
    } catch (error) {
      // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("공유 실패:", error);
      }
    }
  } else {
    // 폴백: 클립보드 복사
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("링크가 복사되었습니다.");
      } else {
        // 구형 브라우저 대응: fallback 복사 방법
        fallbackCopyToClipboard(shareUrl);
      }
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      throw new Error("링크 복사에 실패했습니다.");
    }
  }
};

// 구형 브라우저용 폴백 복사 함수
const fallbackCopyToClipboard = (text: string): void => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    alert("링크가 복사되었습니다.");
  } catch (error) {
    console.error("폴백 복사 실패:", error);
  } finally {
    document.body.removeChild(textArea);
  }
};
