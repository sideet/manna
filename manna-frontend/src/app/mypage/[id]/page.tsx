"use client";
import Header from "@/app/_components/Header";
import styles from "./page.module.css";
import { FaCircleUser } from "react-icons/fa6";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const TEMP_ROOM = [
  {
    name: "7월 프로젝트 회의",
    start_date: "2025-07-01",
    end_date: "2025-07-09",
    description: "다음 단계 논의",
    participant: 3,
  },
  {
    name: "8월 프로젝트 회의",
    start_date: "2025-07-01",
    end_date: "2025-07-09",
    description: "다음 단계 논의",
    participant: 0,
  },
  {
    name: "신규 채용",
    start_date: "2025-07-01",
    end_date: "2025-07-09",
    description: "다음 단계 논의",
    participant: 2,
  },
];

export default function MyPage() {
  const router = useRouter();
  const { data } = useSession();

  const signout = () => {
    signOut({ redirect: false }).then(() => {
      router.replace("/");
    });
  };

  return (
    <div className={styles.container}>
      <Header title="마이 페이지" showBackButton />

      <div className={styles.userInfo}>
        <div className={styles.userInfoLeft}>
          <FaCircleUser size={"2rem"} />
          <div>
            <p className={styles.idText}>{data?.user?.email}</p>
            <p>{data?.user?.nickname ?? "닉네임 미지정"}</p>
          </div>
        </div>
        <button className={styles.userInfoRightButton}>수정하기</button>
      </div>

      <div className={styles.roomListContainer}>
        <h3>생성한 일정</h3>
        <div className={styles.roomList}>
          {TEMP_ROOM.map((room, idx) => (
            <button key={idx} className={styles.roomInfoButton}>
              <h4>{room.name}</h4>
              <p>
                {room.start_date} - {room.end_date}
              </p>
              <p>{room.description}</p>
              <p>참여자: {room.participant}명</p>
            </button>
          ))}
        </div>
      </div>
      <button onClick={signout}>임시 로그아웃</button>
    </div>
  );
}
