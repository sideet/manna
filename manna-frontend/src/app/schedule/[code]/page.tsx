import serverApi from "@/app/api/server";
import { GuestScheduleResponseType } from "@/types/schedule";
import ScheduleResponseContainer from "@/components/features/schedule/containers/ScheduleResponseContainer";
import { notFound } from "next/navigation";
import { AxiosError } from "axios";
import Header from "@/components/common/Header";
import { Metadata } from "next";

// 일정 정보를 가져오는 공통 함수
async function getSchedule(code: string) {
  const response = await serverApi.get<{
    schedule: GuestScheduleResponseType;
  }>(`/schedule/guest?code=${code}`, {
    headers: { skipAuth: true },
  });
  return response.data.schedule;
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  try {
    const schedule = await getSchedule(code);

    const title = `${schedule.name} | Manna`;
    const description =
      schedule.description || `${schedule.user.name}님이 만든 일정에 참여해보세요.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: "Manna",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "일정 응답하기 | Manna",
      description: "Manna에서 일정에 참여해보세요.",
    };
  }
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  try {
    const schedule = await getSchedule(code);

    return (
      <div className="min-h-screen bg-gray-50 -mx-16">
        <div className="px-16 pb-32">
          <Header
            title="일정 응답하기"
            leftSlotType={null}
            rightSlotType="close"
          />
          <ScheduleResponseContainer schedule={schedule} />
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
