import Link from "next/link";
import Image from "next/image";
import Header from "@/components/home/Header";
import Gap from "@/components/base/Gap";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="로그인" showBackButton />

      <Gap direction="col" gap={76}>
        <Gap direction="col" gap={40} width="full" className="mt-52 ">
          <Gap direction="col" gap={20}>
            <Image src="/logo_light.svg" alt="logo" width={100} height={100} />
            <p className="text-center text-head24 text-gray-900">
              복잡한 일정 조율, <br /> 만나에서 심플하게!
            </p>
          </Gap>

          <Gap direction="col" gap={8} width="full">
            <Link
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/login/kakao`}
              className="relative w-full h-56 flex items-center justify-center bg-[#FEE500] hover:bg-[#FDD835] text-body16 text-gray-900 rounded-full transition"
            >
              <Image
                src="/icons/kakao.svg"
                alt="kakao"
                width={16}
                height={16}
                className="absolute left-20"
              />
              카카오로 시작하기
            </Link>

            <Link
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/login/google`}
              className="relative w-full h-56 flex items-center justify-center gap-2 border border-gray-200 text-body16 text-gray-900 rounded-full hover:bg-gray-50 transition"
            >
              <Image
                src="/icons/google.svg"
                alt="google"
                width={16}
                height={16}
                className="absolute left-20"
              />
              Google로 시작하기
            </Link>
          </Gap>
        </Gap>

        <div className="flex items-center justify-center gap-30 text-body14 text-gray-800">
          <Link href="/login/email" className="w-90 text-center">
            이메일 로그인
          </Link>
          <span className="w-px h-20 bg-gray-200" />
          <Link href="/signup" className="w-90 text-center">
            이메일 회원가입
          </Link>
        </div>
      </Gap>
    </div>
  );
}
