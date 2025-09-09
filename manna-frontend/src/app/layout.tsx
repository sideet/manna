import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import AuthSession from "./_components/AuthSession";
import { FaCalendarCheck, FaUsers } from "react-icons/fa6";
import { ToastProvider } from "./_components/ToastProvider";

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
        <ToastProvider>
          <AuthSession>
            <div className={styles.wrapper}>
              {/* 좌측 소개 영역 - 넓을 때만 보임 */}
              <aside className={styles.sidebar}>
                <div className={styles.sidebarInnerBox}>
                  <h1>MANNA</h1>
                  <p>약속이 즐거워지는 공간, 만나</p>

                  <div className={styles.featureSummary}>
                    <div className={styles.iconWrapper}>
                      <FaCalendarCheck fill="#006eff" />
                    </div>
                    <div className={styles.featureTextWrapper}>
                      <h5>손쉬운 일정 관리</h5>
                      <p>
                        친구와의 만남부터 채용 면접까지 빠르게 생성하고
                        공유하세요
                      </p>
                    </div>
                  </div>

                  <div className={styles.featureSummary}>
                    <div
                      className={`${styles.iconWrapper} ${styles.iconPurple}`}
                    >
                      <FaUsers fill="#A855F7" />
                    </div>
                    <div className={styles.featureTextWrapper}>
                      <h5>실시간 응답 확인</h5>
                      <p>참석자들의 응답을 실시간으로 확인할 수 있어요</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* 콘텐츠 영역 */}
              <main className={styles.main}>{children}</main>

              {/* 우측 여백 */}
              <div className={styles.rightEmpty} />
            </div>
          </AuthSession>
        </ToastProvider>
      </body>
    </html>
  );
}
