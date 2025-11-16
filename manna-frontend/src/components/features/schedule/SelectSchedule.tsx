"use client";

import Gap from "@/components/base/Gap";
import Header from "@/components/common/Header";
import Tag from "@/components/base/Tag";
import Image from "next/image";
import { IoChevronForwardOutline } from "react-icons/io5";

export default function SelectSchedule({
  setScheduleType,
}: {
  setScheduleType: (type: "COMMON" | "INDIVIDUAL") => void;
}) {
  return (
    <div>
      <Header
        title="새로운 일정 만들기"
        leftSlotType="back"
        rightSlotType="user"
      />
      <Gap gap={20} direction="col" width="full" className="pt-12">
        <header className="text-head24 text-gray-800 text-left w-full">
          어떤 일정을 <br />
          만들고 싶으신가요?
        </header>
        <Gap gap={8} direction="col" width="full">
          <TypeSelector
            type="COMMON"
            onClick={() => setScheduleType("COMMON")}
          />
          <TypeSelector
            type="INDIVIDUAL"
            onClick={() => setScheduleType("INDIVIDUAL")}
          />
        </Gap>
      </Gap>
    </div>
  );
}

const TypeSelector = ({
  type,
  onClick,
}: {
  type: "COMMON" | "INDIVIDUAL";
  onClick: () => void;
}) => {
  const contents =
    type === "COMMON"
      ? {
          tag: "단체모임",
          title: "여러 사람이 함께 만나는 일정",
          example: "프로젝트 회의, 온보딩 교육 등",
          buttonText: "단체 모임 만들기",
        }
      : {
          tag: "개별미팅",
          title: "한 사람씩 만나는 일정",
          example: "개별 인터뷰, 1:1 면접 등",
          buttonText: "개별 미팅 만들기",
        };

  return (
    <button
      type="button"
      className="
      w-full border border-gray-100 rounded-[10px] shadow-1
      flex flex-col p-14 items-start
      bg-white dark:bg-[#202023]
      text-left
      cursor-pointer
      "
      onClick={() => {
        onClick();
      }}
    >
      <Gap gap={6}>
        <Tag theme={type === "COMMON" ? "blue" : "purple"}>{contents.tag}</Tag>
        <span className="text-head18 text-gray-800">{contents.title}</span>
      </Gap>
      <p className="text-body13 text-gray-600">{contents.example}</p>
      <Image
        src={
          type === "COMMON"
            ? "/images/commontype.svg"
            : "/images/individualtype.svg"
        }
        alt="type-selector-example"
        width={329}
        height={74}
        className="m-auto my-10"
      />

      <hr className="border-gray-100 w-full mb-14" />
      <Gap gap={9} width="full">
        <p className="text-body16 text-gray-800">{contents.buttonText}</p>
        <IoChevronForwardOutline className="w-16 h-16 stroke-gray-500" />
      </Gap>
    </button>
  );
};
