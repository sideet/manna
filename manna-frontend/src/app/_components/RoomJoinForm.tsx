"use client";
import { useState } from "react";
import styles from "./roomJoinForm.module.css";
import InputField from "./InputField";
import BigButton from "./BigButton";
import { useRouter } from "next/navigation";

export default function RoomJoinForm() {
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
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <BigButton onClick={handleJoin}>조회하기</BigButton>
    </div>
  );
}
