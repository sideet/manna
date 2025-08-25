"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import styles from "./toast.module.css";

type ToastStatus = "success" | "warning" | "error";
type Toast = { id: number; message: string; status: ToastStatus };

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

  // status 기본값을 "success"로
  const showToast = (message: string, status: ToastStatus = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, status }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.status]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
