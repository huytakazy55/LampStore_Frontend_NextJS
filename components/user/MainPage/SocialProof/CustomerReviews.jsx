"use client";

import React from 'react';

const mockReviews = [
    {
        id: 1,
        name: 'Trần Quỳnh',
        avatar: 'T',
        productName: 'Đèn ngủ hình thỏ đáng yêu',
        rating: 5,
        date: '10/07/2026',
        comment: 'Đèn siêu cưng luôn ạ! Ánh sáng dịu nhẹ, bé nhà mình rất thích. Đóng gói cẩn thận, giao hàng nhanh.',
        verified: true
    },
    {
        id: 2,
        name: 'Minh Hằng',
        avatar: 'M',
        productName: 'Đèn ngủ Silicon hình Capybara',
        rating: 5,
        date: '08/07/2026',
        comment: 'Silicone mềm mại, bóp bóp rất vui tay. Mua làm quà sinh nhật cho bạn gái mà bạn ấy mê mẩn luôn. Sẽ ủng hộ shop tiếp!',
        verified: true
    },
    {
        id: 3,
        name: 'Hoàng Nam',
        avatar: 'H',
        productName: 'Đèn LED phi hành gia',
        rating: 5,
        date: '05/07/2026',
        comment: 'Đèn xịn, chiếu sáng rất đẹp, tạo không gian ảo diệu cho phòng. Giá hợp lý so với chất lượng.',
        verified: true
    },
    {
        id: 4,
        name: 'Lan Anh',
        avatar: 'L',
        productName: 'Đèn ngủ hình Capybara',
        rating: 5,
        date: '02/07/2026',
        comment: 'Sản phẩm đúng như mô tả. Đèn pin sạc rất tiện lợi, không phải cắm dây lằng nhằng.',
        verified: true
    },
    {
        id: 5,
        name: 'Quốc Bảo',
        avatar: 'Q',
        productName: 'Đèn tranh LED 3D',
        rating: 4,
        date: '28/06/2026',
        comment: 'Đẹp tuyệt vời, treo lên phòng ngủ nhìn sang hẳn. Tuy nhiên giao hàng hơi lâu một chút (3 ngày).',
        verified: true
    },
    {
        id: 6,
        name: 'Thu Trang',
        avatar: 'T',
        productName: 'Đèn ngủ hình mèo',
        rating: 5,
        date: '25/06/2026',
        comment: 'Rất ưng ý! Chạm nhẹ là đổi màu, rất nhạy. Shop tư vấn nhiệt tình.',
        verified: true
    }
];

export default function CustomerReviews() {
    return (
        <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <div className="xl:max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-0">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Khách Hàng Nói Gì Về <span className="text-primary-600">CapyLumine</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                        Những đánh giá chân thực nhất là minh chứng cho chất lượng sản phẩm và dịch vụ của chúng tôi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockReviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center shrink-0">
                                        {review.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {review.name}
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            {review.verified && <i className='bx bxs-check-circle text-green-500' />}
                                            Đã mua hàng
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {review.date}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`bx bxs-star text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                                ))}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
                                "{review.comment}"
                            </p>
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs font-medium text-primary-600 dark:text-primary-400 truncate">
                                Phân loại: {review.productName}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
