"use client";

import { useToast } from "@/providers/ToastProvider";
import { ScheduleResponseType } from "@/types/schedule";
import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { parse, format } from "date-fns";
import { ScheduleParticipantsResponseType } from "@/types/schedule";
import clientApi from "@/app/api/client";
import { IoChatboxEllipses, IoChevronDown, IoChevronUp } from "react-icons/io5";
import BlankResponseBox from "@/components/common/BlankResponseBox";

/** 관리자 일정 조회 > 응답 내역 컴포넌트 */
export default function ScheduleStatusView({
  schedule,
}: {
  schedule: ScheduleResponseType;
}) {
  const { showToast } = useToast();
  const [scheduleParticipants, setScheduleParticipants] = useState<
    ScheduleParticipantsResponseType["schedule_participants"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduleParticipants = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await clientApi.get<ScheduleParticipantsResponseType>(
        `/schedule/participants?schedule_no=${schedule.no}`
      );

      setScheduleParticipants(response.data?.schedule_participants ?? null);
    } catch (error) {
      console.error("스케줄 단위 조회 실패:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      showToast(
        axiosError.response?.data?.message ||
          "일정 참여자 정보를 불러올 수 없습니다.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [schedule.no, showToast]);

  // 초기 데이터 로드
  useEffect(() => {
    if (schedule.no) {
      fetchScheduleParticipants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.no]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">일정 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!scheduleParticipants || scheduleParticipants.length === 0) {
    return (
      <BlankResponseBox
        handleCopyLink={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/schedule/${schedule.code}`
          );
          showToast("링크가 복사되었습니다.");
        }}
      />
    );
  }

  return (
    <div className="space-y-12">
      {scheduleParticipants.map((participant, index) => (
        <ScheduleParticipantItem
          key={participant.no}
          participant={participant}
          defaultOpen={index === 0}
          timeUnit={schedule.time_unit}
          time={schedule.time}
        />
      ))}
    </div>
  );
}

const formatDateLabel = (date: string) => {
  try {
    const parsed = parse(date, "yyyy-MM-dd", new Date());
    return format(parsed, "yyyy년 M월 d일");
  } catch {
    return date;
  }
};

// 종료 시간 계산 (ManageTimeTable의 getEndTime 로직과 동일하게 사용)
const getEndTime = (
  startTime: string | null,
  timeUnit?: "DAY" | "HOUR" | "MINUTE",
  time?: number
): string => {
  if (!startTime || startTime === "종일") return "";
  if (!timeUnit) return "";

  const [h, m] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(h, m, 0, 0);

  if (timeUnit === "MINUTE") {
    // 분 단위: time 만큼 분 더하기 (기존 로직과 동일)
    startDate.setMinutes(startDate.getMinutes() + (time || 30));
  } else if (timeUnit === "HOUR") {
    // 시간 단위: time 시간 더하기
    startDate.setHours(startDate.getHours() + (time || 1));
  } else if (timeUnit === "DAY") {
    // 하루 단위인 경우 종료 시간을 별도로 표시하지 않음
    return "";
  }

  return startDate.toTimeString().slice(0, 5); // "HH:MM"
};

// "16:00-17:00" 형태로 반환
const formatTimeRange = (
  startTime: string | null,
  timeUnit?: "DAY" | "HOUR" | "MINUTE",
  time?: number
) => {
  if (!startTime) return "종일";

  try {
    const [h, m] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    const startLabel = format(startDate, "HH:mm");

    // DAY는 종일
    if (timeUnit === "DAY") {
      return "종일";
    }

    const endLabel = getEndTime(startTime, timeUnit, time);
    if (!endLabel) {
      return startLabel;
    }

    return `${startLabel}-${endLabel}`;
  } catch {
    return startTime;
  }
};

const ScheduleParticipantItem = ({
  participant,
  defaultOpen = false,
  timeUnit,
  time,
}: {
  participant: ScheduleParticipantsResponseType["schedule_participants"][number];
  defaultOpen?: boolean;
  timeUnit?: "DAY" | "HOUR" | "MINUTE";
  time?: number;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const responseCount = participant.participation_times.length;

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden">
      {/* 헤더 영역 (이름 + 응답 개수 + 토글 아이콘) */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-16 py-14"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p className="text-subtitle16 text-gray-900">{participant.name}</p>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6 px-12 py-4 bg-gray-100 rounded-full text-body14 text-gray-700">
            <IoChatboxEllipses className="w-20 h-20 text-gray-500" />
            <span>응답{responseCount}개</span>
          </div>
          {isOpen ? (
            <IoChevronUp className="w-20 h-20 text-gray-500" />
          ) : (
            <IoChevronDown className="w-20 h-20 text-gray-500" />
          )}
        </div>
      </button>

      {/* 상세 응답 내용 */}
      {isOpen && (
        <div className="px-16 pb-16 space-y-16">
          <div className="w-full h-1 bg-gray-100" />
          {/* 응답 내용 (날짜 / 시간 리스트) */}
          <div>
            <p className="text-subtitle13 text-gray-600 mb-8">응답 내용</p>
            <div className="bg-gray-50 rounded-[8px] px-16 py-12 space-y-8">
              {participant.participation_times.map((timeInfo) => (
                <div
                  key={timeInfo.no}
                  className="flex items-center justify-start gap-16"
                >
                  <span className="text-subtitle14 text-gray-800  font-semibold">
                    {formatDateLabel(timeInfo.schedule_unit.date)}
                  </span>
                  <div className="w-1 h-16 bg-gray-200" />{" "}
                  <span className="text-body14 text-gray-700">
                    {formatTimeRange(
                      timeInfo.schedule_unit.time,
                      timeUnit,
                      time
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 연락처 */}
          <div className="space-y-6">
            <p className="text-subtitle13 text-gray-600 ">연락처</p>
            <div className="w-full h-48 flex items-center px-14 bg-gray-50 rounded-[8px] text-subtitle14 text-gray-800">
              {participant.phone || "-"}
            </div>
          </div>

          {/* 이메일 */}
          <div className="space-y-6">
            <p className="text-subtitle13 text-gray-600">이메일</p>
            <div className="w-full h-48 flex items-center px-14 bg-gray-50 rounded-[8px] text-subtitle14 text-gray-800">
              {participant.email}
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-6">
            <p className="text-subtitle13 text-gray-600">메모</p>
            <div className="w-full min-h-72 flex items-center px-14 py-10 bg-gray-50 rounded-[8px] text-body14 text-gray-600">
              {participant.memo || "-"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
