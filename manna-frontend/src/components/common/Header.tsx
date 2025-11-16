"use client";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";
import UserIcon from "@/assets/icons/userIcon.svg";

interface HeaderProps {
  title?: string;
  leftSlotType?: "back" | "logo";
  rightSlotType?: "user";
  marginBottom?: string;
  onBack?: () => void;
}

export default function Header({
  title,
  leftSlotType = "back",
  rightSlotType,
  onBack,
  marginBottom = "mb-24",
}: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={`flex items-center justify-center px-16 py-10 relative h-44 ${marginBottom}`}
    >
      <div className="absolute left-4">
        {leftSlotType === "back" ? (
          <button onClick={onBack ? onBack : () => router.back()}>
            <IoIosArrowBack />
          </button>
        ) : leftSlotType === "logo" ? (
          <Image src="/logo_light.svg" alt="logo" width={40} height={40} />
        ) : null}
      </div>

      {title && <h3 className="text-gray-900 text-head18">{title}</h3>}
      <div className="absolute right-4">
        {rightSlotType === "user" ? (
          <button onClick={() => router.push("/mypage")}>
            <UserIcon width={24} height={24} fill="var(--color-gray-900)" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
