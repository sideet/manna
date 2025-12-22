"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/common/Header";
import clientApi from "@/app/api/client";
import axios from "axios";
import { useToast } from "@/providers/ToastProvider";
import { ScheduleResponseType } from "@/types/schedule";
import Loading from "@/components/base/Loading";
import ScheduleInfoCard from "@/components/features/schedule/ScheduleInfoCard";
import ScheduleStatusView from "@/components/features/schedule/ScheduleStatusView";
import ScheduleResponseView from "@/components/features/schedule/ScheduleResponseView";

export default function MySchedule() {
  const params = useParams();
  const no = params?.no as string;
  const { showToast } = useToast();

  const [schedule, setSchedule] = useState<ScheduleResponseType | undefined>();
  const [activeTab, setActiveTab] = useState<"status" | "responses">("status");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      // code로 일정 조회 - 일반 엔드포인트 사용
      const res = await clientApi.get(`/schedule?schedule_no=${no}`);
      setSchedule(res.data.schedule);
    } catch (error: unknown) {
      console.error("일정 정보 요청 실패", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "일정 정보를 불러올 수 없습니다.",
          "error"
        );
      } else {
        showToast("일정 정보를 불러올 수 없습니다.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (no) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [no]);

  if (isLoading || !schedule) {
    return (
      <div>
        <Header
          title="일정 상세 조회"
          leftSlotType="back"
          rightSlotType="user"
        />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-gray-50 -mx-16">
      <div className="px-16">
        <Header
          title="일정 상세 조회"
          leftSlotType="back"
          rightSlotType="share"
          scheduleCode={schedule.code}
          marginBottom="mb-4"
        />

        {/* 일정 정보 카드 */}
        <ScheduleInfoCard schedule={schedule} />

        {/* 탭 네비게이션 */}
        <div className="w-197 h-42 mx-auto my-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <button
            onClick={() => setActiveTab("status")}
            className={`w-96 h-36 text-subtitle14 ${
              activeTab === "status"
                ? "bg-blue-500 text-white rounded-full"
                : "text-gray-600"
            }`}
          >
            일정 현황
          </button>
          <button
            className={`w-96 h-36 text-subtitle14 ${
              activeTab === "responses"
                ? "bg-blue-500 text-white rounded-full"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("responses")}
          >
            응답 정보
          </button>
        </div>

        {/* 응답 상태 섹션 */}
        {activeTab === "status" && <ScheduleStatusView schedule={schedule} />}

        {/* 응답 정보 탭 */}
        {activeTab === "responses" && (
          <ScheduleResponseView schedule={schedule} />
        )}

        {/* 내 일정 등록하기 버튼 (COMMON 타입일 때만) TODO: 기능 추가 구현 필요 */}
        {/* {schedule.type === "COMMON" && (
          <button
            onClick={() => {}}
            className="w-full h-56 bg-gradient-1 rounded-full text-subtitle16 text-[#fff]
              flex items-center justify-center gap-10 cursor-pointer mt-24
              "
          >
            내 일정 등록하기
            <div className="bg-[#0041A9] rounded-full w-20 h-20 flex items-center justify-center">
              <IoAdd className="w-16 h-16" color="#CCE1FF" />
            </div>
          </button>
        )} */}
      </div>
    </div>
  );
}
