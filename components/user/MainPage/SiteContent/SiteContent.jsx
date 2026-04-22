"use client";

import React, { useState, useEffect } from 'react'
import { useNavigate } from '@/lib/router-compat'
const Banner1 = '/images/banner_new_01.png'; const Banner2 = '/images/banner_new_02.png'; const Banner3 = '/images/banner_new_03.png'; export const SiteContent = () => {
  const navigate = useNavigate();

  const phrases = [
    'Nâng Tầm Giấc Ngủ Việt',
    'Không Gian Sáng Tạo',
    'Thiết Kế Tinh Tế',
    'Phong Cách Hiện Đại',
  ];
  const [displayText, setDisplayText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout;

    if (!isDeleting) {
      // Typing
      if (displayText.length < current.length) {
        timeout = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, 80);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40);
      } else {
        // Move to next phrase
        setIsDeleting(false);
        setPhraseIdx((phraseIdx + 1) % phrases.length);
      }
    }
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText, isDeleting, phraseIdx]);

  // Inject blink keyframe into head
  useEffect(() => {
    const styleId = 'blink-cursor-keyframe'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`
      document.head.appendChild(style)
    }
    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  return (
    <div className="w-full bg-gray-50 mb-4 md:mb-6">
      <div className="xl:max-w-[1440px] mx-auto px-6 xl:px-0 py-4 md:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12">

          {/* Left — Overlapping Images */}
          <div className="relative w-full lg:w-[45%] flex-shrink-0">
            <div className="relative h-[13rem] sm:h-[15rem] md:h-[19rem] lg:h-[21rem]">
              {/* Main image (background) */}
              <div className="absolute top-0 left-0 w-[70%] h-[85%] overflow-hidden rounded-sm shadow-xl">
                <img
                  src={Banner3}
                  alt="Bộ sưu tập đèn ngủ"
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
              </div>
              {/* Overlay image (foreground) */}
              <div className="absolute bottom-0 right-0 w-[55%] h-[65%] overflow-hidden rounded-sm shadow-2xl border-4 border-white">
                <img
                  src={Banner1}
                  alt="Đèn ngủ cao cấp"
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-3 -left-3 w-24 h-24 md:w-32 md:h-32 border-2 border-amber-400/30 rounded-sm -z-10" />
              <div className="absolute -top-3 -right-3 w-20 h-20 md:w-28 md:h-28 border-2 border-amber-400/20 rounded-sm -z-10" />
            </div>
          </div>

          {/* Right — Text Content */}
          <div className="w-full lg:w-[55%]">
            {/* Tagline */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-3 h-3 bg-amber-600 rounded-sm" />
              <span className="text-amber-700 text-xs md:text-sm font-semibold tracking-[0.15em] uppercase">
                Về Lumina Home
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-gray-900 text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-bold leading-tight mb-4 md:mb-5 whitespace-nowrap">
              Đèn Ngủ Cao Cấp — <span className="text-amber-700">{displayText}</span>
              <span
                className="inline-block w-[2px] md:w-[3px] h-[1em] bg-amber-600 ml-0.5 align-baseline"
                style={{ animation: 'blink 0.7s step-end infinite' }}
              />
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-lg">
              Khám phá bộ sưu tập đèn ngủ thông minh, mang đến giấc ngủ ngon và không gian sống tinh tế. Từ đèn ngủ khung gỗ, cảm biến đến đèn LED nghệ thuật — tất cả đều được thiết kế cho phong cách sống hiện đại.
            </p>

            {/* Feature badges */}
            <div className="grid grid-cols-2 gap-4 mb-6 md:mb-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-amber-50 border border-amber-200 rounded-sm flex items-center justify-center flex-shrink-0">
                  <i className='bx bxs-check-shield text-amber-600 text-lg md:text-xl' />
                </div>
                <div>
                  <h2 className="text-gray-800 text-xs md:text-sm font-semibold mb-0.5">Bảo Hành 12 Tháng</h2>
                  <p className="text-gray-500 text-[10px] md:text-xs leading-snug">Cam kết chất lượng, đổi trả dễ dàng</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-amber-50 border border-amber-200 rounded-sm flex items-center justify-center flex-shrink-0">
                  <i className='bx bxs-truck text-amber-600 text-lg md:text-xl' />
                </div>
                <div>
                  <h2 className="text-gray-800 text-xs md:text-sm font-semibold mb-0.5">Giao Hàng Toàn Quốc</h2>
                  <p className="text-gray-500 text-[10px] md:text-xs leading-snug">Miễn phí đơn từ 500.000₫</p>
                </div>
              </div>
            </div>

            {/* CTA + Stats */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <button
                onClick={() => navigate('/#products')}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs md:text-sm font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                Khám Phá Ngay
                <i className='bx bx-right-arrow-alt text-lg' />
              </button>

              {/* Stat */}
              <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-300">
                <div>
                  <div className="text-gray-900 text-lg md:text-xl font-bold leading-none">5,000+</div>
                  <div className="text-gray-500 text-[10px] md:text-xs mt-0.5">Khách hàng tin dùng</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
