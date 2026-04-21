import Link from 'next/link';

export const metadata = {
    title: 'Trang không tồn tại',
    robots: { index: false, follow: false },
};

export default function NotFound()
{
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="relative mb-8">
                    <h1 className="text-[120px] md:text-[160px] font-black text-gray-100 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className='bx bx-ghost text-6xl text-amber-400 animate-bounce'></i>
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Trang không tồn tại</h2>
                <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
                    Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc
                    tạm thời không khả dụng.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all shadow-lg shadow-amber-200">
                        <i className='bx bx-home-alt'></i>
                        Về trang chủ
                    </Link>
                    <Link href="/categories"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-amber-400 hover:text-amber-600 transition-all">
                        <i className='bx bx-search-alt'></i>
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}
