"use client";

import { formatToKoreanDay, formatToMonthDate } from "@/utils/date";
import { formatTimeDisplay } from "@/utils/timeDisplay";
import {
  IoClose,
  IoCalendarClear,
  IoTimeOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useGuestConfirmInfo } from "@/hook/useConfirmInfo";
import ScheduleInfoCard from "@/components/features/schedule/components/ScheduleInfoCard";

interface ConfirmedScheduleContentProps {
  code: string;
  participantNo?: number;
}

export default function ConfirmedScheduleContent({
  code,
  participantNo,
}: ConfirmedScheduleContentProps) {
  const router = useRouter();

  // Guest용 확정 정보 조회
  const {
    data: confirmInfo,
    isLoading,
    error,
  } = useGuestConfirmInfo(code, participantNo, true);

  const handleClose = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 -mx-16">
        <div className="px-16 pb-32">
          <header className="h-56 flex items-center justify-between">
            <div className="w-24" />
            <h1 className="text-head18 text-gray-900">일정 정보</h1>
            <button
              onClick={handleClose}
              className="w-24 h-24 flex items-center justify-center"
            >
              <IoClose className="w-24 h-24 text-gray-600" />
            </button>
          </header>
          <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
            <p className="text-body16 text-gray-600">정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !confirmInfo) {
    return (
      <div className="min-h-screen bg-gray-50 -mx-16">
        <div className="px-16 pb-32">
          <header className="h-56 flex items-center justify-between">
            <div className="w-24" />
            <h1 className="text-head18 text-gray-900">일정 정보</h1>
            <button
              onClick={handleClose}
              className="w-24 h-24 flex items-center justify-center"
            >
              <IoClose className="w-24 h-24 text-gray-600" />
            </button>
          </header>
          <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
            <p className="text-body16 text-gray-600">
              일정 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!confirmInfo.is_confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 -mx-16">
        <div className="px-16 pb-32">
          <header className="h-56 flex items-center justify-between">
            <div className="w-24" />
            <h1 className="text-head18 text-gray-900">일정 정보</h1>
            <button
              onClick={handleClose}
              className="w-24 h-24 flex items-center justify-center"
            >
              <IoClose className="w-24 h-24 text-gray-600" />
            </button>
          </header>
          <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
            <p className="text-body16 text-gray-600">
              아직 확정된 일정이 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCommon = confirmInfo.schedule_type === "COMMON";
  const isIndividual = confirmInfo.schedule_type === "INDIVIDUAL";

  const scheduleInfoCardData = {
    type: confirmInfo.schedule_type,
    name: confirmInfo.schedule_name,
    description: confirmInfo.schedule_description,
    meeting_type: confirmInfo.meeting_type,
    detail_address: confirmInfo.detail_address,
    code: confirmInfo.code,
    user: {
      name: confirmInfo.creator_name,
    },
  } as const;

  // 개인 일정에서 특정 참가자 필터링 (participantNo가 있을 때)
  const filteredParticipant =
    participantNo && confirmInfo.confirmed_participants
      ? confirmInfo.confirmed_participants.find(
          (p) => p.no === participantNo && p.confirmed_unit
        )
      : null;

  return (
    <div className="min-h-screen bg-gray-50 -mx-16">
      <div className="px-16 pb-32">
        {/* 헤더 */}
        <header className="h-56 flex items-center justify-between">
          <div className="w-24" />
          <h1 className="text-head18 text-gray-900">일정 정보</h1>
          <button
            onClick={handleClose}
            className="w-24 h-24 flex items-center justify-center"
          >
            <IoClose className="w-24 h-24 text-gray-600" />
          </button>
        </header>

        <div className="space-y-16">
          {/* 일정 제목 */}
          {/* 확정 일정에서는 마감 시간 정보 노출 X */}
          <ScheduleInfoCard
            schedule={{ ...scheduleInfoCardData, expiry_datetime: null }}
          />

          {/* 그룹 확정 정보 */}
          {isCommon && confirmInfo.confirmed_unit && (
            <div className="bg-white rounded-[8px] border border-gray-200 p-16">
              <p className="text-subtitle16 text-gray-800 mb-16">
                모임 날짜가 정해졌어요!
              </p>

              {/* 날짜/시간 */}
              <div className="space-y-8 mb-16">
                <div className="flex items-center gap-8">
                  <IoCalendarClear className="w-20 h-20 text-blue-500" />
                  <p className="text-subtitle16 text-gray-900">
                    {formatToMonthDate(confirmInfo.confirmed_unit.date)} (
                    {formatToKoreanDay(confirmInfo.confirmed_unit.date)})
                  </p>
                </div>
                {confirmInfo.confirmed_unit.time && (
                  <div className="flex items-center gap-8">
                    <IoTimeOutline className="w-20 h-20 text-blue-500" />
                    <p className="text-subtitle16 text-gray-900">
                      {formatTimeDisplay(confirmInfo.confirmed_unit.time)}
                    </p>
                  </div>
                )}
                {confirmInfo.detail_address && (
                  <div className="flex items-center gap-8">
                    <IoLocationOutline className="w-20 h-20 text-blue-500" />
                    <p className="text-body14 text-gray-700">
                      {confirmInfo.detail_address}
                    </p>
                  </div>
                )}
              </div>

              {/* 참여자 목록 (is_participant_visible인 경우에만 표시) */}
              {confirmInfo.is_participant_visible && (
                <>
                  {confirmInfo.participants &&
                    confirmInfo.participants.length > 0 && (
                      <div className="mb-12">
                        <p className="text-body14 text-gray-600 mb-6">참여</p>
                        <div className="flex flex-wrap gap-6">
                          {confirmInfo.participants.map((participant) => (
                            <span
                              key={participant.no}
                              className="px-10 py-4 bg-gray-100 text-gray-800 rounded-full text-subtitle14"
                            >
                              {participant.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* 미참여자 목록 */}
                  {confirmInfo.non_participants &&
                    confirmInfo.non_participants.length > 0 && (
                      <div>
                        <p className="text-body14 text-gray-600 mb-6">
                          미참여 (선택안함)
                        </p>
                        <div className="flex flex-wrap gap-6">
                          {confirmInfo.non_participants.map((participant) => (
                            <span
                              key={participant.no}
                              className="px-10 py-4 bg-gray-100 text-gray-500 rounded-full text-subtitle14"
                            >
                              {participant.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {/* 개인 확정 정보 - 특정 참가자 */}
          {isIndividual && filteredParticipant?.confirmed_unit && (
            <div className="bg-white rounded-[8px] border border-gray-200 p-16">
              <p className="text-subtitle16 text-gray-800 mb-16">
                <span className="text-blue-500">
                  {filteredParticipant.name}
                </span>
                님의 일정이 확정되었어요!
              </p>

              {/* 날짜/시간 */}
              <div className="space-y-8">
                <div className="flex items-center gap-8">
                  <IoCalendarClear className="w-20 h-20 text-blue-500" />
                  <p className="text-subtitle16 text-gray-900">
                    {formatToMonthDate(filteredParticipant.confirmed_unit.date)}{" "}
                    (
                    {formatToKoreanDay(filteredParticipant.confirmed_unit.date)}
                    )
                  </p>
                </div>
                {filteredParticipant.confirmed_unit.time && (
                  <div className="flex items-center gap-8">
                    <IoTimeOutline className="w-20 h-20 text-blue-500" />
                    <p className="text-subtitle16 text-gray-900">
                      {formatTimeDisplay(
                        filteredParticipant.confirmed_unit.time
                      )}
                    </p>
                  </div>
                )}
                {confirmInfo.detail_address && (
                  <div className="flex items-center gap-8">
                    <IoLocationOutline className="w-20 h-20 text-blue-500" />
                    <p className="text-body14 text-gray-700">
                      {confirmInfo.detail_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 개인 확정 정보 - 전체 (participantNo 없고, 응답자 공개인 경우) */}
          {isIndividual &&
            !participantNo &&
            confirmInfo.is_participant_visible &&
            confirmInfo.confirmed_participants && (
              <div className="space-y-12">
                {confirmInfo.confirmed_participants
                  .filter((p) => p.confirmed_unit)
                  .map((participant) => (
                    <div
                      key={participant.no}
                      className="bg-white rounded-[8px] border border-gray-200 p-16"
                    >
                      <p className="text-subtitle16 text-gray-800 mb-12">
                        <span className="text-blue-500">
                          {participant.name}
                        </span>
                        님의 일정
                      </p>

                      <div className="space-y-6">
                        <div className="flex items-center gap-8">
                          <IoCalendarClear className="w-20 h-20 text-blue-500" />
                          <p className="text-body14 text-gray-700">
                            {formatToMonthDate(
                              participant.confirmed_unit!.date
                            )}{" "}
                            (
                            {formatToKoreanDay(
                              participant.confirmed_unit!.date
                            )}
                            )
                          </p>
                        </div>
                        {participant.confirmed_unit!.time && (
                          <div className="flex items-center gap-8">
                            <IoTimeOutline className="w-20 h-20 text-blue-500" />
                            <p className="text-body14 text-gray-700">
                              {formatTimeDisplay(
                                participant.confirmed_unit!.time
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

          {/* 개인 일정이지만 응답자 비공개이고 participantNo도 없는 경우 */}
          {isIndividual &&
            !participantNo &&
            !confirmInfo.is_participant_visible && (
              <div className="bg-white rounded-[8px] border border-gray-200 p-16 text-center">
                <p className="text-body14 text-gray-600">
                  응답자 정보가 비공개로 설정된 일정입니다.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
