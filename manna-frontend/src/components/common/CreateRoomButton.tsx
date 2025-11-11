"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { IoAdd } from "react-icons/io5";
import { useToast } from "@/providers/ToastProvider";

// 라이트모드 / 다크모드 동일
export default function CreateRoomButton() {
  const router = useRouter();
  const { status } = useSession();
  const { showToast } = useToast();

  const handleCreateRoom = () => {
    if (status === "authenticated") {
      router.push("/create/room");
    } else {
      showToast("로그인 후 이용해 주세요.", "warning");
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleCreateRoom}
      className="w-full h-56 bg-gradient-1 rounded-full text-subtitle16 text-[#fff]
    flex items-center justify-center gap-10 cursor-pointer
      "
    >
      새로운 일정 만들기
      <div className="bg-[#0041A9] rounded-full w-20 h-20 flex items-center justify-center">
        <IoAdd className="w-16 h-16" color="#CCE1FF" />
      </div>
    </button>
  );
}
