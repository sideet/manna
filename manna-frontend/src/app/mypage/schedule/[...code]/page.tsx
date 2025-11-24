"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/common/Header";
import clientApi from "@/app/api/client";
import axios from "axios";
import { useToast } from "@/providers/ToastProvider";
import { ScheduleResponseType } from "@/types/schedule";
import { IoCopyOutline, IoAdd } from "react-icons/io5";
import Loading from "@/components/base/Loading";
import ScheduleInfoCard from "@/components/features/schedule/ScheduleInfoCard";

export default function MySchedule() {
  const params = useParams();
  const code = params?.code as string;
  const { showToast } = useToast();

  const [schedule, setSchedule] = useState<ScheduleResponseType | undefined>();
  const [activeTab, setActiveTab] = useState<"status" | "responses">("status");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        // code로 일정 조회 - 게스트 엔드포인트 사용
        const res = await clientApi.get(`/schedule/guest?code=${code}`);
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

    if (code) {
      fetchSchedule();
    }
  }, [code, showToast]);

  const handleCopyLink = async () => {
    if (!schedule) return;
    try {
      const linkToCopy = `https://manna.it.kr/schedule/${schedule.code}`;
      await navigator.clipboard.writeText(linkToCopy);
      showToast("링크를 복사했습니다.");
    } catch (err) {
      console.error("복사 실패: ", err);
      showToast("링크 복사에 실패했습니다.", "error");
    }
  };

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
          rightSlotType="user"
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
        {activeTab === "status" && (
          <BlankResponseBox handleCopyLink={handleCopyLink} />
        )}

        {/* 응답 정보 탭 */}
        {activeTab === "responses" && (
          <BlankResponseBox handleCopyLink={handleCopyLink} />
        )}

        {/* 내 일정 등록하기 버튼 (COMMON 타입일 때만) */}
        {schedule.type === "COMMON" && (
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
        )}
      </div>
    </div>
  );
}

const BlankResponseBox = ({
  handleCopyLink,
}: {
  handleCopyLink: () => void;
}) => {
  return (
    <div className="w-full bg-white rounded-[8px] border border-gray-200 p-16">
      <p className="text-subtitle16 text-gray-800 font-bold mb-4 text-center">
        아직 응답한 사람이 없어요
      </p>
      <p className="text-body14 text-gray-600 mb-16 text-center">
        링크를 공유해 새로운 일정을 만들어봐요!
      </p>
      <button
        onClick={handleCopyLink}
        className="w-full h-44 bg-gray-50 border border-gray-200 rounded-[8px] flex items-center justify-center gap-6 text-body14 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        링크 복사하기
        <IoCopyOutline className="w-16 h-16" />
      </button>
    </div>
  );
};
