"use client";
import styles from "./page.module.css";
import Header from "./_components/Header";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // memo: 로그인 완료되었을 때 보일 아이콘
import { IoLogInOutline } from "react-icons/io5";
import BigButton from "./_components/BigButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import JoinScheduleForm from "./_components/JoinScheduleForm";
import { useToast } from "./_components/ToastProvider";

export default function HomePage() {
  const { data: userData } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  /**
   * 일정 생성하기 버튼
   * @method
   */
  const moveCreateSchedulePage = () => {
    if (!userData?.user) {
      showToast("로그인 후 이용해 주세요.", "warning");
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
                {userData.user.name} 님
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
          src="/manna-simple.png"
          alt="logo"
          className={styles.logo}
          width={150}
          height={150}
        />
        {/* <p>
          오늘 <b className={styles.tempBold}>13개</b>의 일정이 생성되었어요!
        </p> */}
        <BigButton onClick={moveCreateSchedulePage}>일정 생성하기</BigButton>
        <JoinScheduleForm />

        {/* <div className={styles.createScheduleDiv}>
          <ul>
            <li>새로운 커피챗 / 박*솜님의 커피챗</li>
            <li>새로운 커피챗 / 박*솜님의 커피챗</li>
            <li>새로운 커피챗 / 박*솜님의 커피챗</li>
            <li>새로운 커피챗 / 박*솜님의 커피챗</li>
            <li>새로운 커피챗 / 박*솜님의 커피챗</li>
          </ul>
        </div> */}
        {/* <div className={styles.createScheduleDiv}>
          <p>일정을 생성하고 싶으신가요?</p>
          <BigButton onClick={moveCreateSchedulePage}>일정 생성하기</BigButton>
        </div> */}
      </main>
    </div>
  );
}
