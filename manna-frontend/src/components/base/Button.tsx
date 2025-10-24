"use client";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const disabledStyles = "bg-gray-200 cursor-not-allowed text-gray-500";
  const enabledStyles = "bg-blue-500 hover:bg-blue-600 text-white";

  const styles = disabled ? disabledStyles : enabledStyles;

  return (
    <button
      className={`w-full h-56 bg-blue-500 rounded-[8px] text-subtitle16 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
