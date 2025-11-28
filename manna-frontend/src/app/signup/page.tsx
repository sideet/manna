"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import clientApi from "@/app/api/client";
import { useToast } from "@/providers/ToastProvider";
import Header from "@/components/common/Header";
import Input from "@/components/base/Input";
import Button from "@/components/base/Button";
import CheckBox from "@/components/base/CheckBox";
import Link from "next/link";
import Gap from "@/components/base/Gap";
import axios from "axios";

export default function SignupPage() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!form.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!form.email.trim()) newErrors.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "올바른 형식이 아닙니다.";
    if (form.password.length < 8)
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";

    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === "");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement & { name: string }>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!form.agree) {
      showToast("이용약관에 동의해주세요.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await clientApi.post("/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        // TODO: 백엔드 수정 후 제거
        phone: "01812341234",
      });
      showToast("회원가입이 완료되었습니다.", "success");
      window.location.href = "/login/email";
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast(
          err.response?.data.message ?? "회원가입 중 오류가 발생했습니다.",
          "error"
        );
      } else {
        showToast("회원가입 중 오류가 발생했습니다.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    form.name &&
    form.email &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.agree;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="회원가입" leftSlotType="back" />

      <h1 className="text-left text-head24 font-bold mb-20">
        아래 내용을 입력해주세요.
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* 이름 */}
        <Input
          name="name"
          placeholder="이름을 입력해주세요"
          value={form.name}
          onChange={handleChange}
          errorMessage={errors.name}
        />

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

        {/* 비밀번호 확인 */}
        <Input
          name="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력해주세요"
          value={form.confirmPassword}
          onChange={handleChange}
          errorMessage={errors.confirmPassword}
          showPasswordToggle
        />

        {/* 약관 */}
        <label className="flex items-center gap-2 text-body14 mt-18">
          <CheckBox name="agree" checked={form.agree} onChange={handleChange} />
          이용약관 및 개인정보 처리방침에 동의합니다
        </label>

        {/* 버튼 */}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-50"
        >
          {isSubmitting ? "처리 중..." : "회원가입 완료"}
        </Button>
      </form>

      <Gap gap={6} className="mt-50">
        <p className="text-center text-body14 text-gray-600">
          이미 회원이신가요?
        </p>
        <p className="text-center text-body14 text-blue-500 font-semibold underline">
          <Link href="/login">로그인</Link>
        </p>
      </Gap>
    </div>
  );
}
