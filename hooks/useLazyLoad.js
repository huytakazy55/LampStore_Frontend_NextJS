"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook để lazy load component khi scroll đến viewport.
 * Sử dụng IntersectionObserver API.
 * 
 * @param {Object} options
 * @param {string} options.rootMargin - Khoảng cách trước viewport để bắt đầu load (mặc định '200px' - preload trước 200px)
 * @param {number} options.threshold - Phần trăm element visible để trigger (0-1)
 * @param {Element|null} options.root - Custom scroll container (null = viewport mặc định)
 * @returns {{ ref: React.RefObject, isVisible: boolean, hasBeenVisible: boolean }}
 */
const useLazyLoad = (options = {}) => {
  const {
    rootMargin = '200px 0px',
    threshold = 0,
    root = null,
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const handleIntersection = useCallback(([entry]) => {
    setIsVisible(entry.isIntersecting);
    if (entry.isIntersecting) {
      setHasBeenVisible(true);
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Kiểm tra browser hỗ trợ IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, handleIntersection]);

  return { ref, isVisible, hasBeenVisible };
};

export default useLazyLoad;
