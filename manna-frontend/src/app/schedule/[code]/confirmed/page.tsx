import type { Metadata } from "next";
import ConfirmedScheduleContent from "./ConfirmedScheduleContent";
import serverApi from "@/app/api/server";
import { GuestConfirmInfoType } from "@/types/schedule";

// 확정 일정 정보를 가져오는 함수
async function getGuestConfirmInfo(code: string, participantNo?: number) {
  const params = new URLSearchParams({ code });
  if (participantNo) {
    params.append("participant_no", String(participantNo));
  }
  const response = await serverApi.get<GuestConfirmInfoType>(
    `/schedule/confirm/guest?${params.toString()}`,
    { headers: { skipAuth: true } }
  );
  return response.data;
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ participant?: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const { participant } = await searchParams;
  const participantNo = participant ? parseInt(participant, 10) : undefined;

  try {
    const confirmInfo = await getGuestConfirmInfo(code, participantNo);

    const title = `${confirmInfo.schedule_name} - 확정된 일정 | Manna`;
    const description =
      confirmInfo.schedule_description ||
      `${confirmInfo.creator_name}님이 확정한 일정을 확인하세요.`;

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
      title: "확정된 일정 | Manna",
      description: "확정된 일정 정보를 확인하세요.",
    };
  }
}

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ participant?: string }>;
}

export default async function ConfirmedSchedulePage({
  params,
  searchParams,
}: PageProps) {
  const { code } = await params;
  const { participant } = await searchParams;
  const participantNo = participant ? parseInt(participant, 10) : undefined;

  return <ConfirmedScheduleContent code={code} participantNo={participantNo} />;
}
