"use client";
import { useState } from "react";
import styles from "./joinScheduleForm.module.css";
import InputField from "./InputField";
import BigButton from "./BigButton";
import { useRouter } from "next/navigation";
import { useToast } from "../../providers/ToastProvider";

export default function JoinScheduleForm() {
  const [roomCode, setRoomCode] = useState("");
  const [visiblePopup, setVisiblePopup] = useState(false);
  const { showToast } = useToast();

  const router = useRouter();

  const handleJoin = () => {
    if (!roomCode) {
      showToast("코드를 입력해 주세요!", "warning");
      return;
    }
    router.push(`/join/room/${encodeURIComponent(roomCode)}`);
  };

  return (
    <>
      <div className={styles.container}>
        <p>코드를 공유받으셨나요? </p>
        <button
          type="button"
          className={styles.codeInputButton}
          onClick={() => setVisiblePopup(true)}
        >
          코드 입력하기
        </button>{" "}
      </div>
      {visiblePopup && (
        <div
          className={styles.popupModal}
          onClick={() => setVisiblePopup(false)}
        >
          <div
            className={styles.popupContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>일정 코드 입력</h3>
            <InputField
              label="일정 코드"
              value={roomCode}
              placeholder="공유받은 코드를 입력해 주세요."
              onChange={(e) => setRoomCode(e.target.value)}
              visibleClipboard
            />
            <BigButton onClick={handleJoin}>조회하기</BigButton>
          </div>
        </div>
      )}
    </>
  );
}
