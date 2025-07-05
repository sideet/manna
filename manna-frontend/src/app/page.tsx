import RoomJoinForm from "./_components/RoonJoinForm";
import styles from "./page.module.css";
import Header from "./_components/Header";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <img src="/manna-icon.png" alt="logo" className={styles.logo} />
        <RoomJoinForm />
        <p>임시 회원가입 바로가기 버튼</p>
        <Link href={"/signup"}>
          <button>회원가입</button>
        </Link>
      </main>
    </div>
  );
}
