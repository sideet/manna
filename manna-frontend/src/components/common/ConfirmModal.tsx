"use client";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/** 확인 모달 컴포넌트 */
export default function ConfirmModal({
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-opacity-1" onClick={onCancel} />

      {/* 모달 본문 */}
      <div className="relative bg-white rounded-[16px] p-24 mx-16 max-w-[320px] w-full shadow-lg">
        <h3 className="text-subtitle16 text-gray-900 mb-8">{title}</h3>
        {description && (
          <p className="text-body14 text-gray-600 mb-20">{description}</p>
        )}

        <div className="flex gap-8">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-44 bg-gray-100 text-gray-700 rounded-[8px] text-subtitle14 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-44 bg-blue-500 text-white rounded-[8px] text-subtitle14 disabled:opacity-50"
          >
            {isLoading ? "처리 중..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
