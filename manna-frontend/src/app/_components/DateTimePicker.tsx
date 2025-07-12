import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./dateTimePicker.module.css";

interface DateTimePickerProps {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  required?: boolean;
  minTime?: Date;
  maxTime?: Date;
}

export default function DateTimePicker({
  label,
  selected,
  onChange,
  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeIntervals,
  timeCaption,
  dateFormat,
  minDate,
  maxDate,
  placeholder,
  required,
  minTime,
  maxTime,
}: DateTimePickerProps) {
  return (
    <div className={styles.pickerContainer}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <DatePicker
        className={styles.datePicker}
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        showTimeSelectOnly={showTimeSelectOnly}
        dateFormat={
          dateFormat
            ? dateFormat
            : showTimeSelect
            ? "yyyy/MM/dd HH:mm"
            : "yyyy/MM/dd"
        }
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder}
        minTime={minTime ?? new Date(0, 0, 0, 0, 0)} // 00:00
        maxTime={maxTime ?? new Date(0, 0, 0, 23, 59)} // 23:59
      />
    </div>
  );
}
