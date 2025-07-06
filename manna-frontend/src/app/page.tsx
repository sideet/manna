import RoomJoinForm from "./_components/RoonJoinForm";
import styles from "./page.module.css";
import Header from "./_components/Header";
import Link from "next/link";
// import { FaUserCircle } from "react-icons/fa"; // memo: 로그인 완료되었을 때 보일 아이콘
import { IoLogInOutline } from "react-icons/io5";

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
      </main>
    </div>
  );
}
