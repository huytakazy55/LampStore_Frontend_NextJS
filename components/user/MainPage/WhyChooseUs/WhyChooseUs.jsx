"use client";

import React from 'react';

const reasons = [
    {
        icon: 'bx-shield-quarter',
        title: 'Bảo hành 12 tháng',
        desc: 'Đảm bảo quyền lợi khách hàng với chính sách bảo hành uy tín, hỗ trợ nhanh chóng mọi vấn đề kỹ thuật.'
    },
    {
        icon: 'bx-rocket',
        title: 'Giao hàng siêu tốc',
        desc: 'Đóng gói cẩn thận, ship COD toàn quốc. Nhận hàng nhanh chóng chỉ từ 1-3 ngày làm việc.'
    },
    {
        icon: 'bx-revision',
        title: 'Đổi trả 15 ngày',
        desc: 'Tự tin với chất lượng sản phẩm. Hỗ trợ 1 đổi 1 trong 15 ngày đầu nếu có lỗi từ nhà sản xuất.'
    },
    {
        icon: 'bx-palette',
        title: 'Thiết kế độc quyền',
        desc: 'Mẫu mã đa dạng, bắt kịp xu hướng. Cung cấp các dòng đèn ngủ, đèn decor độc đáo không đụng hàng.'
    }
];

export default function WhyChooseUs() {
    return (
        <section className="py-12 md:py-16 bg-white dark:bg-black overflow-hidden border-t border-gray-100 dark:border-gray-900">
            <div className="xl:max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-0">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Tại Sao Chọn <span className="text-primary-600">CapyLumine</span>?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                        Chúng tôi không chỉ bán một chiếc đèn, chúng tôi mang đến trải nghiệm mua sắm an tâm và một không gian sống đầy cảm hứng.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {reasons.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:-translate-y-2 transition-transform duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
                            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-5 shrink-0">
                                <i className={`bx ${item.icon} text-3xl`} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
