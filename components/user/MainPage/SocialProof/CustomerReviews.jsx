"use client";

import React, { useState, useEffect } from 'react';
import ReviewService from '@/services/ReviewService';

export default function CustomerReviews()
{
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await ReviewService.getRecentReviews(6);
                if (res.data) {
                    setReviews(res.data.$values || res.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch recent reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) {
        return (
            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                <div className="xl:max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-0 text-center">
                    <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) return null;

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
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center shrink-0 uppercase">
                                        {review.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {review.userName}
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <i className='bx bxs-check-circle text-green-500' />
                                            Đã mua hàng
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(review.createAt).toLocaleDateString('vi-VN')}
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
