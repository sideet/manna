import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import styles from "./layout.module.css";
import AuthSession from "../components/auth/AuthSession";
import { FaCalendarCheck, FaUsers } from "react-icons/fa6";
import { ToastProvider } from "@/providers/ToastProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import GAPageView from "@/components/analytics/GAPageView";
import { Suspense } from "react";

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
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ko">
      <head>
        {gaMeasurementId ? (
          <>
            {/* Google tag (gtag.js) */}
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        <Suspense fallback={null}>
          <GAPageView />
        </Suspense>
        <QueryProvider>
          <ToastProvider>
            <AuthSession>
              <div className={styles.wrapper}>
                {/* 좌측 소개 영역 - 넓을 때만 보임 */}
                <aside className={styles.sidebar}>
                  <div className={styles.sidebarInnerBox}>
                    <h1 className="text-head24 font-bold">MANNA</h1>
                    <p className="text-body16 text-gray-600">
                      약속이 즐거워지는 공간, 만나
                    </p>

                    <div className={styles.featureSummary}>
                      <div className={styles.iconWrapper}>
                        <FaCalendarCheck fill="#006eff" />
                      </div>
                      <div className={styles.featureTextWrapper}>
                        <h5 className="text-subtitle16 font-bold">
                          손쉬운 일정 관리
                        </h5>
                        <p className="text-body14 text-gray-600">
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
                        <h5 className="text-subtitle16 font-bold">
                          실시간 응답 확인
                        </h5>
                        <p className="text-body14 text-gray-600">
                          참석자들의 응답을 실시간으로 확인할 수 있어요
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* 콘텐츠 영역 */}
                <main
                  id="content-area"
                  className="relative w-full max-w-480 mx-auto px-16 bg-white max-h-[100vh] overflow-y-auto"
                >
                  {children}
                </main>

                {/* 우측 여백 */}
                <div className={styles.rightEmpty} />
              </div>
            </AuthSession>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
