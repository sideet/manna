import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./bigButton.module.css";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function BigButton({ children, ...props }: BigButtonProps) {
  return (
    <button className={styles.bigButton} {...props}>
      {children}
    </button>
  );
}
