"use client";

import { useSession, signOut } from "next-auth/react";
import Button from "@/components/base/Button";

export default function UserInfo() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "unauthenticated") {
    return <div>로그인이 필요합니다.</div>;
  }

  if (!session?.user) {
    return <div>사용자 정보를 불러올 수 없습니다.</div>;
  }

  const { user } = session;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">사용자 정보</h3>

      <div className="space-y-2 mb-4">
        <p>
          <strong>번호:</strong> {user.no}
        </p>
        <p>
          <strong>이름:</strong> {user.name}
        </p>
        <p>
          <strong>이메일:</strong> {user.email}
        </p>
        <p>
          <strong>닉네임:</strong> {user.nickname || "설정되지 않음"}
        </p>
        <p>
          <strong>전화번호:</strong> {user.phone || "설정되지 않음"}
        </p>
        <p>
          <strong>활성화:</strong> {user.enabled ? "활성" : "비활성"}
        </p>
      </div>

      <Button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600">
        로그아웃
      </Button>
    </div>
  );
}
