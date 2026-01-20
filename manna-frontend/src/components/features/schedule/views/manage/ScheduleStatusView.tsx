"use client";

import { useToast } from "@/providers/ToastProvider";
import ManageTimeTable from "../../timetable/ManageTimeTable";
import SelectedTimeTableInfo from "./SelectedTimeTableInfo";
import { DetailScheduleUnitType, ScheduleResponseType } from "@/types/schedule";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import BlankResponseBox from "@/components/common/BlankResponseBox";
import { useScheduleParticipants } from "@/hook/useScheduleParticipants";
import { useScheduleUnits } from "@/hook/useScheduleUnits";

/** 관리자 일정 조회 > 일정 현황 컴포넌트 */
export default function ScheduleStatusView({
  schedule,
}: {
  schedule: ScheduleResponseType;
}) {
  const { showToast } = useToast();
  const timeTableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<DetailScheduleUnitType | null>(null);

  // 응답자 존재 여부 - tanstack query로 캐싱된 데이터 사용
  const { data: participantsData } = useScheduleParticipants(schedule.no);
  const isResponseExists =
    (participantsData?.schedule_participants?.length ?? 0) > 0;

  const {
    data: scheduleUnitsData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useScheduleUnits(schedule.no, schedule.start_date);

  console.log("ScheduleStatusView", scheduleUnitsData);
  
  // 에러 처리
  useEffect(() => {
    if (error) {
      console.error("스케줄 단위 조회 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "일정 시간 정보를 불러올 수 없습니다.",
        "error"
      );
    }
  }, [error, showToast]);

  // 모든 페이지의 데이터를 병합하여 하나의 객체로 만들기
  const scheduleUnits = scheduleUnitsData?.pages.reduce(
    (acc, page) => {
      Object.keys(page.schedule_units).forEach((date) => {
        if (!acc.schedule_units[date]) {
          acc.schedule_units[date] = [];
        }
        // 중복 제거 (no 기준)
        const existingNos = new Set(acc.schedule_units[date].map((u) => u.no));
        const newUnits = page.schedule_units[date].filter(
          (u) => !existingNos.has(u.no)
        );
        acc.schedule_units[date] = [
          ...acc.schedule_units[date],
          ...newUnits,
        ];
      });
      return acc;
    },
    { schedule_units: {} as { [date: string]: DetailScheduleUnitType[] } }
  );

  // 날짜 배열 추출
  const dates = useMemo(
    () =>
      scheduleUnits
        ? Object.keys(scheduleUnits.schedule_units).sort()
        : [],
    [scheduleUnits]
  );

  // 모든 참여자 목록 추출 (SelectedTimeTableInfo에 전달하기 위해)
  const allParticipants = useMemo(() => {
    const participants = new Set<string>();
    if (scheduleUnits) {
      Object.values(scheduleUnits.schedule_units).forEach((units) => {
        units.forEach((unit) => {
          unit.schedule_participants.forEach((p) => {
            participants.add(p.name);
          });
        });
      });
    }
    return participants;
  }, [scheduleUnits]);

  // 시간 선택 핸들러
  const handleTimeSelect = useCallback(
    (unitNo: number) => {
      if (!scheduleUnits) return;

      // 모든 날짜의 units를 순회하며 해당 unitNo를 찾기
      for (const date of Object.keys(scheduleUnits.schedule_units)) {
        const unit = scheduleUnits.schedule_units[date].find((u) => u.no === unitNo);
        if (unit) {
          setSelectedUnit(unit);
          break;
        }
      }
    },
    [scheduleUnits]
  );

  // 초기 선택 (첫날 첫시간 기본값)
  useEffect(() => {
    if (dates && scheduleUnits && dates.length > 0 && !selectedUnit) {
      const firstDate = dates[0];
      const firstUnit = scheduleUnits.schedule_units[firstDate]?.[0];
      if (firstUnit) {
        setSelectedUnit(firstUnit);
      }
    }
  }, [dates, scheduleUnits, selectedUnit]);

  // 가로 무한스크롤
  useEffect(() => {
    if (!timeTableRef.current || !sentinelRef.current) {
      return;
    }

    // 실제 스크롤 컨테이너 찾기 (ManageTimeTable 내부의 overflow-x-auto div)
    const scrollContainer = timeTableRef.current.querySelector(
      ".overflow-x-auto"
    ) as HTMLElement;

    if (!scrollContainer) {
      return;
    }


    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scrollLeft = scrollContainer.scrollLeft;
          const scrollWidth = scrollContainer.scrollWidth;
          const clientWidth = scrollContainer.clientWidth;
          const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 100; // 100px 여유

          // 스크롤이 끝에 가까울 때만 다음 페이지 로드
          if (
            entry.isIntersecting &&
            isNearEnd &&
            hasNextPage &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }
        });
      },
      {
        root: scrollContainer, // 실제 스크롤 컨테이너
        threshold: 0.1, // memo. threshold를 낮춰서 더 정확하게 감지 
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isResponseExists) {
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
        <p className="text-body16 text-gray-600">일정 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="">
      <div ref={timeTableRef} className="relative">
        <ManageTimeTable
          dates={dates}
          schedule_units={scheduleUnits?.schedule_units}
          schedule_type={schedule.type.toLowerCase() as "individual" | "common"}
          is_participant_visible={schedule.is_participant_visible}
          onSelect={handleTimeSelect}
          sentinelRef={sentinelRef}
        />
      </div>

      {/* 선택된 시간의 상세 정보 */}
      {selectedUnit && (
        <SelectedTimeTableInfo
          unit={selectedUnit}
          schedule_type={schedule.type.toLowerCase() as "individual" | "common"}
          time_unit={schedule.time_unit}
          time={schedule.time}
          allParticipants={allParticipants}
        />
      )}
    </div>
  );
}

