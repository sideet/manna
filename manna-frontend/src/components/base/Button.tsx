"use client";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  /** 스타일 variant: primary(기본), light(연한 파란), outline(흰 배경+테두리) */
  variant?: "primary" | "light" | "outline";
  /** @deprecated lightStyle 대신 variant="light" 사용 */
  lightStyle?: boolean;
  /** 버튼 사이즈: sm(44px), md(48px), lg(56px, 기본) */
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  disabled,
  className,
  variant,
  lightStyle,
  size = "lg",
  ...props
}: ButtonProps) {
  const disabledStyles = "bg-gray-200 cursor-not-allowed text-gray-500";
  const primaryStyles = "bg-blue-500 hover:bg-blue-600 text-white";
  const lightStyles = "bg-blue-50 text-blue-500 hover:bg-blue-100";
  const outlineStyles = "bg-white border border-blue-500 text-blue-500 hover:bg-blue-50";

  // variant가 명시적으로 지정되면 사용, 아니면 lightStyle prop 체크 (하위호환)
  const resolvedVariant = variant ?? (lightStyle ? "light" : "primary");

  const variantStyles = disabled
    ? disabledStyles
    : resolvedVariant === "light"
      ? lightStyles
      : resolvedVariant === "outline"
        ? outlineStyles
        : primaryStyles;

  const sizeStyles = {
    sm: "h-44 text-subtitle14",
    md: "h-48 text-subtitle16",
    lg: "h-56 text-subtitle16",
  }[size];

  return (
    <button
      className={`w-full rounded-[8px] ${sizeStyles} ${variantStyles} ${className ?? ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
