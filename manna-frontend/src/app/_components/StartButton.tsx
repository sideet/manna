"use client";
import { useRouter } from "next/navigation";
import styles from "./startButton.module.css";

export default function StartButton() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push("/main");
  };

  return (
    <button className={styles.startButton} onClick={handleStartClick}>
      시작하기
    </button>
  );
}
