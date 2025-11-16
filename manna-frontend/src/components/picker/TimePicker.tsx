import React from "react";
import { format } from "date-fns";
import { IoChevronDown } from "react-icons/io5";

interface TimePickerProps {
  label?: string;
  options: Date[]; // 선택 가능한 시간 옵션 리스트
  selected: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// 시간 선택을 위한 공통 컴포넌트
export default function TimePicker({
  label,
  options,
  selected,
  onChange,
  required = false,
  placeholder = "시간을 선택하세요",
  disabled = false,
  icon,
}: TimePickerProps) {
  return (
    <div className="flex flex-col items-start w-full gap-1 relative">
      {label && (
        <label className="text-subtitle16 text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <select
          className={`w-full h-54 pl-12 pr-40 py-3 text-body16 border border-gray-200 rounded-lg transition-all duration-200 focus:outline-none appearance-none ${
            disabled
              ? "bg-gray-100 border-gray-200 cursor-default"
              : "bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          }`}
          value={selected ? format(selected, "HH:mm") : ""}
          onChange={(e) => {
            if (!e.target.value) {
              onChange(null);
              return;
            }
            const [h, m] = e.target.value.split(":").map(Number);
            const base = new Date();
            base.setHours(h, m, 0, 0);
            onChange(base);
          }}
          disabled={disabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={+opt} value={format(opt, "HH:mm")}>
              {format(opt, "HH:mm")}
            </option>
          ))}
        </select>
        <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon || <IoChevronDown className="w-16 h-16 text-gray-600" />}
        </div>
      </div>
    </div>
  );
}
