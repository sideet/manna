import RoomJoinForm from "./_components/RoonJoinForm";
import styles from "./page.module.css";
import Header from "./_components/Header";
import Link from "next/link";
// import { FaUserCircle } from "react-icons/fa"; // memo: 로그인 완료되었을 때 보일 아이콘
import { IoLogInOutline } from "react-icons/io5";
import BigButton from "./_components/BigButton";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <Header
        rightSlot={
          <Link href={"/login"}>
            {/* <FaUserCircle /> */}
            로그인
            <IoLogInOutline />
          </Link>
        }
      />
      <main className={styles.main}>
        <img src="/manna-icon.png" alt="logo" className={styles.logo} />
        <RoomJoinForm />
        <p>일정을 생성하고 싶으신가요?</p>
        <BigButton>
          <Link href={"/create/room"}>일정 생성하기</Link>
        </BigButton>
      </main>
    </div>
  );
}
