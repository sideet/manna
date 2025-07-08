"use client";
import { useEffect } from "react";
import styles from "./page.module.css";
import Header from "@/app/_components/Header";
import InputSectionBox from "../../_components/InputSectionBox";
import InputField from "@/app/_components/InputField";
import BigButton from "@/app/_components/BigButton";
import { FaCirclePlus } from "react-icons/fa6";

export default function HomePage() {
  /**
   * 로그인 여부 검사
   * @method
   */
  const checkIsUser = () => {
    if (false) {
      // 페이지 이동
    }
  };

  useEffect(() => {
    // 로그인 여부 검사

    checkIsUser();
  }, []);

  return (
    <div className={styles.container}>
      <Header title="일정 생성하기" showBackButton />
      <div className={styles.inputSectionWrapper}>
        <InputSectionBox title="일정 정보">
          <InputField label="일정 이름" required />
          <InputField label="일정 설명" />
        </InputSectionBox>
        <InputSectionBox title="일정 타입">
          <button type="button">
            공통 일정
            <p>
              다른 참가자가 선택한 시간도 선택할 수 있어요. 가장 많은 사람이
              선택한 시간을 알려드려요.
            </p>
          </button>
          <button type="button">
            개별 미팅
            <p>
              한 시간에는 한 명만 참석할 수 있어요. 커피챗, 면접 등에 활용할 수
              있어요.
            </p>
          </button>
        </InputSectionBox>
        <InputSectionBox title="날짜 설정">
          <InputField label="일정 이름" required />
          <InputField label="일정 설명" />
        </InputSectionBox>
        <InputSectionBox title="시간 설정">
          <InputField label="일정 이름" required />
          <InputField label="생성 간격" required />
        </InputSectionBox>
        <InputSectionBox title="공유 옵션">
          <InputField label="일정 이름" required />
          <InputField label="생성 간격" required />
        </InputSectionBox>
        <BigButton>
          <FaCirclePlus />
          생성하기
        </BigButton>
      </div>
    </div>
  );
}
