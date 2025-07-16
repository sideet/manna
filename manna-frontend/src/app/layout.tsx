import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import AuthSession from "./_components/AuthSession";

export const metadata: Metadata = {
  title: "Manna App",
  description: "일정을 잡기 편한 만나 웹사이트입니다.",
  icons: {
    icon: "/favicon.ico",
  },
};

// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthSession>
          <div className={styles.wrapper}>
            {/* 좌측 소개 영역 - 넓을 때만 보임 */}
            <aside className={styles.sidebar}>
              <h1>manna</h1>
              <p>약속이 즐거워지는 공간</p>
            </aside>

            {/* 콘텐츠 영역 */}
            <main className={styles.main}>{children}</main>

            {/* 우측 여백 */}
            <div className={styles.rightEmpty} />
          </div>
        </AuthSession>
      </body>
    </html>
  );
}
