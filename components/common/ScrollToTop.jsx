"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop — scrolls window to top on every route change.
 * Works with both native scroll and Lenis smooth scroll.
 */
const ScrollToTop = () => {
    const pathname = usePathname();

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

    return null;
};

export default ScrollToTop;
