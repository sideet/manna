import ConfirmedScheduleContent from "./ConfirmedScheduleContent";

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

  return (
    <ConfirmedScheduleContent
      code={code}
      participantNo={participantNo}
    />
  );
}
