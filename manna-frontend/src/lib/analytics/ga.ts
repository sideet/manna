export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const isBrowser = typeof window !== "undefined";

function safeParams(
  params?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isBrowser) return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, safeParams(params));
}

export function trackPageView(params: {
  url: string;
  pageGroup?: string;
}): void {
  if (!isBrowser) return;
  if (typeof window.gtag !== "function") return;

  // SPA 라우팅 대응: page_view를 명시적으로 전송
  window.gtag("event", "page_view", {
    page_path: params.url,
    page_location: window.location.href,
    page_title: document.title,
    page_group: params.pageGroup,
  });
}

export function getPageGroup(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/create")) return "create";
  if (pathname.startsWith("/mypage")) return "mypage";
  if (pathname.startsWith("/schedule/") && pathname.endsWith("/confirmed"))
    return "confirmed";
  if (pathname.startsWith("/schedule/")) return "schedule";
  if (pathname.startsWith("/auth")) return "auth";
  return "other";
}

export function maskScheduleCode(scheduleCode: string): string {
  const trimmed = scheduleCode.trim();
  if (trimmed.length <= 3) return "***";
  return `${trimmed.slice(0, 3)}***`;
}
