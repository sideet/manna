"use client";
import { useState } from "react";
import styles from "./joinScheduleForm.module.css";
import InputField from "./InputField";
import BigButton from "./BigButton";
import { useRouter } from "next/navigation";

export default function JoinScheduleForm() {
  const [roomCode, setRoomCode] = useState("");

  const router = useRouter();

  const handleJoin = () => {
    if (!roomCode) return;
    router.push(`/join/room/${encodeURIComponent(roomCode)}`);
  };

  return (
    <div className={styles.formContainer}>
      <h2>일정 응답하기</h2>
      <InputField
        label="일정 코드"
        value={roomCode}
        placeholder="공유받은 코드를 입력해 주세요."
        onChange={(e) => setRoomCode(e.target.value)}
        visibleClipboard
      />
      <BigButton onClick={handleJoin}>조회하기</BigButton>
    </div>
  );
}
