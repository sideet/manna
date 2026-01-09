import serverApi from "@/app/api/server";
import { GuestScheduleResponseType } from "@/types/schedule";
import ScheduleInfoCard from "@/components/features/schedule/ScheduleInfoCard";
import ScheduleResponseWrapper from "@/components/features/schedule/ScheduleResponseWrapper";
import ScheduleResponseForm from "@/components/features/schedule/ScheduleResponseForm";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import Header from "@/components/common/Header";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  try {
    // 서버에서 일정 정보 조회 (public API - token 불필요)
    const response = await serverApi.get<{
      schedule: GuestScheduleResponseType;
    }>(`/schedule/guest?code=${code}`, {
      headers: { skipAuth: true },
    });

    // memo. 테스트용 에러 발생
    // throw new Error("test");

    const schedule = response.data.schedule;

    return (
      <div className="min-h-screen bg-gray-50 -mx-16">
        <div className="px-16">
          <Header
            title="일정 응답하기"
            leftSlotType={null}
            rightSlotType="close"
          />
          <div className="space-y-32">
            <ScheduleResponseWrapper schedule={schedule} />
            <ScheduleInfoCard schedule={schedule} />
            <ScheduleResponseForm schedule={schedule} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("일정 정보 조회 실패:", error);

    const axiosError = error as AxiosError<{ message?: string }>;

    // 404 에러인 경우 notFound 페이지로 리다이렉트
    if (axiosError.response?.status === 404) {
      notFound();
    }

    // 기타 에러는 에러 메시지 표시
    return (
      <div className="min-h-screen bg-gray-50 -mx-16">
        <div className="px-16">
          <Header title="일정 상세 조회" leftSlotType="back" />
          <div className="py-16">
            <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
              <p className="text-body16 text-gray-600">
                {axiosError.response?.data?.message ||
                  "일정 정보를 불러올 수 없습니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
