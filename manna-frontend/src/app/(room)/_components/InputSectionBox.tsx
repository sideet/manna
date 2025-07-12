"use client";
import styles from "./inputSectionBox.module.css";

interface SectionProps {
  title?: string;
  children?: React.ReactNode;
}

export default function InputSectionBox({ title, children }: SectionProps) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      <div className={styles.children}>{children}</div>
    </div>
  );
}
