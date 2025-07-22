"use client";
import RoomJoinForm from "./_components/RoomJoinForm";
import styles from "./page.module.css";
import Header from "./_components/Header";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // memo: 로그인 완료되었을 때 보일 아이콘
import { IoLogInOutline } from "react-icons/io5";
import BigButton from "./_components/BigButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: userData } = useSession();
  const router = useRouter();

  /**
   * 일정 생성하기 버튼
   * @method
   */
  const moveCreateSchedulePage = () => {
    if (!userData?.user) {
      alert("로그인 후 이용해 주세요.");
      router.push("/login");
    } else {
      router.push("/create/room");
    }
  };

  return (
    <div className={styles.container}>
      <Header
        rightSlot={
          <div>
            {userData?.user ? (
              <Link href={"/mypage"}>
                <FaUserCircle />
              </Link>
            ) : (
              <Link href={"/login"}>
                <IoLogInOutline />
              </Link>
            )}
          </div>
        }
      />
      <main className={styles.main}>
        <img src="/manna-icon.png" alt="logo" className={styles.logo} />
        <RoomJoinForm />
        <p>일정을 생성하고 싶으신가요?</p>
        <BigButton onClick={moveCreateSchedulePage}>일정 생성하기</BigButton>
      </main>
    </div>
  );
}
