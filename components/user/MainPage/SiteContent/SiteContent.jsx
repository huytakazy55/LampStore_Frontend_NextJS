"use client";

import React, { useRef, useEffect } from 'react'
import { useNavigate } from '@/lib/router-compat'
import Image from 'next/image'
const Banner1 = '/images/banner_new_01.webp'; const Banner2 = '/images/banner_new_02.webp'; const Banner3 = '/images/banner_new_03.webp'; export const SiteContent = () =>
{
  const navigate = useNavigate();

  const phrases = [
    'Nâng Tầm Giấc Ngủ Việt',
    'Không Gian Sáng Tạo',
    'Thiết Kế Tinh Tế',
    'Phong Cách Hiện Đại',
  ];
  
  const mobileTextRef = useRef(null);
  const desktopTextRef = useRef(null);

  useEffect(() => {
    let timeout;
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const type = () => {
      const currentPhrase = phrases[phraseIdx];
      
      if (!isDeleting) {
        if (charIdx < currentPhrase.length) {
          charIdx++;
          const text = currentPhrase.slice(0, charIdx);
          if (mobileTextRef.current) mobileTextRef.current.textContent = text;
          if (desktopTextRef.current) desktopTextRef.current.textContent = text;
          timeout = setTimeout(type, 80);
        } else {
          isDeleting = true;
          timeout = setTimeout(type, 2000);
        }
      } else {
        if (charIdx > 0) {
          charIdx--;
          const text = currentPhrase.slice(0, charIdx);
          if (mobileTextRef.current) mobileTextRef.current.textContent = text;
          if (desktopTextRef.current) desktopTextRef.current.textContent = text;
          timeout = setTimeout(type, 40);
        } else {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          timeout = setTimeout(type, 400); 
        }
      }
    };

    timeout = setTimeout(type, 3000); 
    
    return () => clearTimeout(timeout);
  }, []);

  // Inject blink keyframe into head
  useEffect(() =>
  {
    const styleId = 'blink-cursor-keyframe'
    if (!document.getElementById(styleId))
    {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`
      document.head.appendChild(style)
    }
    return () =>
    {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  return (
    <div className="w-full bg-gray-50 mb-4 md:mb-6">
      <div className="xl:max-w-[1440px] mx-auto px-4 xl:px-0 py-4 md:py-6 lg:py-8">

        {/* ===== MOBILE: Minimal compact hero ===== */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-2.5 bg-amber-600 rounded-sm" />
            <span className="text-amber-700 text-[10px] font-semibold tracking-[0.15em] uppercase">
              CapyLumine
            </span>
          </div>
          <h1 className="text-gray-900 dark:text-white text-lg font-bold leading-snug mb-2 min-h-[5rem]">
            Đèn Ngủ Cao Cấp — <span className="text-amber-700" ref={mobileTextRef}></span>
            <span
              className="inline-block w-[2px] h-[0.9em] bg-amber-600 ml-0.5 align-baseline"
              style={{ animation: 'blink 0.7s step-end infinite' }}
            />
          </h1>
          <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
            Khám phá bộ sưu tập đèn ngủ thông minh, thiết kế cho phong cách sống hiện đại.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/#products')}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-5 py-2 rounded-sm transition-all duration-300 cursor-pointer flex items-center gap-1.5"
            >
              Khám Phá
              <i className='bx bx-right-arrow-alt text-base' />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-300">
              <div className="text-gray-900 dark:text-white text-sm font-bold">5,000+</div>
              <div className="text-gray-500 text-[10px]">Khách hàng</div>
            </div>
          </div>
        </div>

        {/* ===== DESKTOP: Full hero with images ===== */}
        <div className="hidden md:flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12">

          {/* Left — Overlapping Images */}
          <div className="relative w-full lg:w-[45%] flex-shrink-0">
            <div className="relative h-[15rem] md:h-[19rem] lg:h-[21rem]">
              {/* Main image (background) */}
              <div className="absolute top-0 left-0 w-[70%] h-[85%] overflow-hidden rounded-sm shadow-xl">
                <Image
                  src={Banner3}
                  alt="Bộ sưu tập đèn ngủ"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={true}
                />
              </div>
              {/* Overlay image (foreground) */}
              <div className="absolute bottom-0 right-0 w-[55%] h-[65%] overflow-hidden rounded-sm shadow-2xl border-4 border-white">
                <Image
                  src={Banner1}
                  alt="Đèn ngủ cao cấp"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority={true}
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
            <h1 className="text-gray-900 text-2xl md:text-3xl lg:text-[2rem] font-bold leading-tight mb-4 md:mb-5 min-h-[4.5rem] md:min-h-[5.5rem] lg:min-h-[6rem]">
              Đèn Ngủ Cao Cấp — <span className="text-amber-700" ref={desktopTextRef}></span>
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
                className="bg-amber-700 hover:bg-amber-800 text-white text-xs md:text-sm font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-700/25 active:scale-95 cursor-pointer flex items-center gap-2"
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
