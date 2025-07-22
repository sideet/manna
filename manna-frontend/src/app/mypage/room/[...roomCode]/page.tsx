"use client";
import Header from "@/app/_components/Header";
import styles from "./page.module.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScheduleType } from "@/types/schedule";
import axios from "axios";
import InputSectionBox from "@/app/(room)/_components/InputSectionBox";
import {
  FaCheckDouble,
  FaEye,
  FaRegTrashCan,
  FaUserShield,
} from "react-icons/fa6";
import ResponseTimeTable from "./_components/ResponseTimeTable";
import RespondantList from "./_components/RespondantList";

export default function MySchedule() {
  const { roomCode: encodedRoomCode } = useParams();
  const roomCode = encodedRoomCode as string;
  const router = useRouter();
  const token = localStorage.getItem("accessToken");

  // 일정 정보
  const [schedule, setSchedule] = useState<ScheduleType | undefined>();

  /**
   * 일정 정보 fetch
   */
  const init = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/schedule?schedule_no=${roomCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchedule(res.data.schedule);
    } catch (error) {
      console.error("일정 정보 요청 실패", error);
      alert("일정 정보를 불러올 수 없습니다.");
      router.push("/");
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    init();
  }, [roomCode]);

  if (!schedule) {
    return <>Loading...</>;
  }

  /** 일정 삭제 */
  const deleteSchedule = async () => {
    try {
      const confirmDelete = confirm("일정을 삭제하시겠습니까?");
      if (!confirmDelete) return;

      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          schedule_no: schedule.schedule_no,
        },
      });
      alert("일정을 삭제했습니다.");
      router.push("/mypage");
    } catch (error) {
      console.error("일정 삭제 실패", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <Header
        title={"일정 상세조회"}
        showBackButton
        rightSlot={
          <button onClick={deleteSchedule}>
            <FaRegTrashCan />
          </button>
        }
      />

      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title={schedule.name}>
          <p className={styles.description}>{schedule.description}</p>

          <div className={styles.roomInfoLabelBoxWrapper}>
            <div className={styles.roomInfoLabelBox}>
              <FaUserShield />
              <p>생성자: {schedule.nickname}</p>
            </div>

            {schedule.is_participant_visible ? (
              <div className={styles.roomInfoLabelBox}>
                <FaEye />
                <p>
                  참여자 정보:{" "}
                  {schedule.is_participant_visible ? "표시" : "비공개"}
                </p>
              </div>
            ) : null}

            <div className={styles.roomInfoLabelBox}>
              <FaCheckDouble />
              <p>
                응답 중복:{" "}
                {schedule.is_duplicate_participation ? "허용" : "불가"}
              </p>
            </div>
          </div>
        </InputSectionBox>

        <InputSectionBox title="응답 정보">
          <ResponseTimeTable
            dates={Object.keys(schedule.schedule_units)}
            schedule_units={schedule.schedule_units}
          />
        </InputSectionBox>

        <InputSectionBox title="참여자 목록">
          <RespondantList
            schedule_participants={schedule.schedule_participants}
          />
        </InputSectionBox>
      </div>
    </div>
  );
}
