"use client";

import Header from "@/components/common/Header";
import TopSection from "./components/TopSection";
import Gap from "@/components/base/Gap";
import CreateRoomButton from "@/components/common/CreateRoomButton";
import Loading from "@/components/base/Loading";
import { useSession } from "next-auth/react";
import SchedulesSection from "./components/SchedulesSection";
import { useState } from "react";
import JoinScheduleBottomSheet from "@/components/features/schedule/JoinScheduleBottomSheet";

export default function MainPage() {
  const { status } = useSession();
  const [isJoinScheduleBottomSheetOpen, setIsJoinScheduleBottomSheetOpen] =
    useState(false);

  return (
    <>
      {status === "loading" ? <Loading /> : null}
      <div>
        <Header leftSlotType="logo" rightSlotType="user" />
        <Gap direction="col" gap={32} className="mt-12 mb-28">
          <TopSection />
          <section className="flex flex-col gap-12 w-full">
            <CreateRoomButton />
            <button
              className="w-full h-56 bg-transparent border border-gray-200 text-gray-800 rounded-full text-body16
    flex items-center justify-center cursor-pointer
      "
              onClick={() => setIsJoinScheduleBottomSheetOpen(true)}
            >
              전달받은 코드로 참여하기
            </button>
          </section>
        </Gap>
        <hr className="border-gray-100 border-t-8 -mx-16" />
        <SchedulesSection renderAll={false} />
        <JoinScheduleBottomSheet
          isOpen={isJoinScheduleBottomSheetOpen}
          onClose={() => setIsJoinScheduleBottomSheetOpen(false)}
        />
      </div>
    </>
  );
}
