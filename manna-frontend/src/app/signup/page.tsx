import Link from "next/link";
import BigButton from "../_components/BigButton";
import Header from "../_components/Header";
import InputField from "../_components/InputField";
import styles from "./page.module.css";

export default function Signup() {
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
        />
        <InputField
          label="이메일"
          name="email"
          type="email"
          required
          placeholder="이메일을 입력해주세요"
        />
        <InputField
          label="비밀번호"
          name="password"
          type="password"
          required
          placeholder="비밀번호를 입력해주세요"
        />
        <InputField
          label="비밀번호 확인"
          name="passwordCheck"
          type="password"
          required
          placeholder="비밀번호를 다시 입력해주세요"
        />
        <div className={styles.term}>
          <input type="checkbox" />
          <span>
            {/* TODO: 약관 생성 */}
            이용약관 및 <a href="/login">개인정보 처리방침</a>에 동의합니다.
          </span>
        </div>
        <BigButton>회원가입</BigButton>
        <span className={styles.loginText}>
          이미 계정이 있으신가요? <Link href={"/login"}>로그인</Link>
        </span>
      </div>
    </div>
  );
}
