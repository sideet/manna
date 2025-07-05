"use client";
import styles from "./header.module.css";
import Link from "next/link";

export default function Header() {
  const isLogin = false;

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <Link href={isLogin ? "" : "/login"}>
          {isLogin ? "로그인 아이콘" : "비로그인아이콘(로그인가기)"}
        </Link>
      </div>
    </div>
  );
}
