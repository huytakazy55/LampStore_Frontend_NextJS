"use client";

import React from 'react'

const Newsletter = () => {
  return (
    <div className='mt-8 md:mt-16 bg-yellow-400'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 py-5 md:py-0 md:h-20 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0'>
            <div className='text-sm md:text-lg font-bold flex justify-center items-center gap-3 md:gap-4 text-gray-900'>
                <div className='w-10 h-10 rounded-full bg-black/10 flex items-center justify-center'>
                    <i className='bx bxl-telegram text-xl text-gray-900'></i>
                </div>
                <span>Đăng ký nhận tin</span>
            </div>
            <div className='text-xs md:text-sm text-center md:text-left text-gray-800'>
                ...và nhận <b className='text-gray-900'>ưu đãi 20% cho đơn hàng đầu tiên</b>
            </div>
            <div className='w-full md:w-[35%]'>
                <div className="bg-white h-10 md:h-11 pl-4 md:pl-5 flex justify-center items-center rounded-full overflow-hidden shadow-md">
                    <input className='h-full border-none outline-none w-9/12 text-sm bg-transparent placeholder-gray-400' 
                           type="email" 
                           placeholder='Nhập email của bạn...' />
                    <button className='w-1/4 h-full font-bold bg-gray-800 hover:bg-gray-900 text-white text-xs md:text-sm transition-colors duration-300'>
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Newsletter