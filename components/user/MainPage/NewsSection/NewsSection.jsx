"use client";

import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@/lib/router-compat';
import NewsService from '@/services/NewsService';
import { resolveImagePath } from '@/lib/imageUtils';

const NewsSection = () => {
    const navigate = useNavigate();

    const { data: newsList = [], isLoading: loading } = useQuery({
        queryKey: ['news', 'list'],
        queryFn: async () => {
            const response = await NewsService.getAllNews(true);
            const data = response.data?.$values || response.data || [];
            return data.slice(0, 3);
        },
        staleTime: 5 * 60 * 1000, // 5 phút
        cacheTime: 10 * 60 * 1000, // 10 phút
    });

    return (
        <div className='w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
            <div className='flex justify-between items-center relative pb-3 border-b border-gray-300 dark:border-[#333] mb-6 md:mb-8 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-40 after:h-0.5 after:bg-primary-600 after:rounded-sm'>
                <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 md:w-[42px] md:h-[42px] flex items-center justify-center bg-primary-600 dark:bg-primary-900 rounded-md flex-shrink-0'>
                        <i className='bx bx-news text-xl md:text-[1.4rem] text-white'></i>
                    </div>
                    <h3 className='text-sm md:text-h3 font-bold text-gray-800 dark:text-gray-200 m-0'>Tin tức & Góc nội thất</h3>
                </div>
                <button
                    onClick={() => navigate('/news')}
                    className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1"
                >
                    Xem tất cả <i className='bx bx-chevron-right'></i>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
                            <div className="bg-gray-200 h-48 w-full mb-4 rounded"></div>
                            <div className="bg-gray-200 h-5 w-3/4 mb-3 rounded"></div>
                            <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
                            <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
                        </div>
                    ))
                ) : newsList.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500 py-8">Chưa có bài viết nào.</div>
                ) : (
                    newsList.map((news) => {
                        const imageSrc = resolveImagePath(news.imageUrl, 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
                        const dateStr = new Date(news.createdAt).toLocaleDateString('vi-VN');

                        return (
                            <div
                                key={news.id}
                                className="group cursor-pointer flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                                onClick={() => navigate(`/news/${news.slug || news.id}`)}
                            >
                                <div className="relative h-48 md:h-56 overflow-hidden">
                                    <Image
                                        src={imageSrc}
                                        alt={news.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        quality={50}
                                    />
                                    <div className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {news.category}
                                    </div>
                                </div>

                                <div className="p-4 md:p-5 flex flex-col flex-grow">
                                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                        <i className='bx bx-calendar'></i> {dateStr}
                                    </div>
                                    <h4 className="text-sm md:text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors" title={news.title}>
                                        {news.title}
                                    </h4>
                                    <p className="text-xs md:text-sm text-gray-500 line-clamp-3 mb-4 flex-grow" title={news.excerpt}>
                                        {news.excerpt}
                                    </p>

                                    <div className="mt-auto text-xs font-bold text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Đọc tiếp <i className='bx bx-right-arrow-alt text-base'></i>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NewsSection;
