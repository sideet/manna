"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";

type ToastStatus = "success" | "warning" | "error";
type Toast = {
  id: number;
  message: string;
  status: ToastStatus;
  isVisible: boolean;
};

const ToastContext = createContext<{
  showToast: (msg: string, status?: ToastStatus) => void;
} | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const MAX_TOASTS = 5; // 최대 토스트 개수
const DEBOUNCE_TIME = 300; // 같은 메시지 중복 방지 시간 (ms)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<{ left: number; width: number } | null>(null);
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(
    null
  );
  const toastIdCounterRef = useRef(0);

  // 콘텐츠 영역 위치 계산
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

  const showToast = useCallback(
    (message: string, status: ToastStatus = "success") => {
      // 중복 방지: 같은 메시지가 짧은 시간 내에 여러 번 호출되면 무시
      const now = Date.now();
      if (
        lastToastRef.current &&
        lastToastRef.current.message === message &&
        now - lastToastRef.current.timestamp < DEBOUNCE_TIME
      ) {
        return;
      }
      lastToastRef.current = { message, timestamp: now };

      // 최대 개수 제한: 이미 최대 개수에 도달했으면 가장 오래된 토스트 제거
      setToasts((prev) => {
        const newToasts = [...prev];
        if (newToasts.length >= MAX_TOASTS) {
          newToasts.shift(); // 가장 오래된 토스트 제거
        }
        return newToasts;
      });

      // 고유 ID 생성 (Date.now() + 카운터로 더 안전하게)
      toastIdCounterRef.current += 1;
      const id = Date.now() + toastIdCounterRef.current;
      const newToast = { id, message, status, isVisible: false };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isVisible: true } : t))
        );
      }, 10);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isVisible: false } : t))
        );
      }, 2500);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const getToastStyles = (toast: Toast) => {
    const base =
      "px-5 py-3 rounded-sm shadow-md text-white font-medium text-body14 min-w-[240px] max-w-[280px] text-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] backdrop-blur-md";

    const colorByStatus = {
      success: "bg-blue-500 border border-blue-300 shadow-blue-400/20",
      warning: "bg-purple-500 border border-purple-300 shadow-purple-400/20",
      error: "bg-red-500 border border-red-300 shadow-red-400/20",
    };

    const visible = toast.isVisible ? "opacity-100" : "opacity-0";

    return `${base} ${colorByStatus[toast.status]} ${visible}`;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 토스트 컨테이너 - fixed로 뷰포트 상단 고정, 콘텐츠 영역 너비에 맞춤 */}
      <div
        className="fixed top-12 z-50 pointer-events-none px-16"
        style={
          position
            ? { left: position.left, width: position.width }
            : { left: 0, right: 0, maxWidth: 480, margin: "0 auto" }
        }
        aria-live="polite"
      >
        <div className="flex flex-col-reverse gap-2 items-center">
          {toasts.map((toast, index) => {
            return (
              <div
                key={`${toast.id}-${index}`}
                className={getToastStyles(toast)}
              >
                <span className="break-words">{toast.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
