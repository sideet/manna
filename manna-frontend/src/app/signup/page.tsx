import styles from "./page.module.css";

export default function Signup() {
  return (
    <div>
      회원가입 페이지 입니다
      <form className={styles.container}>
        <label>
          이메일
          <input type="email" />
        </label>
        <label>
          비밀번호
          <input type="email" />
        </label>
        <label>
          비밀번호 확인
          <input type="email" />
        </label>
      </form>
    </div>
  );
}
