"use client";
import { useRouter } from "next/navigation";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}

export default function Header({
  title,
  showBackButton,
  showCloseButton,
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-center px-16 py-10 relative h-44">
      <div className="absolute left-4">
        {showBackButton && (
          <button onClick={() => router.back()}>
            <IoIosArrowBack />
          </button>
        )}
      </div>

      <h3 className="text-gray-900 text-head18">{title}</h3>
      <div className="absolute right-4">
        {showCloseButton && (
          <button onClick={() => router.back()} className="absolute right-4">
            <IoIosClose />
          </button>
        )}
      </div>
    </header>
  );
}
