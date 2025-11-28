"use client";

import { useSession } from "next-auth/react";

export default function TopSection() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <TopSectionUI
        heading="딱 맞는날을 찾아보세요"
        content={[
          "로그인하면 손쉽게 약속을 만들고",
          "일정을 확정할 수 있어요.",
        ]}
      />
    );
  }

  return (
    <TopSectionUI
      heading={`안녕하세요 ${session?.user?.name}님`}
      content={["일정을 만들고 만날 날을 확정해 보세요."]}
    />
  );
}

const TopSectionUI = ({
  heading,
  content,
}: {
  heading: string;
  content: string[];
}) => {
  return (
    <section className="flex flex-col w-full text-left">
      <h3 className="text-head24 text-black">{heading}</h3>
      {content.map((item, index) => (
        <p key={index} className="text-body16 text-gray-600">
          {item}
        </p>
      ))}
    </section>
  );
};
