"use client";
import { createContext, useContext, useState, ReactNode } from "react";

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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, status: ToastStatus = "success") => {
    const id = Date.now();
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
  };

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

      <div
        className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
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
