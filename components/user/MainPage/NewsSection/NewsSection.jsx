"use client";

import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@/lib/router-compat';
import NewsService from '@/services/NewsService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

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
        <div className='w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 mb-12 mt-8'>
            <div className='flex justify-between items-center relative pb-2 border-b border-gray-300 mb-6 md:mb-8 after:w-[30%] md:after:w-[13%] after:h-[1px] after:absolute after:bottom-0 after:bg-yellow-400'>
                <h3 className='text-xl md:text-h3 font-medium text-black'>Tin tức & Góc nội thất</h3>
                <button
                    onClick={() => navigate('/news')}
                    className="text-sm font-medium text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-1"
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
                        const imageSrc = news.imageUrl ? (news.imageUrl.startsWith('http') ? news.imageUrl : `${API_ENDPOINT}${news.imageUrl}`) : 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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
                                        quality={75}
                                    />
                                    <div className="absolute top-3 left-3 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {news.category}
                                    </div>
                                </div>

                                <div className="p-4 md:p-5 flex flex-col flex-grow">
                                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                        <i className='bx bx-calendar'></i> {dateStr}
                                    </div>
                                    <h4 className="text-sm md:text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors" title={news.title}>
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
