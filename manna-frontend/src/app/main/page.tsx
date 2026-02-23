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
import { IoArrowForward } from "react-icons/io5";

export default function MainPage() {
  const { status } = useSession();
  const [isJoinScheduleBottomSheetOpen, setIsJoinScheduleBottomSheetOpen] = useState(false);

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

        {/* 서비스 만족도 조사 배너 */}
        <div className="pt-16">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-50 rounded-[8px] p-16 flex items-center justify-between text-left"
            href="https://docs.google.com/forms/d/e/1FAIpQLSdHa63bkDPVdO-3Srurs85ZIuX__lpVZ_bVucTgTBM5PvrSYQ/viewform?usp=sharing&ouid=100346664611833100631"
          >
            <div className="flex flex-col gap-2">
              <p className="text-subtitle16 text-gray-800">📝 서비스 만족도 조사 하러가기</p>
              <p className="text-body14 text-gray-600">
                더 나은 만나를 위해 여러분의 의견을 들려주세요!
              </p>
            </div>
            <IoArrowForward className="w-24 h-24 text-blue-200" />
          </a>
        </div>
        <SchedulesSection renderAll={false} />
        <JoinScheduleBottomSheet
          isOpen={isJoinScheduleBottomSheetOpen}
          onClose={() => setIsJoinScheduleBottomSheetOpen(false)}
        />
      </div>
    </>
  );
}
