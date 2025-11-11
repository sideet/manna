"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useToast } from "@/providers/ToastProvider";
import Header from "@/components/common/Header";
import Input from "@/components/base/Input";
import Button from "@/components/base/Button";
import Link from "next/link";
import Gap from "@/components/base/Gap";

export default function EmailLoginPage() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!form.email.trim()) newErrors.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "올바른 형식이 아닙니다.";
    if (form.password.length < 8)
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";

    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === "");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement & { name: string }>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        showToast("로그인 정보가 올바르지 않습니다.", "error");
      } else {
        showToast("로그인이 완료되었습니다.", "success");
        window.location.href = "/main";
      }
    } catch {
      showToast("로그인 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = form.email && form.password.length >= 8;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="로그인" leftSlotType="back" />
      <h1 className="text-left text-head24 font-bold mb-20">
        로그인 정보를 입력해주세요.
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* 이메일 */}
        <Input
          name="email"
          placeholder="이메일 주소를 입력해주세요"
          value={form.email}
          onChange={handleChange}
          errorMessage={errors.email}
        />

        {/* 비밀번호 */}
        <Input
          name="password"
          type="password"
          placeholder="비밀번호를 입력해주세요 (8자 이상)"
          value={form.password}
          onChange={handleChange}
          errorMessage={errors.password}
        />

        {/* 버튼 */}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-50"
        >
          {isSubmitting ? "처리 중..." : "로그인"}
        </Button>
      </form>
      <Gap gap={6} className="mt-50">
        <p className="text-center text-body14 text-gray-600">
          아직 회원이 아니신가요?
        </p>
        <p className="text-center text-body14 text-blue-500 font-semibold underline">
          <Link href="/signup">회원가입</Link>
        </p>
      </Gap>
    </div>
  );
}
