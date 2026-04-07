export default function Loading() {
  return (
    <div className="py-20 text-center w-full min-h-[50vh] flex flex-col items-center justify-center page-fade">
      <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 text-amber-500"></i>
      <h3 className="text-xl font-bold text-gray-300">최신 게시물을 불러오는 중입니다...</h3>
    </div>
  );
}
