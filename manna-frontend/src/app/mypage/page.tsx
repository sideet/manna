"use client";
import Header from "@/components/common/Header";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { useToast } from "../../providers/ToastProvider";
import clientApi from "../api/client";
import SchedulesSection from "../main/components/SchedulesSection";
import Gap from "@/components/base/Gap";
import Divider from "@/components/base/Divider";
import Loading from "@/components/base/Loading";

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showToast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      showToast("로그인 후 이용해 주세요.", "warning");
      router.push("/login");
    }
  }, [status, router, showToast]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  /** 로그아웃 */
  const logout = () => {
    signOut({ redirect: false }).then(() => {
      showToast("로그아웃 되었습니다.", "success");
      router.replace("/");
    });
  };

  /** 공유 링크 복사 */
  // const handleCopy = async (code: string) => {
  //   try {
  //     const linkToCopy = `${window.location.origin}/join/room/${code}`;
  //     await navigator.clipboard.writeText(linkToCopy);
  //     showToast("링크를 복사했습니다. 참석자에게 공유해 주세요!", "success");
  //   } catch (err: unknown) {
  //     console.error("복사 실패: ", err);
  //   }
  // };

  /** 회원 탈퇴하기 */
  const withdrawal = async () => {
    try {
      const confirmWithdrawal = confirm(
        "탈퇴하시겠습니까? 생성한 일정 및 정보가 영구 삭제됩니다."
      );
      if (!confirmWithdrawal) return;

      await clientApi.delete(`/user`);
      signOut({ redirect: false }).then(() => {
        router.replace("/");
      });
      showToast("회원 탈퇴가 완료되었습니다.", "success");
    } catch (error: unknown) {
      console.error("탈퇴 실패:", error);
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data.message ?? "회원 탈퇴에 실패했습니다.",
          "error"
        );
      } else {
        showToast("회원 탈퇴에 실패했습니다.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="마이 페이지" leftSlotType="back" />

      <section className="flex flex-col mb-32">
        <div className="flex items-center justify-between">
          <h3 className="text-head24 text-gray-800">
            <span className="text-blue-500">{session?.user.name}</span>님,
            어서오세요!
          </h3>
          <button
            className="text-body13 text-gray-600 bg-gray-100 text-[#a2a2a2] h-26 px-6 rounded-[4px]"
            onClick={logout}
          >
            로그아웃
          </button>
        </div>
        <p className="text-body16 text-gray-600">{session?.user.email}</p>
      </section>

      <Divider />

      <div className="flex-1 flex flex-col">
        <Gap gap={12} direction="col" width="full" className="pb-24">
          <SchedulesSection renderAll={true} />
        </Gap>

        {/* 회원 탈퇴하기 버튼 - 페이지 하단에 고정 */}
        <div className="mt-auto pt-24 pb-24 text-center">
          <button
            className="text-body14 underline text-gray-400 cursor-pointer"
            onClick={withdrawal}
          >
            회원 탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}
