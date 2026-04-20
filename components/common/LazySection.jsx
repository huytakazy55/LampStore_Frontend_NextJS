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
 * @param {string} props.height - Minimum height cho placeholder (tránh layout shift)
 * @param {string} props.className - Custom className
 * @param {string} props.rootMargin - Khoảng cách preload (mặc định '300px')
 */
const LazySection = memo(({ 
  children, 
  height = '200px', 
  className = '',
  rootMargin = '300px 0px',
}) => {
  const scrollContainer = useScrollContainer();
  
  const { ref, hasBeenVisible } = useLazyLoad({
    rootMargin,
    root: scrollContainer,
  });

  return (
    <div ref={ref} className={className} style={{ minHeight: hasBeenVisible ? 'auto' : height }}>
      {hasBeenVisible ? (
        children
      ) : (
        <div 
          className="w-full flex justify-center items-center" 
          style={{ height }}
        >
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
