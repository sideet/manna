"use client";
import Header from "@/app/_components/Header";
import styles from "./page.module.css";
import { FaCircleUser } from "react-icons/fa6";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ScheduleType } from "@/types/schedule";
import { FaUsers } from "react-icons/fa6";
import Loading from "../_components/Loading";

export default function MyPage() {
  const router = useRouter();
  const { data } = useSession();

  const [scheduleList, setScheduleList] = useState<
    ScheduleType[] | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const getSchedules = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setScheduleList(res.data.schedules);
    } catch (error) {
      console.error("응답 제출 실패", error);
      alert("일정 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSchedules();
  }, []);

  /** 로그아웃 */
  const logout = () => {
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
            <p>{data?.user?.name ?? "이름 미등록"}</p>
          </div>
        </div>
        <button className={styles.userInfoRightButton} onClick={logout}>
          로그아웃
        </button>
      </div>
      <div className={styles.roomListContainer}>
        <h3>생성한 일정</h3>
        <div className={styles.roomList}>
          {isLoading ? (
            <Loading />
          ) : scheduleList && scheduleList.length > 0 ? (
            scheduleList.map((schedule, idx) => (
              <button
                key={`${schedule.code}_${idx}`}
                className={styles.roomInfoButton}
                onClick={() =>
                  router.push(`/mypage/room/${schedule.schedule_no}`)
                }
              >
                <h4>{schedule.name}</h4>
                <p>
                  일정: {schedule.start_date.split(" ")[0]} -{" "}
                  {schedule.end_date.split(" ")[0]}
                </p>
                <p>{schedule.description}</p>
                <div className={styles.repondant}>
                  <FaUsers />
                  <p>응답: {schedule.schedule_participants.length}명</p>
                </div>
              </button>
            ))
          ) : (
            <>생성한 일정이 없습니다.</>
          )}
        </div>
      </div>
    </div>
  );
}
