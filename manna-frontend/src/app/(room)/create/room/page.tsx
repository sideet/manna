"use client";
import axios from "axios";
import { useState } from "react";
import styles from "./page.module.css";
import Header from "@/app/_components/Header";
import InputSectionBox from "../../_components/InputSectionBox";
import InputField from "@/app/_components/InputField";
import BigButton from "@/app/_components/BigButton";
import { FaCirclePlus, FaLightbulb, FaPeopleGroup } from "react-icons/fa6";
import { FaCoffee } from "react-icons/fa";
import DateTimePicker from "@/app/_components/DateTimePicker";
import Toggle from "@/app/_components/Toggle";
import { useRouter } from "next/navigation";

export default function CreatRoomPage() {
  const router = useRouter();

  // 입력 상태값
  const [roomType, setRoomType] = useState<"common" | "individual">("common"); // TODO: 변수명 확인 필요

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  // interval selection state
  const [selectedInterval, setSelectedInterval] = useState("1시간");
  const [customInterval, setCustomInterval] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isParticipantVisible, setIsParticipantVisible] = useState(true);
  const [isDuplicateParticipation, setIsDuplicateParticipation] =
    useState(false);

  /** 생성하기 */
  const handleSubmit = async () => {
    if (
      !startDate ||
      !endDate ||
      (selectedInterval !== "종일" && (!startTime || !endTime))
    ) {
      alert("날짜와 시간을 모두 선택해주세요.");
      return;
    }

    const body = {
      name,
      description,
      type: roomType,
      is_participant_visible: isParticipantVisible,
      is_duplicate_participation: isDuplicateParticipation,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      start_time:
        selectedInterval === "종일" || !startTime
          ? undefined
          : startTime.toTimeString().split(" ")[0],
      end_time:
        selectedInterval === "종일" || !endTime
          ? undefined
          : endTime.toTimeString().split(" ")[0],
      time_unit:
        selectedInterval === "종일"
          ? "day"
          : selectedInterval === "30분"
          ? "minute"
          : "hour",
      time:
        selectedInterval === "기타"
          ? Number(customInterval)
          : selectedInterval === "1시간"
          ? 1
          : selectedInterval === "2시간"
          ? 2
          : selectedInterval === "3시간"
          ? 3
          : undefined,
    };

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/schedule`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("일정이 생성되었습니다.");
      router.replace(`/mypage/room/${res.data.schedule.no}`);
    } catch (error) {
      console.error("생성 실패:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header title="일정 생성하기" showBackButton />
      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title="일정 정보">
          <InputField
            label="일정 이름"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            label="일정 설명"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </InputSectionBox>

        <InputSectionBox title="일정 타입">
          <button
            type="button"
            className={`${styles.roomTypeButton} ${
              roomType === "common" ? styles.selectedRoomTypeButton : ""
            }`}
            onClick={() => setRoomType("common")}
          >
            <div className={styles.labelSubLabelWrapper}>
              공통 일정 (팀 프로젝트 등)
              <p>
                다른 참가자가 선택한 시간도 선택할 수 있어요. 가장 많은 사람이
                선택한 시간을 알려드려요.
              </p>
            </div>
            <FaPeopleGroup size={"1.25rem"} fill="#9CA3AF" />
          </button>
          <button
            type="button"
            className={`${styles.roomTypeButton} ${
              roomType === "individual" ? styles.selectedRoomTypeButton : ""
            }`}
            onClick={() => setRoomType("individual")}
          >
            <div className={styles.labelSubLabelWrapper}>
              개별 미팅 (커피챗, 면접 등)
              <p>
                한 시간에는 한 명만 참석할 수 있어요. 커피챗, 면접 등에 활용할
                수 있어요.
              </p>
            </div>
            <FaCoffee size={"1.20rem"} fill="#9CA3AF" />
          </button>
        </InputSectionBox>

        <InputSectionBox title="날짜 설정">
          <div className={styles.dateInputWrapper}>
            <DateTimePicker
              label="시작 날짜"
              selected={startDate}
              onChange={setStartDate}
              // minDate={} // TODO: 과거 허용할지 확인
              maxDate={endDate ?? undefined}
              placeholder={"-/-/-"}
              required
            />
            <DateTimePicker
              label="마지막 날짜"
              selected={endDate}
              onChange={setEndDate}
              minDate={startDate ?? undefined}
              placeholder={"-/-/-"}
              required
            />
          </div>
        </InputSectionBox>

        <div>
          <InputSectionBox title="시간 설정">
            <div className={styles.subInputSectionBox}>
              <FaLightbulb fill="#ffa0a0" />
              <div className={styles.labelSubLabelWrapper}>
                종료 시간은 생성되는 시간에 포함되지 않습니다.
                <p>
                  예: 시작 시간 10시, 종료 시간 12시, 2시간 간격인 경우 <br />
                  10시-12시만 생성됩니다{" "}
                </p>
              </div>
            </div>
            <div className={styles.dateInputWrapper}>
              <DateTimePicker
                label="시작 시간"
                selected={startTime}
                onChange={setStartTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30} // 30분 단위 등
                timeCaption="Time"
                dateFormat="HH:mm"
                maxTime={endTime ?? undefined}
              />
              <DateTimePicker
                label="종료 시간"
                selected={endTime}
                onChange={setEndTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30} // 30분 단위 등
                timeCaption="Time"
                dateFormat="HH:mm"
                minTime={startTime ?? undefined}
              />
            </div>
            <div className={styles.intervalWrapper}>
              <label htmlFor="interval-select" className={styles.label}>
                생성 간격<span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="interval-select"
                className={styles.select}
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                required
              >
                <option value="30분">30분</option>
                <option value="1시간">1시간</option>
                <option value="2시간">2시간</option>
                <option value="3시간">3시간</option>
                <option value="종일">종일</option>
                <option value="기타">기타</option>
              </select>
              {selectedInterval === "기타" && (
                <div className={styles.customIntervalWrapper}>
                  <label htmlFor="custom-interval" className={styles.label}>
                    간격 설정<span>*</span>
                  </label>
                  <div className={styles.customInputGroup}>
                    <input
                      id="custom-interval"
                      type="number"
                      min="1"
                      className={styles.input}
                      value={customInterval}
                      onChange={(e) => setCustomInterval(e.target.value)}
                      required
                    />
                    <span>시간</span>
                  </div>
                </div>
              )}
            </div>
          </InputSectionBox>
        </div>

        <InputSectionBox title="공유 옵션">
          <div className={styles.sharingOptionWrapper}>
            <div className={styles.labelSubLabelWrapper}>
              응답자 공개
              <p>응답자가 다른 응답자의 응답을 볼 수 있습니다.</p>
            </div>
            <Toggle
              checked={isParticipantVisible}
              onChange={() => setIsParticipantVisible(!isParticipantVisible)}
            />
          </div>
          <div className={styles.sharingOptionWrapper}>
            <div className={styles.labelSubLabelWrapper}>
              응답 중복 허용
              <p>한 명의 응답자가 여러 시간을 선택할 수 있습니다.</p>
            </div>
            <Toggle
              checked={isDuplicateParticipation}
              onChange={() =>
                setIsDuplicateParticipation(!isDuplicateParticipation)
              }
            />
          </div>
        </InputSectionBox>
        <BigButton onClick={handleSubmit}>
          <FaCirclePlus />
          생성하기
        </BigButton>
      </div>
    </div>
  );
}
