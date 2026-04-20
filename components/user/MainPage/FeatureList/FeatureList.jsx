"use client";

import React from 'react'

const features = [
  {
    icon: 'bx-rocket',
    title: 'Miễn phí vận chuyển',
    desc: 'Đơn hàng từ 500K',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: 'bx-like',
    title: '99% Hài lòng',
    desc: 'Đánh giá tích cực',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: 'bx-revision',
    title: 'Đổi trả 7 ngày',
    desc: 'Miễn phí đổi trả',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: 'bx-shield-quarter',
    title: 'Thanh toán an toàn',
    desc: 'Bảo mật 100%',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: 'bx-crown',
    title: 'Thương hiệu chính hãng',
    desc: 'Cam kết chất lượng',
    gradient: 'from-rose-500 to-pink-500',
    colSpan: true,
  },
]

const FeatureList = () =>
{
  return (
    <div className='w-full mb-4 md:mb-6 px-4 xl:px-0 xl:mx-auto xl:max-w-[1440px]'>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4'>
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`group relative flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl 
              bg-white dark:bg-gray-800/60 
              border border-gray-100 dark:border-gray-700/50
              hover:border-amber-200 dark:hover:border-amber-500/30
              shadow-sm hover:shadow-md dark:shadow-none
              transition-all duration-300 cursor-default
              ${feature.colSpan ? 'col-span-2 md:col-span-1' : ''}`}
          >
            {/* Icon container with gradient */}
            <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${feature.gradient} 
              flex items-center justify-center shadow-sm
              group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}
            >
              <i className={`bx ${feature.icon} text-white text-lg md:text-xl`}></i>
            </div>

            {/* Text */}
            <div className='min-w-0'>
              <strong className='block text-xs md:text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                {feature.title}
              </strong>
              <p className='text-[11px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight'>
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeatureList