"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/providers/ToastProvider";
import CreateSchedule from "@/components/features/schedule/CreateSchedule";
import SelectSchedule from "@/components/features/schedule/SelectSchedule";

export default function CreateSchedulePage() {
  const router = useRouter();
  const { status } = useSession();
  const { showToast } = useToast();
  const [scheduleType, setScheduleType] = useState<
    "COMMON" | "INDIVIDUAL" | null
  >(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      showToast("로그인 후 이용해 주세요.", "warning");
      router.push("/login");
    }
  }, [status, router, showToast]);

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!scheduleType) {
    return <SelectSchedule setScheduleType={setScheduleType} />;
  }

  return (
    <CreateSchedule type={scheduleType} onBack={() => setScheduleType(null)} />
  );
}
