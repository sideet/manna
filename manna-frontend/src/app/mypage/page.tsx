"use client";
import Header from "@/app/_components/Header";
import styles from "./page.module.css";
import { FaCircleUser, FaRegShareFromSquare } from "react-icons/fa6";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ScheduleType } from "@/types/schedule";
import { FaUsers } from "react-icons/fa6";
import Loading from "../_components/Loading";
import BigButton from "../_components/BigButton";
import { useToast } from "../../providers/ToastProvider";
import clientApi from "../api/client";

export default function MyPage() {
  const router = useRouter();
  const { data } = useSession();
  const { showToast } = useToast();

  const [scheduleList, setScheduleList] = useState<
    ScheduleType[] | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const getSchedules = async () => {
    try {
      setIsLoading(true);
      const res = await clientApi.get(`/schedules`);
      setScheduleList(res.data.schedules);
    } catch (error: unknown) {
      console.error("응답 조회 실패", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "일정 정보를 불러올 수 없습니다.",
          "error"
        );
      } else {
        showToast("일정 정보를 불러올 수 없습니다.", "error");
      }
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
      showToast("로그아웃 되었습니다.", "success");
      router.replace("/main");
    });
  };

  /** 공유 링크 복사 */
  const handleCopy = async (code: string) => {
    try {
      const linkToCopy = `${window.location.origin}/join/room/${code}`;
      await navigator.clipboard.writeText(linkToCopy);
      showToast("링크를 복사했습니다. 참석자에게 공유해 주세요!", "success");
    } catch (err: unknown) {
      console.error("복사 실패: ", err);
    }
  };

  /**
   * 일정 생성하기
   * @method
   */
  const moveCreateSchedulePage = () => {
    router.push("/create/room");
  };

  /** 회원 탈퇴하기 */
  const withdrawal = async () => {
    try {
      const confirmWithdrawal = confirm(
        "탈퇴하시겠습니까? 생성한 일정 및 정보가 영구 삭제됩니다."
      );
      if (!confirmWithdrawal) return;

      await clientApi.delete(`/user`);
      signOut({ redirect: false }).then(() => {
        router.replace("/main");
      });
      showToast("회원 탈퇴가 완료되었습니다.", "success");
    } catch (error: unknown) {
      console.error("탈퇴 실패:", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "회원 탈퇴에 실패했습니다.",
          "error"
        );
      } else {
        showToast("회원 탈퇴에 실패했습니다.", "error");
      }
    }
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
              <div
                key={`${schedule.code}_${idx}`}
                className={styles.roomInfoWrapper}
              >
                <button
                  className={styles.roomInfoButton}
                  onClick={() => router.push(`/mypage/room/${schedule.no}`)}
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
                <button
                  className={styles.shareButton}
                  onClick={() => handleCopy(schedule.code)}
                >
                  <FaRegShareFromSquare />
                </button>
              </div>
            ))
          ) : (
            <>생성한 일정이 없습니다.</>
          )}
        </div>
        <BigButton type="button" onClick={moveCreateSchedulePage}>
          일정 생성하기
        </BigButton>
        <footer>
          <button
            type="button"
            className={styles.signOutButton}
            onClick={withdrawal}
          >
            회원 탈퇴하기
          </button>
          {/* <Image alt="만나캐릭터" src={"/image.png"} width={100} height={100} /> */}
        </footer>
      </div>
    </div>
  );
}
