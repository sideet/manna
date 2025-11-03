"use client";
import clientApi from "@/app/api/client";
import axios from "axios";
import { useToast } from "@/providers/ToastProvider";
import { useState, useEffect } from "react";
import { ScheduleType } from "@/types/schedule";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { IoChatbubbleEllipses } from "react-icons/io5";

export default function SchedulesSection() {
  const { status } = useSession();

  return (
    <div>
      <div className="flex items-center justify-between mt-32 mb-12">
        <h3 className="text-head18 text-gray-900">생성된 일정</h3>
        <Link
          href={status === "authenticated" ? "/mypage" : "/login"}
          className="text-body14 text-gray-600"
        >
          전체보기
        </Link>
      </div>
      <ScheduleSectionItem />
    </div>
  );
}

const ScheduleSectionItem = () => {
  const { status } = useSession();
  const { showToast } = useToast();

  const [scheduleList, setScheduleList] = useState<
    ScheduleType[] | undefined
  >();

  const getSchedules = async () => {
    try {
      const res = await clientApi.get(`/schedules`);
      setScheduleList(res.data.schedules);
    } catch (error: unknown) {
      console.error("응답 조회 실패", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "일정 정보를 불러올 수 없습니다.",
          "error"
        );
      } else {
        showToast("일정 정보를 불러올 수 없습니다.", "error");
      }
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      getSchedules();
    }
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <BoxUI>
        <div className="flex flex-col items-center justify-center">
          <p className="text-body14 text-gray-500">
            로그인 후 이용할 수 있어요!
          </p>
          <Link
            href="/login"
            className="text-subtitle14 text-blue-500 underline"
          >
            로그인 하러 가기
          </Link>
        </div>
      </BoxUI>
    );
  }

  return (
    <>
      {scheduleList && scheduleList.length > 0 ? (
        scheduleList.map((schedule) => (
          <div key={schedule.no}>{schedule.name}</div>
        ))
      ) : (
        <BoxUI>
          <div className="flex flex-col items-center justify-center gap-10">
            <IoChatbubbleEllipses className="w-32 h-32 text-gray-200" />
            <p className="text-body14 text-gray-500 text-center">
              아직 생성된 일정이 없어요! <br />
              새로운 일정을 만들고 만날 날을 정해보세요.
            </p>
          </div>
        </BoxUI>
      )}
    </>
  );
};

const BoxUI = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="w-full h-full bg-gray-50 rounded-[8px] border border-gray-200
    flex flex-col items-center justify-center py-32
    "
    >
      {children}
    </div>
  );
};
