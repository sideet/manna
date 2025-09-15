import styles from "./page.module.css";
import {
  FaCloud,
  FaCalendarAlt,
  FaUsers,
  FaBell,
  FaChevronDown,
} from "react-icons/fa";
import StartButton from "./_components/StartButton";
import ServerStatsDisplay from "./_components/ServerStatsDisplay";
import { getServerRealtimeStats } from "@/app/api/serverStats";
import Image from "next/image";

export default async function LandingPage() {
  // 서버사이드에서 통계 데이터 미리 로드
  const stats = await getServerRealtimeStats();

  return (
    <div className={styles.container}>
      {/* 상단 섹션 (히어로 + 현황) */}
      <div className={styles.topContainer}>
        <section className={`${styles.snapSection} ${styles.heroSection}`}>
          <div className={styles.heroContent}>
            <div className={styles.cloudIcon}>
              <FaCloud />
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.mainTitle}>만나와 함께하는 특별한 시간</h1>
              <p className={styles.subTitle}>
                쉽고 빠르게 일정을 만들고 공유하세요
              </p>
            </div>
            <StartButton />
          </div>
          <div className={styles.scrollIndicator}>
            <FaChevronDown />
          </div>
        </section>

        <section className={`${styles.snapSection} ${styles.statsSection}`}>
          <ServerStatsDisplay stats={stats} />
          <div className={styles.cloudIllustration}>
            <div className={styles.mainCloudImage}>
              <Image
                src="/manna-simple.png"
                alt="만나 로고"
                width={96}
                height={96}
              />
            </div>
            <div className={styles.backgroundClouds}>
              <div className={styles.cloud1} />
              <div className={styles.cloud2} />
              <div className={styles.cloud3} />
              <div className={styles.cloud4} />
            </div>
          </div>
          <div className={styles.scrollIndicator}>
            <FaChevronDown />
          </div>
        </section>
      </div>

      {/* 주요 기능 소개 섹션 */}
      <section className={`${styles.featuresSection} ${styles.snapSection}`}>
        <h2 className={styles.sectionTitle}>만나의 특별한 기능</h2>
        <div className={styles.featuresList}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <FaCalendarAlt />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>간편한 일정 생성</h3>
              <p className={styles.featureDescription}>
                클릭 몇 번으로 쉽게 일정을 만들고 관리할 수 있습니다.
              </p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <FaUsers />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>참여자 관리</h3>
              <p className={styles.featureDescription}>
                일정을 공유하고 참여자를 초대하세요.
              </p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <FaBell />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>알림 설정</h3>
              <p className={styles.featureDescription}>
                중요한 일정을 놓치지 않도록 알림을 보내드려요
              </p>
              <span className={styles.developmentNote}>*개발 예정</span>
            </div>
          </div>
        </div>
      </section>

      {/* 이용 방법 섹션 */}
      <section className={`${styles.snapSection} ${styles.howToUseSection}`}>
        <div className={styles.howToUseInner}>
          <h2 className={styles.sectionTitle}>이용방법</h2>
          <div className={styles.howToUseGrid}>
            <div className={styles.howToUseCard}>
              <div className={styles.howToUseNumber}>1</div>
              <h3 className={styles.howToUseCardTitle}>일정 만들기</h3>
              <p className={styles.howToUseCardDesc}>새로운 일정을 생성</p>
            </div>

            <div className={styles.howToUseCard}>
              <div className={styles.howToUseNumber}>2</div>
              <h3 className={styles.howToUseCardTitle}>시간 설정</h3>
              <p className={styles.howToUseCardDesc}>날짜와 시간을 선택</p>
            </div>

            <div className={styles.howToUseCard}>
              <div className={styles.howToUseNumber}>3</div>
              <h3 className={styles.howToUseCardTitle}>참여자 초대</h3>
              <p className={styles.howToUseCardDesc}>함께할 멤버를 초대</p>
            </div>

            <div className={styles.howToUseCard}>
              <div className={styles.howToUseNumber}>4</div>
              <h3 className={styles.howToUseCardTitle}>일정 확정</h3>
              <p className={styles.howToUseCardDesc}>모두와 함께 일정 확정</p>
            </div>
          </div>
        </div>
      </section>

      {/* 지금 바로 시작하세요 섹션 */}
      <section className={`${styles.snapSection} ${styles.startNowSection}`}>
        <div className={styles.startNowInner}>
          <h2 className={styles.startNowTitle}>지금 바로 시작하세요</h2>
          <p className={styles.startNowSub}>
            만나와 함께 특별한 순간을 만들어보세요
          </p>
          <StartButton />
        </div>
      </section>
    </div>
  );
}
