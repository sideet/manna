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
} from "react-icons/fa6";
import { useState, useEffect } from "react";
import TimeTable from "@/app/(room)/_components/TimeTable";
import axios from "axios";
import { ScheduleType } from "@/types/schedule";
import { useParams, useRouter } from "next/navigation";
import SelectedDateTime from "@/app/(room)/_components/SelectedDateTime";

export default function JoinRoomPage() {
  const { roomCode: encodedRoomCode } = useParams();
  const roomCode = decodeURIComponent(encodedRoomCode as string);
  const router = useRouter();

  // 일정 정보
  const [schedule, setSchedule] = useState<ScheduleType | undefined>();

  /**
   * 일정 정보 fetch
   */
  const init = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4030/schedule/guest?code=${roomCode}`
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
      await axios.post("http://localhost:4030/schedule/answer", {
        schedule_no: schedule.schedule_no,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        memo: formData.memo,
        schedule_unit_nos: selectedUnitNos,
      });
      alert("응답이 제출되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("응답 제출 실패", error);
      alert("응답 제출에 실패했습니다.");
    }
  };

  if (!schedule) {
    return <div>로딩 중...</div>;
  }

  /** 시간 렌더링 정보 */

  const dates = Object.keys(schedule?.schedule_units); // ['2025-07-19', '2025-07-20', ...]

  const allTimes = Object.values(schedule.schedule_units)
    .flat()
    .map((unit) => parseInt(unit.time.slice(0, 2)));

  const minHour = Math.min(...allTimes);
  const maxHour = Math.max(...allTimes);

  const HOURS = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i
  );

  return (
    <div className={styles.container}>
      <Header title={schedule.name} showBackButton />

      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title="방 정보">
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
            hours={HOURS}
            schedule_units={schedule.schedule_units}
            onSelect={selectTime}
            selectedUnitNos={selectedUnitNos}
          />
        </InputSectionBox>

        <InputSectionBox title="선택 일시">
          <SelectedDateTime
            selectedUnitNos={selectedUnitNos}
            dates={dates}
            schedule_units={schedule.schedule_units}
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
            label="연락처"
            name="phone"
            required
            value={formData.phone}
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
            label="남기는 말"
            name="memo"
            textarea
            value={formData.memo}
            onChange={handleInputChange}
          />
        </InputSectionBox>
      </div>

      <div className={styles.submitArea}>
        <p className={styles.helperText}>시간을 선택해주세요</p>
        <button className={styles.submitButton} onClick={submitAnswer}>
          <FaPaperPlane />
          응답 제출하기
        </button>
      </div>
    </div>
  );
}
