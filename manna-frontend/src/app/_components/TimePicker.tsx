import React from "react";
import { format } from "date-fns";
import styles from "./timePicker.module.css";

interface TimePickerProps {
  label: string;
  options: Date[]; // 선택 가능한 시간 옵션 리스트
  selected: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
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
}: TimePickerProps) {
  return (
    <div className={styles.selectContainer}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        className={`${styles.select} ${disabled ? styles.disabled : ""}`}
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
    </div>
  );
}
