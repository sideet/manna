import { InputHTMLAttributes, useRef } from "react";
import styles from "./inputField.module.css";
import { FaPaste } from "react-icons/fa6"; // FontAwesome 아이콘 사용 예시

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  textarea?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  visibleClipboard?: boolean;
}

export default function InputField({
  label,
  required,
  textarea,
  value,
  onChange,
  visibleClipboard,
  ...props
}: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (inputRef.current) {
        const syntheticEvent = {
          target: { value: text },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange?.(syntheticEvent);
      }
    } catch (err: unknown) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {textarea ? (
        <textarea className={styles.textarea} />
      ) : (
        <div className={styles.inputWithClipboard}>
          <input
            className={styles.input}
            value={value}
            onChange={onChange}
            ref={inputRef}
            {...props}
          />
          {visibleClipboard && (
            <button
              type="button"
              className={styles.clipboardButton}
              onClick={handlePasteFromClipboard}
            >
              <FaPaste fill="#272b54" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
