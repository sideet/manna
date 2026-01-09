"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ResponseTimeTable from "./timetable/ResponseTimeTable";
import Input from "@/components/base/Input";
import Button from "@/components/base/Button";
import clientApi from "@/app/api/client";
import { useToast } from "@/providers/ToastProvider";
import {
  GuestScheduleResponseType,
  GuestScheduleUnitType,
} from "@/types/schedule";
import axios, { AxiosError } from "axios";
import { addDays, parse, format } from "date-fns";
import {
  saveScheduleResponse,
  getScheduleResponse,
  ScheduleResponseData,
} from "@/utils/scheduleResponseStorage";
import ScheduleResponseCompleteView from "./ScheduleResponseCompleteView";

interface ScheduleResponseFormProps {
  schedule: GuestScheduleResponseType;
}

interface ScheduleUnitsResponse {
  schedule_units: {
    [date: string]: GuestScheduleUnitType[];
  };
}

export default function ScheduleResponseForm({
  schedule,
}: ScheduleResponseFormProps) {
  const { showToast } = useToast();
  const [scheduleUnits, setScheduleUnits] =
    useState<ScheduleUnitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedUnitNos, setSelectedUnitNos] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    memo: "",
  });
  const [loadedDates, setLoadedDates] = useState<Set<string>>(new Set());
  const timeTableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [savedResponseData, setSavedResponseData] =
    useState<ScheduleResponseData | null>(null);

  // 스케줄 단위 데이터 조회 함수
  const fetchScheduleUnits = useCallback(
    async (searchDate: string, isInitial = false) => {
      // 이미 로드된 날짜인지 확인
      if (loadedDates.has(searchDate)) {
        return;
      }

      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await axios.get<ScheduleUnitsResponse>(
          `/api/schedule/units/guest?schedule_no=${schedule.no}&search_date=${searchDate}`
        );

        setScheduleUnits((prev) => {
          if (!prev) {
            return response.data;
          }

          // 기존 데이터와 병합
          const merged: ScheduleUnitsResponse = {
            schedule_units: { ...prev.schedule_units },
          };

          // 새 데이터 병합
          Object.keys(response.data.schedule_units).forEach((date) => {
            if (!merged.schedule_units[date]) {
              merged.schedule_units[date] = [];
            }
            // 중복 제거 (no 기준)
            const existingNos = new Set(
              merged.schedule_units[date].map((u) => u.no)
            );
            const newUnits = response.data.schedule_units[date].filter(
              (u) => !existingNos.has(u.no)
            );
            merged.schedule_units[date] = [
              ...merged.schedule_units[date],
              ...newUnits,
            ];
          });

          return merged;
        });

        setLoadedDates((prev) => new Set([...prev, searchDate]));
      } catch (error) {
        console.error("스케줄 단위 조회 실패:", error);
        const axiosError = error as AxiosError<{ message?: string }>;
        if (isInitial) {
          showToast(
            axiosError.response?.data?.message ||
              "일정 시간 정보를 불러올 수 없습니다.",
            "error"
          );
        }
      } finally {
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [schedule.no, loadedDates, showToast]
  );

  // 로컬스토리지에서 저장된 응답 확인
  useEffect(() => {
    const savedData = getScheduleResponse(schedule.code);
    if (savedData) {
      setSavedResponseData(savedData);
    }
  }, [schedule.code]);

  // 초기 데이터 로드 (완료 뷰가 아닐 때만)
  useEffect(() => {
    if (schedule.no && !savedResponseData) {
      const searchDate = schedule.start_date.includes(" ")
        ? schedule.start_date.split(" ")[0]
        : schedule.start_date;

      fetchScheduleUnits(searchDate, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.no, savedResponseData]);

  // 가로 무한스크롤
  //TODO: 호출 타이밍 확인 필요
  const loadNextWeek = useCallback(() => {
    if (!scheduleUnits) return;

    const dates = Object.keys(scheduleUnits.schedule_units).sort();
    const lastDate = dates[dates.length - 1];
    const nextWeekStart = addDays(parse(lastDate, "yyyy-MM-dd", new Date()), 7);
    const nextWeekStartStr = format(nextWeekStart, "yyyy-MM-dd");

    fetchScheduleUnits(nextWeekStartStr, false);
  }, [scheduleUnits, fetchScheduleUnits]);

  useEffect(() => {
    if (!timeTableRef.current || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoadingMore) {
            loadNextWeek(); // 이 부분에서 API 호출
          }
        });
      },
      {
        root: timeTableRef.current, // 가로 스크롤 대상
        threshold: 0.8,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [scheduleUnits, isLoadingMore, loadNextWeek]);

  // 시간 선택 핸들러
  const handleTimeSelect = (unitNo: number) => {
    if (schedule.is_duplicate_participation) {
      // 중복 허용: 토글 방식
      setSelectedUnitNos((prev) =>
        prev.includes(unitNo)
          ? prev.filter((no) => no !== unitNo)
          : [...prev, unitNo]
      );
    } else {
      // 중복 비허용: 단일 선택
      setSelectedUnitNos([unitNo]);
    }
  };

  // 폼 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 이메일 유효성 검사
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 응답 제출
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        showToast("이름을 입력해주세요.", "warning");
        return;
      }

      if (!formData.email.trim() || !isValidEmail(formData.email)) {
        showToast("올바른 이메일을 입력해주세요.", "warning");
        return;
      }

      if (selectedUnitNos.length === 0) {
        showToast("참여 가능한 시간을 선택해주세요.", "warning");
        return;
      }

      const confirmSubmit = confirm("응답을 제출하시겠습니까?");
      if (!confirmSubmit) return;

      await clientApi.post(
        `/schedule/answer`,
        {
          schedule_no: schedule.no,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          memo: formData.memo || undefined,
          schedule_unit_nos: selectedUnitNos,
        },
        {
          headers: { skipAuth: true },
        }
      );

      // 로컬스토리지에 응답 정보 저장
      const responseData: ScheduleResponseData = {
        schedule_no: schedule.no,
        selectedUnitNos,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        memo: formData.memo || undefined,
        submittedAt: new Date().toISOString(),
      };
      saveScheduleResponse(schedule.code, responseData);

      showToast("응답이 제출되었습니다.", "success");
      // 완료 뷰로 전환
      setSavedResponseData(responseData);
    } catch (error) {
      console.error("응답 제출 실패:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      showToast(
        axiosError.response?.data?.message || "응답 제출에 실패했습니다.",
        "error"
      );
    }
  };

  // 저장된 응답이 있으면 완료 뷰 표시
  if (savedResponseData) {
    return (
      <ScheduleResponseCompleteView
        schedule={schedule}
        responseData={savedResponseData}
      />
    );
  }

  // 날짜 배열 추출
  const dates = scheduleUnits
    ? Object.keys(scheduleUnits.schedule_units).sort()
    : [];

  // 제출 버튼 활성화 조건
  const isSubmitEnabled =
    formData.name.trim() &&
    formData.email.trim() &&
    isValidEmail(formData.email) &&
    selectedUnitNos.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">일정 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!scheduleUnits) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">
          일정 시간 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 참여 가능한 시간 선택 섹션 */}
      <div className="space-y-12 mb-32">
        <h3 className="text-head18 text-gray-900 mb-16">
          참여 가능한 시간을 모두 선택해주세요
        </h3>
        <div className="">
          <div ref={timeTableRef} className="relative">
            <ResponseTimeTable
              dates={dates}
              schedule_units={scheduleUnits.schedule_units}
              onSelect={handleTimeSelect}
              selectedUnitNos={selectedUnitNos}
              schedule_type={
                schedule.type.toLowerCase() as "individual" | "common"
              }
              is_participant_visible={schedule.is_participant_visible}
            />
            {/* scroll 끝을 감지하는 sentinel */}
            <div ref={sentinelRef} className="sentinel w-1 h-10" />
          </div>
          {isLoadingMore && (
            <div className="text-center mt-8">
              <p className="text-body14 text-gray-500">
                다음 주 일정을 불러오는 중...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 참여 정보 입력 섹션 */}
      <div className="space-y-12 mb-24">
        <h3 className="text-head18 text-gray-900">참여 정보를 입력해주세요</h3>
        <div className="space-y-10">
          <Input
            name="name"
            // label="이름"
            placeholder="이름을 입력해 주세요"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            name="email"
            type="email"
            // label="이메일"
            placeholder="이메일 주소를 입력해주세요"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input
            name="phone"
            type="tel"
            // label="연락처"
            placeholder="연락처를 입력해주세요 (선택)"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <div className="flex flex-col gap-2">
            {/* <label className="text-subtitle16 text-gray-800">코멘트</label> */}
            <textarea
              name="memo"
              placeholder="간단한 코멘트나 참고사항을 남겨주세요 (선택)"
              value={formData.memo}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-10 py-3 text-body16 bg-white border border-gray-200 rounded-[8px] transition-all duration-200 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 응답 제출 버튼 */}
      <Button
        onClick={handleSubmit}
        disabled={!isSubmitEnabled}
        className="w-full mb-32"
      >
        응답 제출하기
      </Button>
    </>
  );
}
