"use client";
import { useState } from "react";
import styles from "./joinform.module.css";

export default function RoomJoinForm() {
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => {
    console.log({ roomCode, name });
    // TODO: navigate to room page
  };

  return (
    <div className={styles.formContainer}>
      <h2>일정 응답하기</h2>
      <label className={styles.label}>
        일정 코드
        <input
          className={styles.formInput}
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
      </label>
      <button className={styles.joinButton} onClick={handleJoin}>
        조회하기
      </button>
    </div>
  );
}
