import type { Metadata } from "next";
import ConfirmedScheduleContent from "./ConfirmedScheduleContent";

export const metadata: Metadata = {
  description: "확정된 일정 정보를 확인하세요.",
  openGraph: {
    description: "확정된 일정 정보를 확인하세요.",
  },
  twitter: {
    description: "확정된 일정 정보를 확인하세요.",
  },
};

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
