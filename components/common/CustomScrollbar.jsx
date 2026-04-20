"use client";

import { useEffect, useRef } from 'react';

const CustomScrollbar = ({ children }) =>
{
    const scrollbarRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() =>
    {
        if (!scrollbarRef.current) return;

        let cancelled = false;

        const initScrollbar = async () =>
        {
            try
            {
                const Scrollbar = (await import('smooth-scrollbar')).default;
                const OverscrollPlugin = (await import('smooth-scrollbar/plugins/overscroll')).default;

                if (cancelled || !scrollbarRef.current) return;

                Scrollbar.use(OverscrollPlugin);

                // Apply scroll container styles only AFTER library is ready
                scrollbarRef.current.style.height = '100vh';
                scrollbarRef.current.style.overflow = 'hidden';

                instanceRef.current = Scrollbar.init(scrollbarRef.current, {
                    damping: 0.05,
                    delegateTo: document.body,
                    plugins: {
                        overscroll: {
                            effect: 'bounce',
                            damping: 0.1,
                            maxOverscroll: 150,
                        },
                    },
                });

                // Dispatch custom scroll events
                instanceRef.current.addListener((status) =>
                {
                    window.dispatchEvent(new CustomEvent('smoothscroll', {
                        detail: { offset: status.offset, limit: status.limit },
                    }));
                });
            } catch (e)
            {
                console.error('Failed to init smooth-scrollbar:', e);
            }
        };

        initScrollbar();

        return () =>
        {
            cancelled = true;
            if (instanceRef.current)
            {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
            // Restore normal scroll if destroyed
            if (scrollbarRef.current)
            {
                scrollbarRef.current.style.height = '';
                scrollbarRef.current.style.overflow = '';
            }
        };
    }, []);

    // Always render children immediately — scrollbar applies later via useEffect
    return (
        <div ref={scrollbarRef}>
            {children}
        </div>
    );
};

export default CustomScrollbar;
