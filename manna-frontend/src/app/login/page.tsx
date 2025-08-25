"use client";

import styles from "./page.module.css";
import Link from "next/link";
import Header from "../_components/Header";
import InputField from "../_components/InputField";
import BigButton from "../_components/BigButton";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // client는 react에서 server는 auth에서 import하기
import Image from "next/image";

export default function Login() {
  const router = useRouter();
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
        redirect: false, // 여길 true로 해주면 server redirect
      });
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
        form
      );

      const token = res.data.access_token;
      if (token) {
        localStorage.setItem("accessToken", token);
      }

      alert("로그인 되었습니다!");
      router.replace("/"); // 로그인 후 이동할 페이지.. try catch 안에서 안 쓰게 주의
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Axios error:", err.response);
        alert(err.response?.data?.message ?? "로그인 실패: 서버 오류입니다.");
      } else {
        console.error("Unexpected error:", err);
        alert("예상치 못한 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div>
      <Header title="로그인" showBackButton />

      <div className={styles.container}>
        <Image
          src="/manna-icon.png"
          alt="logo"
          className={styles.logo}
          width={150}
          height={150}
        />
        <InputField
          label="이메일"
          name="email"
          type="email"
          required
          placeholder="이메일을 입력해주세요"
          value={form.email}
          onChange={handleChange}
        />
        <InputField
          label="비밀번호"
          name="password"
          type="password"
          required
          placeholder="비밀번호를 입력해주세요"
          value={form.password}
          onChange={handleChange}
        />
        <BigButton onClick={handleSubmit}>로그인</BigButton>
        <span className={styles.loginText}>
          아직 회원이 아니신가요? <Link href={"/signup"}>회원가입</Link>
        </span>
      </div>
    </div>
  );
}
