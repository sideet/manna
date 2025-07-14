import { InputHTMLAttributes } from "react";
import styles from "./inputField.module.css";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  textarea?: boolean;
}

export default function InputField({
  label,
  required,
  textarea,
  ...props
}: InputFieldProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {textarea ? (
        <textarea className={styles.textarea} />
      ) : (
        <input className={styles.input} {...props} />
      )}
    </div>
  );
}
