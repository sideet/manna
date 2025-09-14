"use client";
import { useRouter } from "next/navigation";
import styles from "./startButton.module.css";

export default function StartButton() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push("/home");
  };

  return (
    <button className={styles.startButton} onClick={handleStartClick}>
      시작하기
    </button>
  );
}
