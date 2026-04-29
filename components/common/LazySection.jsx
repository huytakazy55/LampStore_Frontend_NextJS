"use client";

import React, { memo } from 'react';
import useLazyLoad from '@/hooks/useLazyLoad';
import { useScrollContainer } from '@/lib/scroll-compat';

/**
 * LazySection - Wrapper component chỉ render children khi scroll đến.
 * 
 * Features:
 * - Tự động lấy scroll container từ Context (tương thích smooth-scrollbar)
 * - Hiện skeleton placeholder trước khi load
 * - Giữ lại content sau khi đã load 1 lần (không unmount khi scroll đi)
 * - Preload trước 300px để user không thấy loading
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component cần lazy load
 * @param {string} props.minHeightClass - Responsive Tailwind class cho chiều cao (ví dụ: 'min-h-[120px] sm:min-h-[280px]')
 * @param {string} props.className - Custom className
 * @param {string} props.rootMargin - Khoảng cách preload (mặc định '300px 0px')
 */
const LazySection = memo(({ 
  children, 
  height, // Keep for backward compatibility
  minHeightClass = '',
  className = '',
  rootMargin = '300px 0px',
}) => {
  const scrollContainer = useScrollContainer();
  
  const { ref, hasBeenVisible } = useLazyLoad({
    rootMargin,
    root: scrollContainer,
  });

  // Calculate dynamic classes and styles
  const containerStyle = height && !hasBeenVisible ? { minHeight: height } : {};
  const skeletonStyle = height ? { height } : {};
  
  const containerClass = `${className} ${!hasBeenVisible ? minHeightClass : ''}`.trim();
  const skeletonClass = `w-full flex justify-center items-center ${minHeightClass}`.trim();

  return (
    <div ref={ref} className={containerClass} style={containerStyle}>
      {hasBeenVisible ? (
        children
      ) : (
        <div className={skeletonClass} style={skeletonStyle}>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
});

LazySection.displayName = 'LazySection';

export default LazySection;
