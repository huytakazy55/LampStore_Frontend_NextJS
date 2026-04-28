"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * ScrollTimeline — Vertical timeline indicator
 * Uses direct DOM manipulation (refs) for instant, lag-free updates
 * Works with smooth-scrollbar
 */

const SECTION_ICONS = {
    'hero': 'bx-home',
    'categories': 'bx-category',
    'products': 'bx-package',
    'trending': 'bx-trending-up',
    'allproducts': 'bx-crown',
    'news': 'bx-news',
    'footer': 'bx-info-circle',
};

const SECTION_LABELS = {
    'hero': 'Trang chủ',
    'categories': 'Danh mục',
    'products': 'Sản phẩm',
    'trending': 'Xu hướng',
    'allproducts': 'Tất cả SP',
    'news': 'Tin tức',
    'footer': 'Cuối trang',
};

const TIMELINE_TOP = 12.5; // vh
const TIMELINE_BOTTOM = 87.5; // vh
const TIMELINE_RANGE = TIMELINE_BOTTOM - TIMELINE_TOP; // 75vh

const ScrollTimeline = () => {
    const progressLineRef = useRef(null);
    const dotRefs = useRef({});
    const containerRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const sectionIds = Object.keys(SECTION_ICONS);

    // Get smooth-scrollbar instance
    const getScrollbarInstance = useCallback(() => {
        try {
            const Scrollbar = require('smooth-scrollbar').default;
            const instances = Scrollbar.getAll();
            return instances.length > 0 ? instances[0] : null;
        } catch (e) {
            return null;
        }
    }, []);

    // Direct DOM update — no React state, no re-render, instant
    const updateTimeline = useCallback((scrollY, limit, viewportH) => {
        const contentH = limit + viewportH;
        const progress = limit > 0 ? Math.min(scrollY / limit, 1) : 0;

        // Update progress line immediately via DOM
        if (progressLineRef.current) {
            progressLineRef.current.style.clipPath = `inset(0 0 ${100 - progress * 100}% 0)`;
        }

        // Update dots based on progress line position (not viewport)
        const count = sectionIds.length;
        sectionIds.forEach((sectionId, idx) => {
            const dotEl = dotRefs.current[sectionId];
            if (!dotEl) return;

            // Dot position as 0-1 fraction of the timeline
            const dotProgress = count > 1 ? idx / (count - 1) : 0;
            // Line has reached this dot
            const isReached = progress >= dotProgress - 0.01;
            // Currently at this dot (between this and next)
            const nextDotProgress = idx < count - 1 ? (idx + 1) / (count - 1) : 1;
            const isActive = progress >= dotProgress - 0.01 && progress < nextDotProgress - 0.01;
            // Last dot active when at the end
            const isLastActive = idx === count - 1 && progress >= 0.98;

            const dot = dotEl.querySelector('.timeline-dot');
            const icon = dotEl.querySelector('.timeline-icon');
            const label = dotEl.querySelector('.timeline-label');
            const pulse = dotEl.querySelector('.timeline-pulse');

            if (dot) {
                if (isActive || isLastActive) {
                    dot.className = 'timeline-dot w-7 h-7 rounded-full flex items-center justify-center border-2 bg-amber-500 border-amber-400 scale-110 shadow-lg shadow-amber-300/50';
                } else if (isReached) {
                    dot.className = 'timeline-dot w-7 h-7 rounded-full flex items-center justify-center border-2 bg-amber-500 border-amber-400';
                } else {
                    dot.className = 'timeline-dot w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white border-gray-300';
                }
            }
            if (icon) {
                icon.style.color = isReached ? 'white' : '#9ca3af';
            }
            if (label) {
                // Only show on hover (handled by CSS group-hover)
                label.style.opacity = '';
            }
            if (pulse) {
                pulse.style.display = (isActive || isLastActive) ? 'block' : 'none';
            }
        });
    }, [sectionIds]);

    useEffect(() => {
        let cleanupSmoothScroll = null;

        const tryAttach = () => {
            const sb = getScrollbarInstance();
            if (sb) {
                const listener = (status) => {
                    updateTimeline(status.offset.y, status.limit.y, sb.size.container.height);
                };
                sb.addListener(listener);
                updateTimeline(sb.offset.y, sb.limit.y, sb.size.container.height);
                cleanupSmoothScroll = () => sb.removeListener(listener);
                return true;
            }
            return false;
        };

        const handleNativeScroll = () => {
            const scrollY = window.pageYOffset || 0;
            const viewportH = window.innerHeight;
            const contentH = document.documentElement.scrollHeight;
            const limit = contentH - viewportH;
            updateTimeline(scrollY, limit, viewportH);
        };

        const hasSB = tryAttach();
        if (!hasSB) {
            window.addEventListener('scroll', handleNativeScroll, { passive: true });
            handleNativeScroll();
        }

        const retryTimer = !hasSB ? setTimeout(() => {
            if (tryAttach()) {
                window.removeEventListener('scroll', handleNativeScroll);
            }
        }, 1500) : null;

        return () => {
            if (cleanupSmoothScroll) cleanupSmoothScroll();
            window.removeEventListener('scroll', handleNativeScroll);
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [getScrollbarInstance, updateTimeline]);

    // Click to scroll to section
    const scrollToSection = useCallback((sectionId) => {
        const el = document.querySelector(`[data-section="${sectionId}"]`);
        if (!el) return;

        const sb = getScrollbarInstance();
        if (sb) {
            const rect = el.getBoundingClientRect();
            const targetY = sb.offset.y + rect.top - 80;
            sb.scrollTo(0, targetY, 600);
        } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [getScrollbarInstance]);

    // Calculate dot positions based on equal spacing
    const getDotTop = (idx) => {
        const count = sectionIds.length;
        if (count <= 1) return TIMELINE_TOP;
        return TIMELINE_TOP + (idx / (count - 1)) * TIMELINE_RANGE;
    };

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return createPortal(
        <div
            ref={containerRef}
            className="fixed top-20 z-[55] pointer-events-none hidden xl:block"
            style={{
                left: 'max(16px, calc((100vw - 1440px) / 2 - 100px))',
                height: '100vh',
                width: '40px',
            }}
        >
            {/* Track line background */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-gray-200/60 rounded-full"
                style={{
                    top: `${TIMELINE_TOP}vh`,
                    height: `${TIMELINE_RANGE}vh`,
                }}
            />

            {/* Progress line - filled (updated via ref, no transition) */}
            <div
                ref={progressLineRef}
                className="absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full"
                style={{
                    top: `${TIMELINE_TOP}vh`,
                    height: `${TIMELINE_RANGE}vh`,
                    background: 'linear-gradient(to bottom, #f59e0b, #d97706)',
                    clipPath: 'inset(0 0 100% 0)',
                    boxShadow: '0 0 6px rgba(245, 158, 11, 0.4)',
                }}
            />

            {/* Section dots */}
            {sectionIds.map((id, idx) => {
                const dotTop = getDotTop(idx);
                const icon = SECTION_ICONS[id];
                const label = SECTION_LABELS[id];

                return (
                    <div
                        key={id}
                        ref={(el) => { dotRefs.current[id] = el; }}
                        className="absolute left-1/2 pointer-events-auto cursor-pointer group"
                        style={{ top: `${dotTop}vh`, transform: 'translate(-50%, -50%)' }}
                        onClick={() => scrollToSection(id)}
                    >
                        {/* Dot */}
                        <div className="timeline-dot w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white border-gray-300">
                            <i className={`timeline-icon bx ${icon} text-[10px]`} style={{ color: '#9ca3af' }}></i>
                        </div>

                        {/* Tooltip label */}
                        <div
                            className="timeline-label absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] font-medium px-2.5 py-1 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none"
                            style={{ transition: 'opacity 0.15s' }}
                        >
                            {label}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-r-[4px] border-t-transparent border-b-transparent border-r-gray-900" />
                        </div>

                        {/* Active pulse */}
                        <div className="timeline-pulse absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20" style={{ display: 'none' }} />
                    </div>
                );
            })}
        </div>,
        document.body
    );
};

export default ScrollTimeline;
