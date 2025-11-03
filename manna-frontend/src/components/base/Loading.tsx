export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-white bg-opacity-50 z-50">
      <div className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
    </div>
  );
}
