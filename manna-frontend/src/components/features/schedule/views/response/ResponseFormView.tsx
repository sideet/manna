"use client";

import { useState } from "react";
import { isValid, parse } from "date-fns";
import { useScheduleUnits } from "../../hooks/useScheduleUnits";
import { useScheduleResponse } from "../../hooks/useScheduleResponse";
import { useToast } from "@/providers/ToastProvider";
import ResponseTimeTable from "../../timetable/ResponseTimeTable";
import Input from "@/components/base/Input";
import Button from "@/components/base/Button";
import { GuestScheduleResponseType } from "@/types/schedule";
import { SectionLoading, InlineLoading } from "@/components/base/Loading";

interface ResponseFormViewProps {
  schedule: GuestScheduleResponseType;
  onComplete: () => void;
}

/** 일정 응답 작성 폼 뷰 */
export default function ResponseFormView({ schedule, onComplete }: ResponseFormViewProps) {
  const { showToast } = useToast();
  const [selectedUnitNos, setSelectedUnitNos] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    memo: "",
  });

  const { submitResponse } = useScheduleResponse(schedule.code);

  const { scheduleUnits, dates, isLoading, isLoadingMore, timeTableRef, sentinelRef } =
    useScheduleUnits({
      scheduleNo: schedule.no,
      startDate: schedule.start_date,
      endDate: schedule.end_date,
      onError: (error) => {
        showToast(error.response?.data?.message || "일정 시간 정보를 불러올 수 없습니다.", "error");
      },
    });

  // 시간 선택 핸들러
  const handleTimeSelect = (unitNo: number) => {
    if (schedule.is_duplicate_participation) {
      // 중복 허용: 토글 방식
      setSelectedUnitNos((prev) =>
        prev.includes(unitNo) ? prev.filter((no) => no !== unitNo) : [...prev, unitNo],
      );
    } else {
      // 중복 비허용: 단일 선택
      setSelectedUnitNos([unitNo]);
    }
  };

  // 폼 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      await submitResponse({
        scheduleNo: schedule.no,
        scheduleCode: schedule.code,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        memo: formData.memo || undefined,
        selectedUnitNos,
      });

      onComplete();
    } catch {
      // 에러는 훅에서 처리됨
    }
  };

  // 제출 버튼 활성화 조건
  const expiryDate = schedule.expiry_datetime
    ? parse(schedule.expiry_datetime, "yyyy-MM-dd HH:mm:ss", new Date())
    : null;
  const isBeforeExpiry =
    !schedule.expiry_datetime ||
    (expiryDate !== null && isValid(expiryDate) && Date.now() <= expiryDate.getTime());

  const isSubmitEnabled =
    isBeforeExpiry &&
    formData.name.trim() &&
    formData.email.trim() &&
    isValidEmail(formData.email) &&
    selectedUnitNos.length > 0;

  if (isLoading) {
    return <SectionLoading message="일정 정보를 불러오는 중..." />;
  }

  if (!scheduleUnits) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">일정 시간 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* 참여 가능한 시간 선택 섹션 */}
      <div className="space-y-12 mb-32">
        <h3 className="text-head18 text-gray-900 mb-16">참여 가능한 시간을 모두 선택해주세요</h3>
        <div className="">
          <div ref={timeTableRef} className="relative">
            <ResponseTimeTable
              dates={dates}
              schedule_units={scheduleUnits}
              onSelect={handleTimeSelect}
              selectedUnitNos={selectedUnitNos}
              schedule_type={schedule.type.toLowerCase() as "individual" | "common"}
              is_participant_visible={schedule.is_participant_visible}
            />
            {isLoadingMore && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[8px] bg-white/60">
                <InlineLoading message="다음 주 일정을 불러오는 중..." />
              </div>
            )}
            {/* scroll 끝을 감지하는 sentinel */}
            <div ref={sentinelRef} className="sentinel w-1 h-10" />
          </div>
        </div>
      </div>

      {/* 참여 정보 입력 섹션 */}
      <div className="space-y-12 mb-24">
        <h3 className="text-head18 text-gray-900">참여 정보를 입력해주세요</h3>
        <div className="space-y-10">
          <Input
            name="name"
            placeholder="이름을 입력해 주세요"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="이메일 주소를 입력해주세요"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input
            name="phone"
            type="tel"
            placeholder="연락처를 입력해주세요 (선택)"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <div className="flex flex-col gap-2">
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
      <Button onClick={handleSubmit} disabled={!isSubmitEnabled} className="w-full mb-32">
        응답 제출하기
      </Button>
    </>
  );
}
