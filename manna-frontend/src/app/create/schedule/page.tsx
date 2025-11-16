"use client";

import { useState } from "react";
import CreateSchedule from "@/components/features/schedule/CreateSchedule";
import SelectSchedule from "@/components/features/schedule/SelectSchedule";

export default function CreateSchedulePage() {
  const [scheduleType, setScheduleType] = useState<
    "COMMON" | "INDIVIDUAL" | null
  >(null);

  if (!scheduleType) {
    return <SelectSchedule setScheduleType={setScheduleType} />;
  }

  return (
    <CreateSchedule type={scheduleType} onBack={() => setScheduleType(null)} />
  );
}
