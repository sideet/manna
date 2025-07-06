"use client";
import { useState } from "react";
import styles from "./roomJoinForm.module.css";
import InputField from "./InputField";
import BigButton from "./BigButton";

export default function RoomJoinForm() {
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => {
    console.log({ roomCode, name });
    // TODO: navigate to room page
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
