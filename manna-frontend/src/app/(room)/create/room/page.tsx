"use client";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import styles from "./page.module.css";
import Header from "@/app/_components/Header";
import InputSectionBox from "../../_components/InputSectionBox";
import InputField from "@/app/_components/InputField";
import BigButton from "@/app/_components/BigButton";
import { FaCirclePlus, FaPeopleGroup } from "react-icons/fa6";
import { FaCoffee, FaUser } from "react-icons/fa";
import DateTimePicker from "@/app/_components/DateTimePicker";
import Toggle from "@/app/_components/Toggle";
import RegionSelector from "@/app/_components/RegionSelector";
import { useRouter } from "next/navigation";
import { subMonths, max, addMonths, format } from "date-fns";
import { useToast } from "@/app/_components/ToastProvider";
import clientApi from "@/app/api/client";
import TimePicker from "@/app/_components/TimePicker";
import {
  getIntervalInMinutes,
  buildStartTimeOptions,
  buildEndTimeOptions,
  formatTimeDisplay,
  buildTimeSlots,
} from "@/utils/timeUtils";

export default function CreatRoomPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // ===== 상태 관리 =====
  // 일정 기본 정보
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roomType, setRoomType] = useState<
    "common" | "individual" | "coffeechat"
  >("common");

  // 지역 정보
  const [meetingRegionNo, setMeetingRegionNo] = useState<number | null>(null);
  const [meetingRegionDetailNo, setMeetingRegionDetailNo] = useState<
    number | null
  >(null);
  const [meetingType, setMeetingType] = useState<"offline" | "online" | "none">(
    "offline"
  );

  // 날짜 설정
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 시간 설정
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedInterval, setSelectedInterval] = useState("1시간");
  const [customInterval, setCustomInterval] = useState("");

  // 공유 옵션
  const [isParticipantVisible, setIsParticipantVisible] = useState(true);
  const [isDuplicateParticipation, setIsDuplicateParticipation] =
    useState(false);

  // ===== 계산된 값들 =====
  // 현재 선택된 간격을 분 단위로 변환
  const intervalMinutes = useMemo(
    () => getIntervalInMinutes(selectedInterval, customInterval),
    [selectedInterval, customInterval]
  );

  // 시작시간 선택 옵션
  const startTimeOptions = useMemo(() => {
    if (selectedInterval === "종일") return [];
    return buildStartTimeOptions(intervalMinutes);
  }, [selectedInterval, intervalMinutes]);

  // 종료시간 선택 옵션
  const endTimeOptions = useMemo(() => {
    if (!startTime) return [];
    return buildEndTimeOptions(startTime, intervalMinutes);
  }, [startTime, intervalMinutes]);

  // 생성될 시간 슬롯 미리보기
  const timeSlots = useMemo(() => {
    if (!startTime || !endTime || selectedInterval === "종일") return [];
    return buildTimeSlots(startTime, endTime, intervalMinutes);
  }, [startTime, endTime, intervalMinutes, selectedInterval]);

  // ===== 사이드 이펙트 =====
  // 종료시간 옵션이 하나만 있을 때 자동 선택
  useEffect(() => {
    if (endTimeOptions.length === 1) {
      setEndTime(endTimeOptions[0]);
    }
  }, [endTimeOptions]);

  // ===== 이벤트 핸들러 =====
  /** 생성하기 */
  const handleSubmit = async () => {
    if (
      !startDate ||
      !endDate ||
      (selectedInterval !== "종일" && (!startTime || !endTime))
    ) {
      showToast("날짜와 시간을 모두 선택해주세요.", "warning");
      return;
    }

    // 오프라인이나 미정일 때만 지역 검증
    if (
      (meetingType === "offline" || meetingType === "none") &&
      !meetingRegionNo
    ) {
      showToast("일정 위치를 선택해주세요.", "warning");
      return;
    }

    const body = {
      name,
      description,
      type: roomType,
      is_participant_visible: isParticipantVisible,
      is_duplicate_participation: isDuplicateParticipation,
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
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
      // 지역 정보는 오프라인이나 미정일 때만 포함
      ...(meetingType === "offline" || meetingType === "none"
        ? {
            region_no: meetingRegionNo,
            // meetingRegionDetailNo가 있을 때만 포함 (전체 선택 시 제외)
            ...(meetingRegionDetailNo && {
              region_detail_no: meetingRegionDetailNo,
            }),
          }
        : {}),
      meeting_type: meetingType,
    };

    try {
      const res = await clientApi.post(`/schedule`, body);
      showToast("일정이 생성되었습니다.");
      router.replace(`/mypage/room/${res.data.schedule.no}`);
    } catch (error: unknown) {
      console.error("생성 실패:", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "생성에 실패했습니다.",
          "error"
        );
      } else {
        showToast("생성에 실패했습니다.", "error");
      }
    }
  };

  const handleRegionChange = (
    regionNo: number | null,
    regionDetailNo: number | null
  ) => {
    setMeetingRegionNo(regionNo);
    setMeetingRegionDetailNo(regionDetailNo);
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
              개별 미팅 (면접 등)
              <p>
                한 시간에는 한 명만 참석할 수 있어요. 면접, 인터뷰 등에 활용할
                수 있어요.
              </p>
            </div>
            <FaUser size={"1.20rem"} fill="#9CA3AF" />
          </button>
          <button
            type="button"
            className={`${styles.roomTypeButton} ${
              roomType === "coffeechat" ? styles.selectedRoomTypeButton : ""
            }`}
            onClick={() => setRoomType("coffeechat")}
          >
            <div className={styles.labelSubLabelWrapper}>
              커피챗
              <p>커피챗을 위한 특별한 일정입니다.</p>
            </div>
            <FaCoffee size={"1.20rem"} fill="#9CA3AF" />
          </button>
        </InputSectionBox>

        <InputSectionBox title="미팅 타입">
          <div className={styles.meetingTypeWrapper}>
            <label className={styles.label}>미팅 방식</label>
            <div className={styles.meetingTypeButtons}>
              <button
                type="button"
                className={`${styles.meetingTypeButton} ${
                  meetingType === "offline"
                    ? styles.selectedMeetingTypeButton
                    : ""
                }`}
                onClick={() => setMeetingType("offline")}
              >
                오프라인
              </button>
              <button
                type="button"
                className={`${styles.meetingTypeButton} ${
                  meetingType === "online"
                    ? styles.selectedMeetingTypeButton
                    : ""
                }`}
                onClick={() => setMeetingType("online")}
              >
                온라인
              </button>
              <button
                type="button"
                className={`${styles.meetingTypeButton} ${
                  meetingType === "none" ? styles.selectedMeetingTypeButton : ""
                }`}
                onClick={() => setMeetingType("none")}
              >
                미정
              </button>
            </div>
          </div>

          {(meetingType === "offline" || meetingType === "none") && (
            <RegionSelector onRegionChange={handleRegionChange} />
          )}
        </InputSectionBox>

        <InputSectionBox title="날짜 설정">
          <div className={styles.dateInputWrapper}>
            <DateTimePicker
              label="시작 날짜"
              selected={startDate}
              onChange={setStartDate}
              minDate={
                endDate
                  ? max([new Date(), subMonths(endDate, 1)]) // 오늘 vs 종료일-1개월 중 늦은 날
                  : new Date() // endDate 없으면 오늘이 최소
              }
              maxDate={endDate ?? undefined}
              placeholder={"-/-/-"}
              required
            />
            <DateTimePicker
              label="마지막 날짜"
              selected={endDate}
              onChange={setEndDate}
              minDate={startDate ? startDate : new Date()}
              maxDate={startDate ? addMonths(startDate, 1) : undefined} // startDate 기준 한 달 후
              placeholder={"-/-/-"}
              required
            />
          </div>
        </InputSectionBox>

        <div>
          <InputSectionBox title="시간 설정">
            <div className={styles.intervalWrapper}>
              <label htmlFor="interval-select" className={styles.label}>
                생성 간격<span style={{ color: "red" }}>*</span>
              </label>
              <select
                id="interval-select"
                className={styles.select}
                value={selectedInterval}
                onChange={(e) => {
                  setSelectedInterval(e.target.value);
                  // 생성 간격이 변경되면 기존 시간 선택 초기화
                  setStartTime(null);
                  setEndTime(null);
                }}
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
                      onChange={(e) => {
                        setCustomInterval(e.target.value);
                        // 커스텀 간격이 변경되면 기존 시간 선택 초기화
                        if (selectedInterval === "기타") {
                          setStartTime(null);
                          setEndTime(null);
                        }
                      }}
                      required
                    />
                    <span>시간</span>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.dateInputWrapper}>
              <TimePicker
                label="시작 시간"
                options={startTimeOptions}
                selected={startTime}
                onChange={(time) => {
                  setStartTime(time);
                  // 시작시간이 변경되면 종료시간 초기화 (새로운 간격에 맞지 않을 수 있음)
                  setEndTime(null);
                }}
                disabled={selectedInterval === "종일"}
                placeholder="시작 시간을 선택하세요"
                required
              />
              <TimePicker
                label="마지막 시작 시간"
                options={endTimeOptions}
                selected={endTime}
                onChange={setEndTime}
                disabled={selectedInterval === "종일"}
                placeholder="마지막 시작 시간을 선택하세요"
                required
              />
            </div>
            <div className={styles.intervalWrapper}>
              <label className={styles.label}>생성될 시간 옵션</label>
              <div className={styles.timePreview}>
                {startTime &&
                endTime &&
                selectedInterval !== "종일" &&
                timeSlots.length > 0 ? (
                  <>
                    <div className={styles.timeSlotCount}>
                      총 {timeSlots.length}개의 시간대가 생성됩니다
                    </div>
                    <div className={styles.timeSlots}>
                      {timeSlots.map(({ from, to }, index) => (
                        <div key={index} className={styles.timeSlot}>
                          {formatTimeDisplay(from, startTime)}-
                          {formatTimeDisplay(to, startTime)}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.timePreviewEmpty}>
                    {selectedInterval === "종일"
                      ? "종일 일정은 날짜별로 생성됩니다"
                      : "간격, 시작 시간, 마지막 시작 시간을 선택하면 생성될 시간 옵션을 확인할 수 있습니다"}
                  </div>
                )}
              </div>
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
