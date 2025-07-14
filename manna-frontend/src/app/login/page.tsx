import styles from "./page.module.css";
import Link from "next/link";
import Header from "../_components/Header";
import InputField from "../_components/InputField";
import BigButton from "../_components/BigButton";

export default function Login() {
  return (
    <div>
      <Header title="로그인" showBackButton />

      <div className={styles.container}>
        <img src="/manna-icon.png" alt="logo" className={styles.logo} />
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
        <BigButton>로그인</BigButton>
        <span className={styles.loginText}>
          아직 회원이 아니신가요? <Link href={"/signup"}>회원가입</Link>
        </span>
      </div>
    </div>
  );
}
