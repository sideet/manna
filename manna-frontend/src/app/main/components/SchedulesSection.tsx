"use client";
import clientApi from "@/app/api/client";
import axios from "axios";
import { useToast } from "@/providers/ToastProvider";
import { useState, useEffect } from "react";
import { ScheduleType } from "@/types/schedule";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IoChatbubbleEllipses,
  IoCalendarClear,
  IoChatboxEllipses,
} from "react-icons/io5";
import { format, parse } from "date-fns";
import Tag from "@/components/base/Tag";
import CreateRoomButton from "@/components/common/CreateRoomButton";
import Gap from "@/components/base/Gap";

export default function SchedulesSection({
  renderAll = false,
}: {
  renderAll: boolean;
}) {
  const { status } = useSession();

  return (
    <div className="w-full pb-32">
      <div className="flex items-center justify-between mt-32 mb-12">
        <h3 className="text-head18 text-gray-900">생성된 일정</h3>
        {!renderAll ? (
          <Link
            href={status === "authenticated" ? "/mypage" : "/login"}
            className="text-body14 text-gray-600"
          >
            전체보기
          </Link>
        ) : null}
      </div>
      <ScheduleSectionItem renderAll={renderAll} />
    </div>
  );
}

const ScheduleSectionItem = ({ renderAll = false }: { renderAll: boolean }) => {
  const { status } = useSession();
  const { showToast } = useToast();

  const [scheduleList, setScheduleList] = useState<
    ScheduleType[] | undefined
  >();

  const getSchedules = async () => {
    try {
      // TODO: 페이지네이션 확인 필요
      const res = await clientApi.get(`/schedules`);
      if (renderAll) {
        setScheduleList(res.data.schedules);
      } else {
        setScheduleList(res.data.schedules.slice(0, 3));
      }
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
    if (
      status === "authenticated" ||
      window.location.href.includes("redirect=true")
    ) {
      getSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex flex-col gap-12">
          {scheduleList.map((schedule) => (
            <ScheduleItem key={schedule.no} schedule={schedule} />
          ))}
        </div>
      ) : (
        <Gap gap={12} direction="col" width="full">
          <BoxUI>
            <div className="flex flex-col items-center justify-center gap-10">
              <IoChatbubbleEllipses className="w-32 h-32 text-gray-200" />
              <p className="text-body14 text-gray-500 text-center">
                아직 생성된 일정이 없어요! <br />
                새로운 일정을 만들고 만날 날을 정해보세요.
              </p>
            </div>
          </BoxUI>
          {/* 마이페이지에서만 일정이 없을 때는 생성 버튼 노출 */}
          {renderAll ? <CreateRoomButton /> : null}
        </Gap>
      )}
    </>
  );
};

const ScheduleItem = ({ schedule }: { schedule: ScheduleType }) => {
  const formatScheduleDate = (
    schedule: ScheduleType & { start_time?: string; end_time?: string }
  ) => {
    try {
      // start_date와 end_date는 "YYYY-MM-DD" 형식
      const startDate = parse(schedule.start_date, "yyyy-MM-dd", new Date());
      const endDate = parse(schedule.end_date, "yyyy-MM-dd", new Date());

      // start_time과 end_time이 있으면 포함 (종일인 경우 없음)
      if (schedule.start_time && schedule.end_time) {
        const startTime = schedule.start_time.substring(0, 5); // "12:00:00" -> "12:00"
        const endTime = schedule.end_time.substring(0, 5); // "14:30:00" -> "14:30"
        return `${format(startDate, "yyyy. MM. dd")} ${startTime} ~ ${format(
          endDate,
          "yyyy. MM. dd"
        )} ${endTime}`;
      }

      return `${format(startDate, "yyyy. MM. dd")} ~ ${format(
        endDate,
        "yyyy. MM. dd"
      )}`;
    } catch {
      // 파싱 실패 시 원본 반환
      return `${schedule.start_date} ~ ${schedule.end_date}`;
    }
  };

  return (
    <Link
      key={schedule.no}
      href={`/mypage/schedule/${schedule.code}`}
      className="block"
    >
      <div className="bg-white rounded-[8px] border border-gray-100 p-12 drop-shadow-1">
        <div className="flex flex-col gap-4 mb-8">
          {/* 헤더: 제목과 타입 태그 */}
          <div className="flex items-start justify-between gap-8">
            <h4 className="text-subtitle16 text-gray-900 font-bold flex-1 line-clamp-1 overflow-hidden text-ellipsis">
              {schedule.name}
            </h4>
            <Tag theme={schedule.type === "COMMON" ? "blue" : "purple"}>
              {schedule.type === "COMMON" ? "단체모임" : "개별미팅"}
            </Tag>
          </div>

          {/* 설명 */}
          {schedule.description && (
            <p className="text-body14 text-gray-600 line-clamp-2 overflow-hidden text-ellipsis">
              {schedule.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-10 py-8 px-12 bg-gray-50 rounded-[6px]">
          {/* 날짜/시간 정보 */}
          <div className="flex items-center gap-6">
            <IoCalendarClear className="w-16 h-16 text-gray-500 flex-shrink-0" />
            <span className="text-body13 text-gray-600">
              {formatScheduleDate(schedule)}
            </span>
          </div>

          {/* 응답자 수 */}
          <div className="flex items-center gap-6">
            <IoChatboxEllipses className="w-16 h-16 text-gray-500 flex-shrink-0" />
            <span className="text-body13 text-gray-600">
              {schedule.schedule_participants?.length || 0}명 응답
            </span>
          </div>
        </div>
      </div>
    </Link>
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
