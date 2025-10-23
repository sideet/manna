"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/home/Header";
import { useToast } from "../_components/ToastProvider";
import clientApi from "../api/client";
import Gap from "@/components/base/Gap";

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      const res = await clientApi.post(`/login`, form, {
        headers: { skipAuth: true },
      });

      const token = res.data.access_token;
      if (token) localStorage.setItem("accessToken", token);

      showToast("로그인 되었습니다!", "success");
      router.replace("/home");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Axios error:", err.response);
        showToast(
          err.response?.data?.message ?? "로그인 실패: 서버 오류입니다.",
          "error"
        );
      } else {
        console.error("Unexpected error:", err);
        showToast("예상치 못한 오류가 발생했습니다.", "error");
      }
    }
  };

  const handleKakaoLogin = () => {
    // 백엔드 OAuth 엔드포인트로 직접 리디렉션
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/login/kakao`;
  };

  const handleGoogleLogin = () => {
    // 백엔드 OAuth 엔드포인트로 직접 리디렉션
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/login/google`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="로그인" showBackButton />

      <Gap direction="col" gap={76} className="mx-16">
        <Gap direction="col" gap={40} width="full" className="mt-72">
          <Gap direction="col" gap={20}>
            <Image src="/logo_light.svg" alt="logo" width={100} height={100} />
            <p className="text-center text-head24 text-gray-900">
              복잡한 일정 조율, <br /> 만나에서 심플하게!
            </p>
          </Gap>

          <Gap direction="col" gap={20} width="full">
            <button
              onClick={handleKakaoLogin}
              className="relative w-full h-56 flex items-center justify-center bg-[#FEE500] hover:bg-[#FDD835] text-body16 text-gray-900 rounded-full transition"
            >
              <Image
                src="/icons/kakao.svg"
                alt="kakao"
                width={16}
                height={16}
                className="absolute left-20"
              />
              카카오로 시작하기
            </button>

            <button
              onClick={handleGoogleLogin}
              className="relative w-full h-56 flex items-center justify-center gap-2 border border-gray-300 text-body16 text-gray-900 rounded-full hover:bg-gray-50 transition"
            >
              <Image
                src="/icons/google.svg"
                alt="google"
                width={16}
                height={16}
                className="absolute left-20"
              />
              Google로 시작하기
            </button>
          </Gap>
        </Gap>

        <div className="flex items-center justify-center gap-30 text-body14 text-gray-800">
          <Link href="/login/email" className="hover:underline">
            이메일 로그인
          </Link>
          <span className="w-px h-12 bg-gray-300" />
          <Link href="/signup" className="hover:underline">
            이메일 회원가입
          </Link>
        </div>
      </Gap>
    </div>
  );
}
