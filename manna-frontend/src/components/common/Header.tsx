"use client";
import { useRouter } from "next/navigation";
import { IoIosClose } from "react-icons/io";
import Image from "next/image";
import UserIcon from "@/assets/icons/userIcon.svg";
import { shareSchedule } from "@/utils/shareLink";
import { IoShareSocialOutline } from "react-icons/io5";
import ArrowBackIcon from "@/assets/icons/arrowIcon.svg";

interface HeaderProps {
  title?: string;
  leftSlotType?: "back" | "logo" | null;
  rightSlotType?: "user" | "close" | "share";
  marginBottom?: string;
  scheduleCode?: string;
  onBack?: () => void;
  onClose?: () => void;
}

export default function Header({
  title,
  leftSlotType = "back",
  rightSlotType,
  scheduleCode,
  onBack,
  onClose,
  marginBottom = "mb-24",
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className={`flex items-center px-16 py-10 h-44 ${marginBottom}`}>
      {/* 왼쪽 슬롯 */}
      <div className="flex items-center justify-start min-w-0">
        {leftSlotType === "back" ? (
          <button onClick={onBack ? onBack : () => router.back()}>
            <ArrowBackIcon width={24} height={24} />
          </button>
        ) : leftSlotType === "logo" ? (
          <Image src="/logo_light.svg" alt="logo" width={40} height={40} />
        ) : null}
      </div>

      {/* 중앙 타이틀 */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {title && <h3 className="text-gray-900 text-head18">{title}</h3>}
      </div>

      {/* 오른쪽 슬롯 */}
      <div className="flex items-center justify-end min-w-0">
        {rightSlotType === "user" ? (
          <button onClick={() => router.push("/mypage")}>
            <UserIcon width={24} height={24} fill="var(--color-gray-900)" />
          </button>
        ) : rightSlotType === "close" ? (
          <button onClick={onClose ? onClose : () => router.replace("/")}>
            <IoIosClose className="w-24 h-24" />
          </button>
        ) : rightSlotType === "share" && scheduleCode ? (
          <button
            onClick={() => {
              shareSchedule(scheduleCode);
            }}
          >
            <IoShareSocialOutline className="w-24 h-24" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
