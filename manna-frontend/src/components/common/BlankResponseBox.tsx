import { IoCopyOutline } from "react-icons/io5";

export default function BlankResponseBox({
  handleCopyLink,
}: {
  handleCopyLink: () => void;
}) {
  return (
    <div className="w-full bg-white rounded-[8px] border border-gray-200 p-16">
      <p className="text-subtitle16 text-gray-800 font-bold mb-4 text-center">
        아직 응답한 사람이 없어요
      </p>
      <p className="text-body14 text-gray-600 mb-16 text-center">
        링크를 공유해 새로운 일정을 만들어봐요!
      </p>
      <button
        onClick={handleCopyLink}
        className="w-full h-44 bg-gray-50 border border-gray-200 rounded-[8px] flex items-center justify-center gap-6 text-body14 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        링크 복사하기
        <IoCopyOutline className="w-16 h-16" />
      </button>
    </div>
  );
}
