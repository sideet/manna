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
import Image from "next/image";

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
          <div className={styles.headerRightSlot}>
            {userData?.user ? (
              <Link href={"/mypage"}>
                <FaUserCircle />
                {userData.user.nickname} 님
              </Link>
            ) : (
              <Link href={"/login"}>
                로그인
                <IoLogInOutline />
              </Link>
            )}
          </div>
        }
      />
      <main className={styles.main}>
        <Image
          src="/manna-icon.png"
          alt="logo"
          className={styles.logo}
          width={150}
          height={150}
        />
        <RoomJoinForm />
        <div className={styles.createScheduleDiv}>
          <p>일정을 생성하고 싶으신가요?</p>
          <BigButton onClick={moveCreateSchedulePage}>일정 생성하기</BigButton>
        </div>
      </main>
    </div>
  );
}
