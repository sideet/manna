"use client";

import React, { useState } from "react";
import Button from "@/components/base/Button";
import BottomSheet from "@/components/base/BottomSheet";
import Input from "@/components/base/Input";

interface JoinScheduleBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinScheduleBottomSheet({
  isOpen,
  onClose,
}: JoinScheduleBottomSheetProps) {
  const [code, setCode] = useState<string>("");
  if (!isOpen) return null;

  return (
    <BottomSheet onClose={onClose}>
      <div className="mb-80">
        <header className="text-head18 text-gray-900 text-center mb-32">
          일정 코드 입력
        </header>
        <Input
          name="code"
          placeholder="일정 코드를 입력해주세요"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-12"
        />
        <Button onClick={() => {}}>일정 조회하기</Button>
      </div>
    </BottomSheet>
  );
}
