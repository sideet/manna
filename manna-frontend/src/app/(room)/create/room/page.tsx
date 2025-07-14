"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Header from "@/app/_components/Header";
import InputSectionBox from "../../_components/InputSectionBox";
import InputField from "@/app/_components/InputField";
import BigButton from "@/app/_components/BigButton";
import { FaCirclePlus, FaPeopleGroup } from "react-icons/fa6";
import { FaCoffee } from "react-icons/fa";
import DateTimePicker from "@/app/_components/DateTimePicker";
import Toggle from "@/app/_components/Toggle";

export default function CreatRoomPage() {
  const [roomType, setRoomType] = useState<"team" | "personal">("team"); // TODO: 변수명 확인 필요

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  // interval selection state
  const [selectedInterval, setSelectedInterval] = useState("1시간");
  const [customInterval, setCustomInterval] = useState("");

  /**
   * 로그인 여부 검사
   * @method
   */
  const checkIsUser = () => {
    if (false) {
      // 페이지 이동
    }
  };

  useEffect(() => {
    // 로그인 여부 검사

    checkIsUser();
  }, []);

  return (
    <div className={styles.container}>
      <Header title="일정 생성하기" showBackButton />
      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title="일정 정보">
          <InputField label="일정 이름" required />
          <InputField label="일정 설명" />
        </InputSectionBox>

        <InputSectionBox title="일정 타입">
          <button
            type="button"
            className={`${styles.roomTypeButton} ${
              roomType === "team" ? styles.selectedRoomTypeButton : ""
            }`}
            onClick={() => setRoomType("team")}
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
              roomType === "personal" ? styles.selectedRoomTypeButton : ""
            }`}
            onClick={() => setRoomType("personal")}
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
              label="시작일"
              selected={startDate}
              onChange={setStartDate}
              // minDate={} // TODO: 과거 허용할지 확인
              maxDate={endDate ?? undefined}
              placeholder={"-/-/-"}
              required
            />
            <DateTimePicker
              label="종료일"
              selected={endDate}
              onChange={setEndDate}
              minDate={startDate ?? undefined}
              placeholder={"-/-/-"}
              required
            />
          </div>
        </InputSectionBox>

        <InputSectionBox title="시간 설정">
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
        <InputSectionBox title="공유 옵션">
          <div className={styles.sharingOptionWrapper}>
            <div className={styles.labelSubLabelWrapper}>
              응답자 공개
              <p>응답자가 다른 응답자의 응답을 볼 수 있습니다.</p>
            </div>
            <Toggle checked={true} onChange={() => {}} />
          </div>
          <div className={styles.sharingOptionWrapper}>
            <div className={styles.labelSubLabelWrapper}>
              응답 중복 허용
              <p>한 명의 응답자가 여러 시간을 선택할 수 있습니다.</p>
            </div>
            <Toggle checked={false} onChange={() => {}} />
          </div>
        </InputSectionBox>
        <BigButton>
          <FaCirclePlus />
          생성하기
        </BigButton>
      </div>
    </div>
  );
}
