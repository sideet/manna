"use client";
import styles from "./page.module.css";
import Header from "@/app/_components/Header";
import InputSectionBox from "../../../_components/InputSectionBox";
import InputField from "@/app/_components/InputField";
import BigButton from "@/app/_components/BigButton";
import {
  FaUserShield,
  FaEye,
  FaCheckDouble,
  FaPaperPlane,
} from "react-icons/fa6";

interface RoomPageProps {
  params: { roomCode: string };
}

const temp_data = {
  name: "만나 프로젝트 팀플 일정",
  code: "TEAM2025",

  description:
    "7월 팀 프로젝트 미팅 일정을 조율하기 위해 생성했습니다. 참석 가능한 시간을 모두 선택해 주세요",
  user_name: "김민수",

  type: "team",
  is_participant_visible: true,
  is_duplicate_participation: true,
};

export default function JoinRoomPage({ params }: RoomPageProps) {
  const { roomCode } = params;
  console.log(roomCode);

  return (
    <div className={styles.container}>
      <Header title="일정 생성하기" showBackButton />

      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title="방 정보">
          <p className={styles.description}>{temp_data.description}</p>

          <div className={styles.roomInfoLabelBoxWrapper}>
            <div className={styles.roomInfoLabelBox}>
              <FaUserShield />
              <p>생성자: {temp_data.user_name}</p>
            </div>

            {temp_data.is_participant_visible ? (
              <div className={styles.roomInfoLabelBox}>
                <FaEye />
                <p>
                  참여자 정보:{" "}
                  {temp_data.is_participant_visible ? "표시" : "비공개"}
                </p>
              </div>
            ) : null}

            <div className={styles.roomInfoLabelBox}>
              <FaCheckDouble />
              <p>
                응답 중복:{" "}
                {temp_data.is_duplicate_participation ? "허용" : "불가"}
              </p>
            </div>
          </div>
        </InputSectionBox>

        <InputSectionBox title="일시 선택">
          <div className={styles.dateList}>
            <div className={styles.dateItem}>
              <div className={styles.date}>2025년 7월 2일 (수)</div>
              <div className={styles.timeItemWrapper}>
                <button type="button" className={styles.timeItem}>
                  10:00 - 11:00
                  <br />
                  참가: 박다솜, 장여진, 강준호 외 1명
                </button>
                <button type="button" className={styles.timeItem}>
                  13:00 - 14:00
                  <br />
                  참가: 없음
                </button>
                <button type="button" className={styles.timeItem}>
                  15:00 - 16:00
                  <br />
                  참가: 박다솜
                </button>
              </div>
            </div>
            <div className={styles.dateItem}>
              <div className={styles.date}>2025년 7월 2일 (수)</div>
              <div className={styles.timeItemWrapper}>
                <button type="button" className={styles.timeItem}>
                  10:00 - 11:00
                  <br />
                  참가: 박다솜, 장여진, 강준호 외 1명
                </button>
                <button type="button" className={styles.timeItem}>
                  13:00 - 14:00
                  <br />
                  참가: 없음
                </button>
                <button type="button" className={styles.timeItem}>
                  15:00 - 16:00
                  <br />
                  참가: 박다솜
                </button>
              </div>
            </div>
          </div>
        </InputSectionBox>

        <InputSectionBox title="참가자 정보">
          <InputField label="이름" required />
          <InputField label="연락처" required />
          <InputField label="이메일" required />
          <InputField label="남기는 말" textarea />
        </InputSectionBox>
      </div>

      <div className={styles.submitArea}>
        <p className={styles.helperText}>시간을 선택해주세요</p>
        <button className={styles.submitButton}>
          <FaPaperPlane />
          응답 제출하기
        </button>
      </div>
    </div>
  );
}
