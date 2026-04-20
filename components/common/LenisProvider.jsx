"use client";

import { useEffect, useRef } from 'react';

/**
 * LenisProvider — smooth scroll with momentum effect.
 * Uses dynamic import to avoid SSR issues.
 */
const LenisProvider = ({ children }) =>
{
    const lenisRef = useRef(null);

    useEffect(() =>
    {
        let cancelled = false;
        let rafId = null;

        const init = async () =>
        {
            try
            {
                const { default: Lenis } = await import('lenis');

                if (cancelled) return;

                const lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    touchMultiplier: 2,
                });

                lenisRef.current = lenis;

                function raf(time)
                {
                    lenis.raf(time);
                    rafId = requestAnimationFrame(raf);
                }
                rafId = requestAnimationFrame(raf);
            } catch (e)
            {
                console.warn('Lenis smooth scroll not available:', e.message);
            }
        };

        init();

        return () =>
        {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (lenisRef.current)
            {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
        };
    }, []);

    return <>{children}</>;
};

export default LenisProvider;
