"use client";

export const lockBodyScroll = () => {
    if (typeof window === 'undefined') return;
    
    // Only lock scroll on mobile devices (width <= 768px)
    if (window.innerWidth > 768) return;

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    // Prevent layout shift from scrollbar
    document.body.style.overflowY = 'scroll';
    document.body.dataset.scrollY = scrollY;
};

export const unlockBodyScroll = () => {
    if (typeof window === 'undefined') return;
    
    // Only unlock if it was actually locked
    if (!document.body.hasAttribute('data-scroll-y')) return;

    const scrollY = document.body.dataset.scrollY;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflowY = '';
    document.body.removeAttribute('data-scroll-y');
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0'));
    }
};
