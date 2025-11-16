"use client";

import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import Header from "@/components/common/Header";
import { useRouter } from "next/navigation";
import { subMonths, max, addMonths, format } from "date-fns";
import { useToast } from "@/providers/ToastProvider";
import clientApi from "@/app/api/client";
import TimePicker from "@/components/picker/TimePicker";
import Toggle from "@/components/base/Toggle";
import {
  buildStartTimeOptions,
  buildEndTimeOptions,
  getIntervalInMinutes,
} from "@/utils/timeUtils";
import Input from "@/components/base/Input";
import Tab from "@/components/base/Tab";
import Divider from "@/components/base/Divider";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoCalendarClear, IoTimeSharp } from "react-icons/io5";
import Button from "@/components/base/Button";
import TimerIcon from "@/assets/icons/timerIcon.svg";
import ScheduleSuccessBottomSheet from "./ScheduleSuccessBottomSheet";

export default function CreateSchedule({
  type = "COMMON",
  onBack,
}: {
  type?: "COMMON" | "INDIVIDUAL";
  onBack: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  // ===== 상태 관리 =====
  // 일정 기본 정보
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState<"OFFLINE" | "ONLINE" | "NONE">(
    "ONLINE"
  );
  const [detailAddress, setDetailAddress] = useState("");

  // 진행 시간 설정
  const [selectedInterval, setSelectedInterval] = useState("1시간");
  const [customInterval, setCustomInterval] = useState("");

  // 날짜 설정
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 시간 설정
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  // 공유 옵션
  const [isParticipantVisible, setIsParticipantVisible] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDateTime, setDeadlineDateTime] = useState<Date | null>(null);

  // 바텀시트 상태
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const [createdScheduleCode, setCreatedScheduleCode] = useState<string | null>(
    null
  );
  const [shareLink, setShareLink] = useState("");

  // ===== 계산된 값들 =====
  // 진행 시간을 간격으로 사용
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
    if (!name.trim() || name.length < 2) {
      showToast("일정 이름을 입력해주세요.", "warning");
      return;
    }

    if (!startDate || !endDate) {
      showToast("날짜 범위를 선택해주세요.", "warning");
      return;
    }

    if (!startTime || !endTime) {
      showToast("시간 범위를 선택해주세요.", "warning");
      return;
    }

    // 마감 시간 설정이 켜져있을 때 검증
    if (hasDeadline && !deadlineDateTime) {
      showToast("마감 날짜와 시간을 선택해주세요.", "warning");
      return;
    }

    const body = {
      name,
      description,
      type: type,
      is_participant_visible: isParticipantVisible,
      is_duplicate_participation: true, // 기본값
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      start_time: startTime.toTimeString().split(" ")[0],
      end_time: endTime.toTimeString().split(" ")[0],
      time_unit:
        selectedInterval === "종일"
          ? "DAY"
          : selectedInterval === "30분"
          ? "MINUTE"
          : "HOUR",
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
      meeting_type: meetingType,
      detail_address: detailAddress,
      // 마감 시간이 설정되어 있을 때 포함
      ...(hasDeadline && deadlineDateTime
        ? {
            expiry_datetime: format(deadlineDateTime, "yyyy-MM-dd HH:mm:ss"),
          }
        : {}),
    };

    try {
      const res = await clientApi.post(`/schedule`, body);
      const scheduleCode = res.data.schedule.code;
      const link = `https://manna.it.kr/schedule/${scheduleCode}`;

      setCreatedScheduleCode(scheduleCode);
      setShareLink(link);
      setShowSuccessSheet(true);
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

  return (
    <div className="min-h-screen pb-32">
      <Header
        title={type === "COMMON" ? "단체 모임 만들기" : "개별 미팅 만들기"}
        leftSlotType="back"
        onBack={onBack}
        rightSlotType="user"
      />

      {/* 기본 정보 섹션 */}
      <section className="space-y-24">
        <h2 className="text-head22 text-gray-800">어떤 일정을 생성하나요?</h2>
        {/* 일정 이름 */}
        <Input
          name="name"
          label="이름"
          placeholder="일정의 이름을 입력해주세요."
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
        />

        {/* 상세 내용 */}
        <div>
          <label className="text-subtitle16 text-gray-800 mb-8">
            상세 내용
          </label>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="진행하는 상세 내용을 입력해주세요."
            rows={4}
            className="w-full p-10 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-transparent resize-none"
          />
        </div>

        {/* 일정 타입 (온라인/오프라인/미정) */}
        <div>
          <label className="text-subtitle16 text-gray-800 mb-16">
            일정 타입
          </label>
          <div className="flex gap-8 mb-4">
            <Tab
              selected={meetingType === "ONLINE"}
              onClick={() => {
                setMeetingType("ONLINE");
              }}
            >
              온라인
            </Tab>
            <Tab
              selected={meetingType === "OFFLINE"}
              onClick={() => {
                setMeetingType("OFFLINE");
              }}
            >
              오프라인
            </Tab>
            <Tab
              selected={meetingType === "NONE"}
              onClick={() => {
                setMeetingType("NONE");
                setDetailAddress("");
              }}
            >
              미정
            </Tab>
          </div>

          {/* 온라인 선택 시 링크 입력 */}
          {(meetingType === "ONLINE" || meetingType === "OFFLINE") && (
            <Input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              maxLength={150}
              placeholder={
                meetingType === "ONLINE"
                  ? "관련 링크를 첨부해주세요."
                  : "만날 장소의 주소 혹은 링크를 첨부해주세요."
              }
            />
          )}
        </div>

        {/* 진행 시간 설정 */}
        <div>
          <label className="text-subtitle16 text-gray-800 mb-8">
            진행 시간 설정
          </label>
          <p className="text-body13 text-gray-600 mb-8">
            한 일정을 몇 분 진행할 지 선택해주세요.
          </p>
          <div className="relative">
            <select
              id="interval-select"
              className={
                "w-full h-54 px-12 py-3 text-body16 bg-white border border-gray-200 rounded-[8px] transition-all duration-200 focus:outline-none"
              }
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
              <div className={"w-full"}>
                <label htmlFor="custom-interval" className={""}>
                  간격 설정
                </label>
                <div className="w-full flex gap-12 items-center">
                  <Input
                    id="custom-interval"
                    type="number"
                    min="1"
                    value={customInterval}
                    onChange={(e) => {
                      // 양수만 입력
                      if (Number(e.target.value) <= 0) {
                        return;
                      }
                      setCustomInterval(e.target.value);
                      // 커스텀 간격이 변경되면 기존 시간 선택 초기화
                      if (selectedInterval === "기타") {
                        setStartTime(null);
                        setEndTime(null);
                      }
                    }}
                    className="w-full flex-1"
                  />
                  <span className="">시간</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Divider className="my-28" />
      {/* 시간 선택 섹션 */}
      <section className="space-y-24">
        {/* 모집 시간 설정 */}
        <div>
          <h2 className="text-head22 text-gray-800 mb-24">
            어떤 시간에 모집하나요?
          </h2>

          {/* 날짜 범위 선택 */}
          <div className="mb-24">
            <label className="text-subtitle16 text-gray-800 mb-2">
              날짜 설정
            </label>
            <p className="text-sm text-gray-600 mb-8">
              일정을 진행할 수 있는 날짜 범위를 선택해주세요.
            </p>
            <DatePicker
              placeholderText="YYYY.MM.DD ~ YYYY.MM.DD"
              dateFormat="yyyy.MM.dd"
              selectsRange={true}
              selected={startDate}
              startDate={startDate}
              endDate={endDate}
              minDate={
                endDate ? max([new Date(), subMonths(endDate, 3)]) : new Date()
              }
              maxDate={
                startDate ? addMonths(startDate, 3) : addMonths(new Date(), 3)
              }
              onChange={(dates: [Date | null, Date | null]) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
              }}
              customInput={
                <div className="w-full h-54 border border-gray-200 bg-gray-50 rounded-[8px] flex items-center justify-between px-12">
                  {startDate ? (
                    <span className="w-full">
                      {startDate ? format(startDate, "yyyy.MM.dd") : ""}
                      {endDate
                        ? " ~ " + format(endDate, "yyyy.MM.dd")
                        : "~ 종료일을 입력해 주세요."}
                    </span>
                  ) : (
                    <span className="w-full text-gray-400">
                      YYYY.MM.DD ~ YYYY.MM.DD
                    </span>
                  )}
                  <IoCalendarClear className="w-24 h-24" />
                </div>
              }
            />
          </div>

          {/* 시간 범위 선택 */}
          <div>
            <label className="text-subtitle16 text-gray-800 mb-2">
              시간 설정
            </label>
            <p className="text-sm text-gray-600 mb-3">
              일정을 진행할 수 있는 시간 범위를 선택해주세요.
            </p>
            {selectedInterval === "종일" ? (
              // TODO: rounded-[8px]로 통일 or 특정값 부여
              <div className="w-full h-54 bg-gray-50 border border-gray-200 rounded-[8px] flex items-center justify-between px-12 text-body16 text-gray-800">
                종일
                <TimerIcon
                  width={24}
                  height={24}
                  fill="var(--color-gray-900)"
                />
              </div>
            ) : (
              <div className="flex gap-21">
                <div className="flex-1">
                  <TimePicker
                    options={startTimeOptions}
                    selected={startTime}
                    onChange={setStartTime}
                    placeholder="시작 시간"
                    disabled={selectedInterval === "종일"}
                    icon={<IoTimeSharp className="w-24 h-24 text-gray-800" />}
                  />
                </div>
                <div className="flex items-center text-subtitle16 text-gray-600">
                  ~
                </div>
                <div className="flex-1">
                  <TimePicker
                    options={endTimeOptions}
                    selected={endTime}
                    onChange={setEndTime}
                    placeholder="종료 시간"
                    disabled={selectedInterval === "종일"}
                    icon={
                      <IoTimeSharp className="w-24 h-24 text-gray-800 rotate-180" />
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Divider className="my-28" />

      <section className="space-y-28 mb-30">
        {/* 응답자 공개 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-subtitle16 text-gray-800">응답자 공개</p>
            <p className="text-body14 text-gray-600">
              응답자는 다른 응답 내용을 볼 수 있어요.
            </p>
          </div>
          <Toggle
            checked={isParticipantVisible}
            onChange={(e) => setIsParticipantVisible(e.target.checked)}
          />
        </div>

        {/* 마감 시간 설정 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-subtitle16 text-gray-800">마감 시간 설정</p>
            <p className="text-body14 text-gray-600">
              일정 모집의 마감 시간을 설정해요.
            </p>
          </div>
          <Toggle
            checked={hasDeadline}
            onChange={(e) => {
              setHasDeadline(e.target.checked);
              if (!e.target.checked) {
                setDeadlineDateTime(null);
              }
            }}
          />
        </div>

        {/* 마감 시간 입력 (토글이 켜져있을 때만 표시) */}
        {hasDeadline && (
          <DatePicker
            placeholderText="YYYY.MM.DD 00시 까지"
            dateFormat="yyyy.MM.dd HH:mm까지"
            showTimeSelect
            selected={deadlineDateTime}
            onChange={setDeadlineDateTime}
            minDate={new Date()}
            customInput={
              <div
                className={`w-full h-54 border border-gray-200 bg-gray-50 rounded-[8px] flex items-center justify-between px-12 text-body16 ${
                  deadlineDateTime ? "text-gray-800" : "text-gray-400"
                }`}
              >
                <span className="w-full">
                  {deadlineDateTime
                    ? format(deadlineDateTime, "yyyy.MM.dd HH:mm까지")
                    : "YYYY.MM.DD 00시 까지"}
                </span>
                <IoCalendarClear className="w-24 h-24" />
              </div>
            }
          />
        )}
      </section>

      {/* 일정 생성하기 버튼 */}
      <Button onClick={handleSubmit} disabled={!name}>
        일정 생성하기
      </Button>

      {/* 성공 바텀시트 */}

      <ScheduleSuccessBottomSheet
        isOpen={showSuccessSheet}
        onClose={() => setShowSuccessSheet(false)}
        shareLink={shareLink}
        onCopyLink={() => {
          navigator.clipboard.writeText(shareLink);
          showToast("링크가 복사되었습니다.");
        }}
        onCheckSchedule={() => {
          if (createdScheduleCode) {
            router.replace(`/mypage/schedule/${createdScheduleCode}`);
          }
        }}
      />
    </div>
  );
}
