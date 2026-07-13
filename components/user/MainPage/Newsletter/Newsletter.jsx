"use client";

import React from 'react'

const Newsletter = () =>
{
    return (
        <div className='bg-gray-900 dark:bg-[#131313] border-y border-transparent dark:border-[#222] shadow-xl relative overflow-hidden'>
            {/* Subtle decorative gradient overlay */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3'></div>
            
            <div className='relative flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 py-5 md:py-0 md:h-20 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0'>
                <div className='text-sm md:text-lg font-bold flex justify-center items-center gap-3 md:gap-4 text-white'>
                    <div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20'>
                        <i className='bx bxl-telegram text-xl text-primary-500'></i>
                    </div>
                    <span>Đăng ký nhận tin</span>
                </div>
                <div className='text-xs md:text-sm text-center md:text-left text-gray-300'>
                    ...và nhận <b className='text-primary-500'>ưu đãi 20% cho đơn hàng đầu tiên</b>
                </div>
                <div className='w-full md:w-[35%]'>
                    <div className="bg-gray-800 border border-gray-700 h-10 md:h-11 pl-4 md:pl-5 flex justify-center items-center rounded-full overflow-hidden shadow-md">
                        <input className='h-full border-none outline-none w-9/12 text-sm bg-transparent placeholder-gray-400 text-white'
                            type="email"
                            placeholder='Nhập email của bạn...' />
                        <button className='w-1/4 h-full font-bold bg-primary-600 hover:bg-primary-500 text-white text-xs md:text-sm transition-colors duration-300'>
                            Đăng ký
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Newsletter