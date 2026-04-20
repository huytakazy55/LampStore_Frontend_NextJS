"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * BackToTop + ScrollProgress
 * - Rendered via Portal to escape smooth-scrollbar's transform container
 * - Circular progress ring around Back-to-Top button
 * - Vertical progress line on the right edge of viewport
 * - Works with smooth-scrollbar via Scrollbar.getAll()
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let scrollbarInstance = null;
    let cleanupSmoothScroll = null;

    const updateProgress = (scrollY, maxScroll) => {
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
      setScrollProgress(progress);
      setIsVisible(scrollY > 300);
    };

    // Try to attach to smooth-scrollbar
    const tryAttachSmoothScrollbar = () => {
      try {
        const Scrollbar = require('smooth-scrollbar').default;
        const instances = Scrollbar.getAll();
        if (instances.length > 0) {
          scrollbarInstance = instances[0];
          const listener = (status) => {
            updateProgress(status.offset.y, status.limit.y);
          };
          scrollbarInstance.addListener(listener);
          updateProgress(scrollbarInstance.offset.y, scrollbarInstance.limit.y);
          cleanupSmoothScroll = () => scrollbarInstance.removeListener(listener);
          return true;
        }
      } catch (e) { /* smooth-scrollbar not available */ }
      return false;
    };

    // Native scroll fallback
    const handleWindowScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      updateProgress(scrollTop, scrollHeight);
    };

    const hasSmoothScroll = tryAttachSmoothScrollbar();
    if (!hasSmoothScroll) {
      window.addEventListener('scroll', handleWindowScroll, { passive: true });
      handleWindowScroll();
    }

    // Retry in case smooth-scrollbar initializes later
    const retryTimer = !hasSmoothScroll ? setTimeout(() => {
      if (tryAttachSmoothScrollbar()) {
        window.removeEventListener('scroll', handleWindowScroll);
      }
    }, 1500) : null;

    return () => {
      if (cleanupSmoothScroll) cleanupSmoothScroll();
      window.removeEventListener('scroll', handleWindowScroll);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    try {
      const Scrollbar = require('smooth-scrollbar').default;
      const instances = Scrollbar.getAll();
      if (instances.length > 0) {
        instances[0].scrollTo(0, 0, 600);
        return;
      }
    } catch (e) { /* fallback */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // SVG circle params
  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - scrollProgress);

  // Use portal to render outside smooth-scrollbar's transform container
  return createPortal(
    <>
      {/* Back to Top — positioned ABOVE the FloatingCart */}
      <button
        onClick={scrollToTop}
        aria-label="Về đầu trang"
        className={`fixed bottom-40 right-6 z-[9989] w-12 h-12 flex items-center justify-center transition-all duration-500 group ${isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-20 opacity-0 pointer-events-none'
          }`}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
      >
        {/* SVG progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="rgba(255,255,255,0.95)"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#bttProgressGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
          <defs>
            <linearGradient id="bttProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Arrow icon */}
        <i className='bx bx-chevron-up text-xl text-gray-600 group-hover:text-amber-600 transition-colors duration-200 relative z-10'></i>
      </button>
    </>,
    document.body
  );
};

export default BackToTop;
