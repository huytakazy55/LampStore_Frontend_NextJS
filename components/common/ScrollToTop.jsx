"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop — scrolls window to top on every route change.
 * Works with both native scroll and Lenis smooth scroll.
 */
const ScrollToTop = () => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Immediate native scroll
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        // Also reset Lenis if active (it manages its own scroll position)
        try {
            const lenisInstance = document.querySelector('[data-lenis-prevent]')
                ?.__lenis || window.__lenis;
            if (lenisInstance) {
                lenisInstance.scrollTo(0, { immediate: true });
            }
        } catch (e) {
            // Lenis not available, native scroll already handled
        }
    }, [pathname]);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 150) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        try {
            const lenisInstance = window.__lenis;
            if (lenisInstance) {
                lenisInstance.scrollTo(0, { duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            }
        } catch (e) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-10 h-10 rounded-full bg-orange-400/30 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-orange-500/90 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
            } ${pathname !== '/' ? 'hidden sm:flex' : 'flex'}`}
            aria-label="Cuộn lên đầu trang"
        >
            <i className='bx bx-up-arrow-alt text-2xl leading-none'></i>
        </button>
    );
};

export default ScrollToTop;
