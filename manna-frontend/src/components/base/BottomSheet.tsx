export default function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-[var(--color-opacity-1)] z-40"
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-16 max-w-480 mx-auto rounded-t-[24px]">
        {children}
      </div>
    </>
  );
}
