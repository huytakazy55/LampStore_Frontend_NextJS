"use client";

import React from 'react';
import Image from 'next/image';

// Dùng tạm ảnh demo, sau này thay bằng ảnh khách feedback thực tế
const mockGallery = [
    '/images/capy.png',
    '/images/thỏ.jpg',
    '/images/cameras-2.jpg',
    '/images/capy.png',
];

export default function CustomerGallery() {
    return (
        <section className="py-12 md:py-16 bg-white dark:bg-black overflow-hidden">
            <div className="xl:max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-0">
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Không Gian Của Khách Hàng
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
                        Cảm hứng thiết kế từ chính góc phòng của những khách hàng thân thiết. Hãy chia sẻ không gian của bạn cùng chúng tôi!
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {mockGallery.map((img, index) => (
                        <div key={index} className="relative aspect-square group overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-pointer">
                            <Image 
                                src={img} 
                                alt={`Feedback khách hàng ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <i className='bx bxl-instagram text-3xl text-white drop-shadow-md' />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm md:text-base flex items-center justify-center gap-1.5 mx-auto">
                        Xem thêm trên Instagram <i className='bx bx-right-arrow-alt' />
                    </button>
                </div>
            </div>
        </section>
    );
}
