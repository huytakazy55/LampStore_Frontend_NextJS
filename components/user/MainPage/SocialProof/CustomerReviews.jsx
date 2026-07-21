"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReviewService from '@/services/ReviewService';

export default function CustomerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animationDuration, setAnimationDuration] = useState(55);
    const reviewViewportRef = useRef(null);
    const reviewSequenceRef = useRef(null);
    const [loopDistance, setLoopDistance] = useState(0);
    const [repeatCount, setRepeatCount] = useState(3);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Fetch more reviews to ensure we can get 20 5-star reviews
                const res = await ReviewService.getRecentReviews(100);
                if (res.data) {
                    const fetchedReviews = res.data.$values || res.data || [];
                    const fiveStarReviews = fetchedReviews.filter(r => r.rating === 5);
                    setReviews(fiveStarReviews.slice(0, 20));
                }
            } catch (error) {
                console.error("Failed to fetch recent reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    useEffect(() => {
        const viewport = reviewViewportRef.current;
        const sequence = reviewSequenceRef.current;
        if (!viewport || !sequence || reviews.length === 0) return;

        const updateLoopMetrics = () => {
            const distance = sequence.scrollWidth;
            const viewportWidth = viewport.offsetWidth;

            if (!distance) return;

            setLoopDistance(distance);
            setAnimationDuration(distance / 100);
            setRepeatCount(Math.max(3, Math.ceil(viewportWidth / distance) + 2));
        };

        updateLoopMetrics();

        const resizeObserver = new ResizeObserver(updateLoopMetrics);
        resizeObserver.observe(viewport);
        resizeObserver.observe(sequence);

        return () => resizeObserver.disconnect();
    }, [reviews]);

    if (loading) {
        return (
            <section className="py-12 h-[350px] overflow-hidden flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) return null;

    const getReviewGap = (review, index, rowIndex) => {
        const seed = String(review.id || `${review.userName}-${index}-${rowIndex}`)
            .split('')
            .reduce((sum, char) => sum + char.charCodeAt(0), 0);

        return `${24 + ((seed + index * 13 + rowIndex * 17) % 41)}px`;
    };

    const getReviewOffsetY = (index) => {
        const offsets = [0, 58, 22, 86, 36, 72, 12, 96, 46, 64];

        return `${offsets[index % offsets.length]}px`;
    };

    const renderReviewCard = (review, index, rowIndex, keyPrefix = 'review') => (
        <div
            key={`${keyPrefix}-${review.id || index}`}
            className="flex-none"
            style={{
                paddingRight: getReviewGap(review, index, rowIndex)
            }}
        >
            <div
                className="w-[300px] sm:w-[420px] relative bg-white dark:bg-gray-800 rounded-[1.5rem] p-5 shadow-xl flex flex-col"
                style={{ transform: `translateY(${getReviewOffsetY(index)})` }}
            >
                {/* Quote Icon Background */}
                <div className="absolute -top-5 right-6 opacity-30 z-0">
                    <i className="bx bxs-quote-right text-6xl text-gray-200 dark:text-gray-700"></i>
                </div>

                {/* Avatar + Name + Date + Verified at the top */}
                <div className="flex items-center gap-3 mb-3 relative z-10">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-[#E8E4DF] dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold text-base uppercase">
                            {review.userName.charAt(0)}
                        </div>
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center gap-3">
                            <div className="font-semibold text-orange-500 dark:text-orange-400 text-[15px] truncate" style={{ fontFamily: 'cursive' }}>
                                {review.userName}
                            </div>
                            <div className="text-[11px] text-gray-400 shrink-0">
                                {new Date(review.createAt).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <i className='bx bxs-check-circle text-green-500 text-[13px]' />
                            Đã mua hàng
                        </div>
                    </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 text-yellow-400 text-sm mb-2 relative z-10">
                    {[...Array(5)].map((_, i) => (
                        <i key={i} className="bx bxs-star" />
                    ))}
                </div>

                {/* Comment */}
                <p className="text-gray-500 dark:text-gray-300 text-[14px] italic relative z-10 line-clamp-2 mb-3">
                    "{review.comment}"
                </p>

                {/* Product Name (Footer) */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 relative z-10 mt-auto">
                    <div className="text-[11px] font-medium text-orange-500 dark:text-orange-400 truncate flex items-center">
                        <i className='bx bx-shopping-bag mr-1.5 text-[13px]'></i>
                        {review.productName}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <section className="py-12">
            <style>{`
                @keyframes reviewMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(var(--review-loop-distance, 0px) * -1)); }
                }
                .review-track {
                    display: flex;
                    align-items: flex-start;
                    width: max-content;
                    animation: reviewMarquee linear infinite;
                    will-change: transform;
                }
                .review-track:hover {
                    animation-play-state: paused;
                }
                .review-sequence {
                    display: flex;
                    align-items: flex-start;
                    flex: none;
                }
            `}</style>

            <div className="xl:max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-0">
                <div className='flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 mb-6 md:mb-8 pb-3 border-b border-gray-300 dark:border-[#333] relative after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-primary-600 after:rounded-sm'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 md:w-[42px] md:h-[42px] flex items-center justify-center bg-primary-600 dark:bg-primary-900 rounded-md flex-shrink-0'>
                            <i className='bx bxs-star text-xl md:text-[1.4rem] text-white'></i>
                        </div>
                        <h3 className='text-sm md:text-h3 font-bold text-gray-800 dark:text-gray-200 m-0'>Đánh giá của khách hàng</h3>
                    </div>
                </div>

                <div ref={reviewViewportRef} className="relative overflow-hidden py-6 min-h-[310px]">
                    <div
                        className="review-track"
                        style={{
                            '--review-loop-distance': `${loopDistance}px`,
                            animationDuration: `${animationDuration}s`
                        }}
                    >
                        {Array.from({ length: repeatCount }).map((_, copyIndex) => (
                            <div
                                key={copyIndex}
                                ref={copyIndex === 0 ? reviewSequenceRef : null}
                                className="review-sequence"
                                aria-hidden={copyIndex > 0 ? "true" : undefined}
                            >
                                {reviews.map((review, index) => renderReviewCard(review, index, 0, `review-${copyIndex}`))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
