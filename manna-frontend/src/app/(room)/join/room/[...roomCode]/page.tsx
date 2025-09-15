"use client";
import styles from "./page.module.css";
import Header from "@/app/_components/Header";
import InputSectionBox from "../../../_components/InputSectionBox";
import InputField from "@/app/_components/InputField";
import {
  FaUserShield,
  FaEye,
  FaCheckDouble,
  FaPaperPlane,
  FaRegFileCode,
  FaQuestion,
  FaVideo,
} from "react-icons/fa6";
import { useState, useEffect, useCallback } from "react";
import TimeTable from "@/app/(room)/_components/TimeTable";
import axios from "axios";
import { ScheduleType } from "@/types/schedule";
import { useParams, useRouter } from "next/navigation";
import SelectedDateTime from "@/app/(room)/_components/SelectedDateTime";
import Loading from "@/app/_components/Loading";
import { useToast } from "@/app/_components/ToastProvider";
import clientApi from "@/app/api/client";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function JoinRoomPage() {
  const { roomCode: encodedRoomCode } = useParams();
  const roomCode = encodedRoomCode as string;
  const router = useRouter();
  const { showToast } = useToast();

  // 일정 정보
  const [schedule, setSchedule] = useState<ScheduleType | undefined>();

  /**
   * 일정 정보 fetch
   */
  const init = useCallback(async () => {
    try {
      const res = await clientApi.get(`/schedule/guest?code=${roomCode}`, {
        headers: {
          skipAuth: true,
        },
      });
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
      router.push("/home");
    }
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return;
    init();
  }, [init]);

  // 선택한 시간 배열
  const [selectedUnitNos, setSelectedUnitNos] = useState<number[]>([]);
  // 응답자 정보 폼
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    memo: "",
  });

  /**
   * 시간 선택
   * @method
   */
  const selectTime = (unitNo: number) => {
    if (schedule?.is_duplicate_participation) {
      // 중복 허용 응답의 시간 선택
      setSelectedUnitNos((prev) =>
        prev.includes(unitNo)
          ? prev.filter((no) => no !== unitNo)
          : [...prev, unitNo]
      );
    } else {
      // 중복 비허용
      setSelectedUnitNos([unitNo]);
    }
  };

  /**
   * 응답자 정보 입력
   * @method
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 응답 제출
   * @method
   */
  const submitAnswer = async () => {
    try {
      if (!schedule) return;

      if (!formData.name) {
        showToast("참가자 정보를 입력해 주세요.", "warning");
        return;
      }

      if (!formData.email || !isValidEmail(formData.email)) {
        showToast("이메일을 입력해 주세요.", "warning");
        return;
      }

      if (selectedUnitNos.length < 1) {
        showToast("시간을 선택해 주세요.", "warning");
        return;
      }

      const confirmSubmit = confirm("응답을 제출하시겠습니까?");
      if (!confirmSubmit) return;

      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/schedule/answer`, {
        schedule_no: schedule.no,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        memo: formData.memo,
        schedule_unit_nos: selectedUnitNos,
      });
      showToast("응답이 제출되었습니다.");
      router.push("/home");
    } catch (error) {
      console.error("응답 제출 실패", error);
      showToast("응답 제출에 실패했습니다.", "error");
    }
  };

  if (!schedule) {
    return (
      <div className={styles.container}>
        <Header title={""} showBackButton />
        <Loading />
      </div>
    );
  }

  /** 시간 렌더링 정보 */
  const dates = Object.keys(schedule?.schedule_units); // ['2025-07-19', '2025-07-20', ...]

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
      <Header title={schedule.name} showBackButton />

      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title="일정 정보">
          <p className={styles.description}>{schedule.description}</p>

          <div className={styles.roomInfoLabelBoxWrapper}>
            <div className={styles.roomInfoLabelBox}>
              <FaUserShield />
              <p>생성자: {schedule.user.name}</p>
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

            <button
              type="button"
              onClick={handleCodeCopy}
              className={styles.roomInfoLabelBox}
            >
              <FaRegFileCode />
              <p>일정 코드: {schedule.code}</p>
            </button>

            {schedule.meeting_type === "offline" ? (
              <div className={styles.roomInfoLabelBox}>
                <FaMapMarkerAlt />
                <p>일정 타입: 오프라인</p>
              </div>
            ) : schedule.meeting_type === "online" ? (
              <div className={styles.roomInfoLabelBox}>
                <FaVideo />
                <p>일정 타입: 온라인</p>
              </div>
            ) : (
              <div className={styles.roomInfoLabelBox}>
                <FaQuestion />
                <p>일정 타입: 미정</p>
              </div>
            )}
          </div>
          {/* TODO: 위치 정보 추가 및 확인 필요 */}
          <div className={styles.roomInfoLabelBox}>
            <FaMapMarkerAlt />
            <p>
              일정 위치: {schedule.region?.name} {schedule.region_detail?.name}
            </p>
          </div>
        </InputSectionBox>
        {/* TODO: 주간 선택 기능 추가시 주석 해제
        <InputSectionBox>
          <SelectWeekCalendar
            startDate={schedule.start_date}
            endDate={schedule.end_date}
          />
        </InputSectionBox> */}

        <InputSectionBox title="시간 선택">
          <TimeTable
            dates={dates}
            schedule_units={schedule.schedule_units}
            onSelect={selectTime}
            selectedUnitNos={selectedUnitNos}
            schedule_type={schedule.type}
            is_participant_visible={schedule.is_participant_visible}
          />
        </InputSectionBox>

        <InputSectionBox title="선택 일시">
          <SelectedDateTime
            selectedUnitNos={selectedUnitNos}
            dates={dates}
            schedule_units={schedule.schedule_units}
            time_unit={schedule.time_unit}
            time={schedule.time}
          />
        </InputSectionBox>

        <InputSectionBox title="참가자 정보">
          <InputField
            label="이름"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
          />
          <InputField
            label="이메일"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
          />
          <InputField
            label="연락처"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <InputField
            label="남기는 말"
            name="memo"
            textarea
            value={formData.memo}
            onChange={handleInputChange}
          />
        </InputSectionBox>
      </div>

      <div className={styles.submitArea}>
        <p className={styles.helperText}>
          {selectedUnitNos.length < 1 ? "시간을 선택해주세요" : ""}
        </p>
        <button
          disabled={
            !formData.name ||
            !isValidEmail(formData.email) ||
            selectedUnitNos.length < 1
          }
          className={styles.submitButton}
          onClick={submitAnswer}
        >
          <FaPaperPlane />
          응답 제출하기
        </button>
      </div>
    </div>
  );
}

//  helpers

function isValidEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
