"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import BigButton from "../_components/BigButton";
import Header from "../_components/Header";
import InputField from "../_components/InputField";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    passwordCheck: "",
  });

  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!agreed) {
      alert("약관에 동의해주세요.");
      return;
    }

    if (formData.password !== formData.passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { name, phone, email, password } = formData;

      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/signup`, {
        name,
        phone,
        email,
        password,
        // nickname은 선택사항
      });

      alert("회원가입이 완료되었습니다.");
      router.push("/login");
    } catch (err) {
      alert("회원가입 실패: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <Header title="회원가입" showBackButton />
      <div className={styles.container}>
        <img src="/manna-icon.png" alt="logo" className={styles.logo} />

        <InputField
          label="이름"
          name="name"
          type="text"
          required
          placeholder="이름을 입력해주세요"
          value={formData.name}
          onChange={handleChange}
        />
        <InputField
          label="연락처"
          name="phone"
          type="tel"
          required
          placeholder="핸드폰 번호를 입력해주세요"
          value={formData.phone}
          onChange={handleChange}
        />
        <InputField
          label="이메일"
          name="email"
          type="email"
          required
          placeholder="이메일을 입력해주세요"
          value={formData.email}
          onChange={handleChange}
        />
        <InputField
          label="비밀번호"
          name="password"
          type="password"
          required
          placeholder="비밀번호를 입력해주세요"
          value={formData.password}
          onChange={handleChange}
        />
        <InputField
          label="비밀번호 확인"
          name="passwordCheck"
          type="password"
          required
          placeholder="비밀번호를 다시 입력해주세요"
          value={formData.passwordCheck}
          onChange={handleChange}
        />

        <div className={styles.term}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            이용약관 및 <a href="/policy">개인정보 처리방침</a>에 동의합니다.
          </span>
        </div>

        <BigButton onClick={handleSubmit}>회원가입</BigButton>

        <span className={styles.loginText}>
          이미 계정이 있으신가요? <Link href="/login">로그인</Link>
        </span>
      </div>
    </div>
  );
}
