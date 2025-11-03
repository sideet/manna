"use client";

import { forwardRef, useState } from "react";
import {
  IoAlertCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  successMessage?: string;
  status?: "default" | "success" | "error";
  showPasswordToggle?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      errorMessage,
      successMessage,
      status = "default",
      showPasswordToggle = false,
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 실제 input type 결정
    const inputType =
      showPasswordToggle && type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type;

    // 상태에 따른 스타일 결정
    const getInputStyles = () => {
      const baseStyles =
        "w-full h-54 px-12 py-3 text-body16 bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:outline-none";

      // 에러 상태
      if (status === "error" || errorMessage) {
        return `${baseStyles} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100`;
      }

      // 성공 상태
      if (status === "success" || successMessage) {
        return `${baseStyles} border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-100`;
      }

      // 포커스 상태
      if (isFocused) {
        return `${baseStyles} border-gray-600 focus:border-gray-600`;
      }

      // 기본 상태
      return `${baseStyles} border-gray-200 hover:border-gray-400 focus:border-gray-600`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
    };

    return (
      <div className={`flex flex-col gap-2 ${className || ""}`}>
        {/* 라벨 */}
        {label && (
          <label className="text-body14 font-medium text-gray-700">
            {label}
          </label>
        )}

        {/* Input 컨테이너 */}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={getInputStyles()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleInputChange}
            {...props}
          />

          {/* 비밀번호 토글 버튼 */}
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-24 h-24" />
              ) : (
                <IoEyeOutline className="w-24 h-24" />
              )}
            </button>
          )}

          {/* 에러 아이콘 */}
          {errorMessage && !showPasswordToggle && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <IoAlertCircleOutline className="w-24 h-24 text-red-500" />
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <p className="text-body13 text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
