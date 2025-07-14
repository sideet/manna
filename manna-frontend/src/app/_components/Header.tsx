"use client";
import styles from "./header.module.css";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { IoArrowBackOutline } from "react-icons/io5";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightSlot?: ReactNode;
}

export default function Header({
  title,
  showBackButton,
  rightSlot,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBackButton && (
          <button onClick={() => router.back()} className={styles.backbutton}>
            <IoArrowBackOutline />
          </button>
        )}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.right}>{rightSlot}</div>
    </header>
  );
}
