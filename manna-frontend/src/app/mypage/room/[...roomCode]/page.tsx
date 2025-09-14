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
  FaRegFileCode,
  FaRegShareFromSquare,
  FaRegTrashCan,
  FaUsers,
  FaUserShield,
  FaVideo,
  FaQuestion,
} from "react-icons/fa6";
import ResponseTimeTable from "./_components/ResponseTimeTable";
import RespondantList from "./_components/RespondantList";
import Loading from "@/app/_components/Loading";
import { FaCoffee, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { useToast } from "@/app/_components/ToastProvider";
import clientApi from "@/app/api/client";

export default function MySchedule() {
  const { roomCode: encodedRoomCode } = useParams();
  const roomCode = encodedRoomCode as string;
  const router = useRouter();
  const { showToast } = useToast();

  // 일정 정보
  const [schedule, setSchedule] = useState<ScheduleType | undefined>();

  /**
   * 일정 정보 fetch
   */
  const init = async () => {
    try {
      const res = await clientApi.get(`/schedule?schedule_no=${roomCode}`);
      setSchedule(res.data.schedule);
    } catch (error: unknown) {
      console.error("일정 정보 요청 실패", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "일정 정보를 불러올 수 없습니다.",
          "error"
        );
      } else {
        showToast("일정 정보를 불러올 수 없습니다.", "error");
      }
    }
  };

  useEffect(() => {
    if (!roomCode) return;
    init();
  }, [roomCode]);

  if (!schedule) {
    return (
      <div className={styles.container}>
        <Header title="일정 상세조회" />
        <Loading />
      </div>
    );
  }

  /** 공유 링크 복사 */
  const handleCopy = async () => {
    try {
      const linkToCopy = `${window.location.origin}/join/room/${schedule.code}`;
      await navigator.clipboard.writeText(linkToCopy);
      showToast("링크를 복사했습니다. 참석자에게 공유해 주세요!");
    } catch (err: unknown) {
      console.error("복사 실패: ", err);
    }
  };

  /** 일정 삭제 */
  const deleteSchedule = async () => {
    try {
      const confirmDelete = confirm("일정을 삭제하시겠습니까?");
      if (!confirmDelete) return;

      await clientApi.delete(`/schedule`, {
        data: {
          schedule_no: schedule.no,
        },
      });
      showToast("일정을 삭제했습니다.");
      router.push("/mypage");
    } catch (error) {
      console.error("일정 삭제 실패", error);
      showToast("일정 삭제에 실패했습니다.", "error");
    }
  };

  /** 공유 코드 복사 */
  const handleCodeCopy = async () => {
    try {
      const linkToCopy = `${schedule.code}`;
      await navigator.clipboard.writeText(linkToCopy);
      showToast("코드를 복사했습니다. 참석자에게 공유해 주세요!");
    } catch (err: unknown) {
      console.error("복사 실패: ", err);
    }
  };

  return (
    <div className={styles.container}>
      <Header
        title={"일정 상세조회"}
        showBackButton
        rightSlot={
          <div className={styles.headerRightSlot}>
            <button onClick={handleCopy} className={styles.headerButton}>
              <FaRegShareFromSquare />
            </button>
            <button onClick={deleteSchedule} className={styles.headerButton}>
              <FaRegTrashCan />
            </button>
          </div>
        }
      />

      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title={schedule.name}>
          <p className={styles.description}>{schedule.description}</p>

          <div className={styles.roomInfoLabelBoxWrapper}>
            <div className={styles.roomInfoLabelBox}>
              <FaUserShield />
              <p>생성자: {schedule.user_name}</p>
            </div>

            <div className={styles.roomInfoLabelBox}>
              {schedule.type === "common" ? (
                <>
                  <FaUsers />
                  <p>일정 형태: 공통 일정</p>
                </>
              ) : schedule.type === "individual" ? (
                <>
                  <FaUser />
                  <p>일정 형태: 개별 미팅</p>
                </>
              ) : (
                <>
                  <FaCoffee />
                  <p>일정 형태: 커피챗</p>
                </>
              )}
            </div>

            <div className={styles.roomInfoLabelBox}>
              <FaEye />
              <p>
                참여자 정보:{" "}
                {schedule.is_participant_visible ? "표시" : "비공개"}
              </p>
            </div>

            <div className={styles.roomInfoLabelBox}>
              <FaCheckDouble />
              <p>
                응답 중복:{" "}
                {schedule.is_duplicate_participation ? "허용" : "불가"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCodeCopy}
              className={styles.roomInfoLabelBox}
            >
              <FaRegFileCode />
              <p>일정 코드: {schedule.code}</p>
            </button>
            <div className={styles.roomInfoLabelBox}>
              {schedule.meeting_type === "offline" ? (
                <>
                  <FaMapMarkerAlt />
                  <p>미팅타입: 오프라인</p>
                </>
              ) : schedule.meeting_type === "online" ? (
                <>
                  <FaVideo />
                  <p>미팅타입: 온라인</p>
                </>
              ) : (
                <>
                  <FaQuestion />
                  <p>미팅타입: 미정</p>
                </>
              )}
            </div>
          </div>
          {/* TODO: 지역 정보 추가 및 확인 필요 */}
          <div className={styles.roomInfoLabelBox}>
            <FaMapMarkerAlt />
            일정 위치: {schedule.region?.name} {schedule.region_detail?.name}
          </div>
        </InputSectionBox>

        <InputSectionBox title="응답 정보">
          <ResponseTimeTable
            dates={Object.keys(schedule.schedule_units)}
            schedule_units={schedule.schedule_units}
          />
        </InputSectionBox>

        <InputSectionBox title="참여자 목록">
          {schedule.schedule_participants &&
          schedule.schedule_participants.length > 0 ? (
            <RespondantList
              schedule_participants={schedule.schedule_participants}
            />
          ) : (
            <div className={styles.noParticipants}>
              <p>아직 응답한 사람이 없습니다.</p>
              <p>
                <a onClick={handleCopy}>응답 링크</a>를 공유해 보세요!
              </p>
            </div>
          )}
        </InputSectionBox>
      </div>
    </div>
  );
}
