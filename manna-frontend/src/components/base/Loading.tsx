interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** 기본 스피너 컴포넌트 */
export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeMap = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="12"
            y1="2"
            x2="12"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.25 + (i / 12) * 0.75}
            transform={`rotate(${i * 30} 12 12)`}
            className="text-blue-500"
          />
        ))}
      </svg>
    </div>
  );
}

interface LoadingProps {
  message?: string;
}

/** 전체 페이지 로딩 (오버레이) */
export function FullPageLoading({ message }: LoadingProps) {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
      <Spinner size="lg" />
      {message && <p className="mt-16 text-body14 text-gray-600">{message}</p>}
    </div>
  );
}

/** 섹션/영역 로딩 */
export function SectionLoading({ message = "정보를 불러오는 중..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <Spinner size="md" />
      {message && <p className="mt-12 text-body14 text-gray-500">{message}</p>}
    </div>
  );
}

/** 인라인 스피너 (텍스트와 함께 사용) */
export function InlineLoading({ message }: LoadingProps) {
  return (
    <div className="flex items-center gap-8">
      <Spinner size="sm" />
      {message && <span className="text-body14 text-gray-500">{message}</span>}
    </div>
  );
}

/** 기본 export - FullPageLoading과 동일 */
export default function Loading() {
  return <FullPageLoading />;
}
