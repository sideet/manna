"use client";
import { ButtonHTMLAttributes } from "react";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

export default function Tab({
  children,
  selected,
  className,
  ...props
}: TabProps) {
  const defaultStyles =
    "bg-gray-50 text-gray-600 border border-gray-200 text-body14";
  const selectedStyles =
    "bg-blue-50 text-blue-500 border-2 border-blue-500 text-subtitle14";

  const styles = selected ? selectedStyles : defaultStyles;

  return (
    <button
      className={`w-76 h-37 rounded-full cursor-pointer ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
