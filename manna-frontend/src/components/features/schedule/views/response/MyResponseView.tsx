"use client";

import { useScheduleUnits } from "../../hooks/useScheduleUnits";
import ResponseTimeTable from "../../timetable/ResponseTimeTable";
import { GuestScheduleResponseType } from "@/types/schedule";
import { ScheduleResponseData } from "@/utils/scheduleResponseStorage";
import { SectionLoading, InlineLoading } from "@/components/base/Loading";

interface MyResponseViewProps {
  schedule: GuestScheduleResponseType;
  responseData: ScheduleResponseData;
}

/** 내가 응답한 일정 컴포넌트 (응답자 공개 X) */
export default function MyResponseView({
  schedule,
  responseData,
}: MyResponseViewProps) {
  const {
    scheduleUnits,
    dates,
    isLoading,
    isLoadingMore,
    timeTableRef,
    sentinelRef,
  } = useScheduleUnits({
    scheduleNo: schedule.no,
    startDate: schedule.start_date,
  });

  if (isLoading) {
    return <SectionLoading message="일정 정보를 불러오는 중..." />;
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
    <div className="space-y-12">
      <h3 className="text-head18 text-gray-900">내가 응답한 일정</h3>
      <div className="">
        <div ref={timeTableRef} className="relative">
          <ResponseTimeTable
            dates={dates}
            schedule_units={scheduleUnits}
            selectedUnitNos={responseData.selectedUnitNos}
            schedule_type={
              schedule.type.toLowerCase() as "individual" | "common"
            }
            is_participant_visible={false}
          />
          {/* scroll 끝을 감지하는 sentinel */}
          <div ref={sentinelRef} className="sentinel w-1 h-10" />
        </div>
        {isLoadingMore && (
          <div className="flex justify-center mt-8">
            <InlineLoading message="다음 주 일정을 불러오는 중..." />
          </div>
        )}
      </div>
    </div>
  );
}

