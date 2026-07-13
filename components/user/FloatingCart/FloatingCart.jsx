"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from '@/lib/router-compat';

const formatPrice = (price) =>
{
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const FloatingCart = () =>
{
    const { cartCount, cartTotal, cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [bounce, setBounce] = useState(false);
    const cartBtnRef = useRef(null);
    const expandedRef = useRef(null);
    const prevCountRef = useRef(cartCount);

    // Show floating cart when user scrolls down past the header area
    // Supports both smooth-scrollbar (homepage) and native scroll (other pages)
    useEffect(() =>
    {
        let scrollbarInstance = null;
        let cleanupSmoothScroll = null;

        const checkVisibility = (scrollY) =>
        {
            setIsVisible(scrollY > 200);
        };

        // Try to find smooth-scrollbar instance (used on homepage)
        const tryAttachSmoothScrollbar = () =>
        {
            try
            {
                const Scrollbar = require('smooth-scrollbar').default;
                const instances = Scrollbar.getAll();
                if (instances.length > 0)
                {
                    scrollbarInstance = instances[0];
                    const listener = (status) =>
                    {
                        checkVisibility(status.offset.y);
                    };
                    scrollbarInstance.addListener(listener);
                    // Check current position
                    checkVisibility(scrollbarInstance.offset.y);
                    cleanupSmoothScroll = () => scrollbarInstance.removeListener(listener);
                    return true;
                }
            } catch (e) { /* smooth-scrollbar not available */ }
            return false;
        };

        // Native window scroll handler
        const handleWindowScroll = () =>
        {
            checkVisibility(window.scrollY);
        };

        // Try smooth-scrollbar first, fall back to window scroll
        const hasSmoothScroll = tryAttachSmoothScrollbar();
        if (!hasSmoothScroll)
        {
            window.addEventListener('scroll', handleWindowScroll, { passive: true });
            handleWindowScroll();
        }

        // Re-check periodically in case smooth-scrollbar initializes later
        const retryTimer = !hasSmoothScroll ? setTimeout(() =>
        {
            if (tryAttachSmoothScrollbar())
            {
                window.removeEventListener('scroll', handleWindowScroll);
            }
        }, 2000) : null;

        return () =>
        {
            if (cleanupSmoothScroll) cleanupSmoothScroll();
            window.removeEventListener('scroll', handleWindowScroll);
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, []);

    // Bounce animation when cart count changes
    useEffect(() =>
    {
        if (cartCount > prevCountRef.current && isVisible)
        {
            setBounce(true);
            const timer = setTimeout(() => setBounce(false), 600);
            return () => clearTimeout(timer);
        }
        prevCountRef.current = cartCount;
    }, [cartCount, isVisible]);

    // Close expanded panel when clicking outside
    useEffect(() =>
    {
        const handleClickOutside = (e) =>
        {
            if (isExpanded &&
                expandedRef.current && !expandedRef.current.contains(e.target) &&
                cartBtnRef.current && !cartBtnRef.current.contains(e.target))
            {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    const handleCartClick = useCallback(() =>
    {
        if (cartItems.length > 0)
        {
            setIsExpanded(!isExpanded);
        } else
        {
            setIsExpanded(false);
        }
    }, [cartItems.length, isExpanded]);

    const handleCheckout = useCallback(() =>
    {
        setIsExpanded(false);
        navigate('/checkout');
    }, [navigate]);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Floating Cart Button */}
            <div
                className={`fixed right-6 z-[9990] transition-all duration-500 ${isVisible
                    ? 'translate-y-0 opacity-100 pointer-events-auto'
                    : 'translate-y-20 opacity-0 pointer-events-none'
                    }`}
                style={{ bottom: '216px' }}
            >
                {/* Expanded mini cart panel */}
                <div
                    ref={expandedRef}
                    onWheel={(e) => e.stopPropagation()}
                    className={`absolute bottom-[72px] right-0 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 origin-bottom-right ${isExpanded && cartItems.length > 0
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
                        }`}
                >
                    {/* Header */}
                    <div className="bg-primary-600 px-4 py-3 flex justify-between items-center">
                        <span className="text-white text-sm font-semibold flex items-center gap-2">
                            <i className="bx bx-shopping-bag text-lg"></i>
                            Giỏ hàng ({cartCount})
                        </span>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Đóng giỏ hàng"
                        >
                            <i className="bx bx-x text-xl"></i>
                        </button>
                    </div>

                    {/* Items list */}
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {cartItems.slice(0, 5).map((item) => (
                            <div key={item.key} className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group/item">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{item.name}</p>
                                    {Object.keys(item.selectedOptions || {}).length > 0 && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                            {Object.values(item.selectedOptions).map(opt => opt.value).join(', ')}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        x{item.quantity} · <span className="text-primary-600 font-medium">{formatPrice(item.finalPrice)}₫</span>
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFromCart(item.key); }}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all opacity-0 group-hover/item:opacity-100 cursor-pointer"
                                    title="Xóa"
                                >
                                    <i className="bx bx-x text-lg"></i>
                                </button>
                            </div>
                        ))}
                        {cartItems.length > 5 && (
                            <div className="px-4 py-2 text-center text-xs text-gray-400">
                                +{cartItems.length - 5} sản phẩm khác
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Tổng cộng:</span>
                            <span className="text-base font-bold text-primary-600">{formatPrice(cartTotal)}₫</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
                        >
                            Thanh toán ngay
                        </button>
                    </div>
                </div>

                {/* Main floating button */}
                <button
                    ref={cartBtnRef}
                    onClick={handleCartClick}
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_8px_20px_rgba(107,33,168,0.3)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-[0_12px_25px_rgba(107,33,168,0.5)] active:scale-95 cursor-pointer group ${bounce ? 'animate-bounce' : ''}`}
                    aria-label="Giỏ hàng"
                    id="floating-cart-btn"
                >
                    <i className="bx bx-shopping-bag text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"></i>

                    {/* Badge */}
                    {cartCount > 0 && (
                        <div className={`absolute -top-1.5 -right-1.5 min-w-[24px] h-[24px] px-1.5 rounded-full bg-[#FF4B4B] text-white text-[11px] font-extrabold flex items-center justify-center shadow-md transition-transform border-2 border-white dark:border-gray-900 ${bounce ? 'scale-125' : 'scale-100'}`}>
                            {cartCount > 99 ? '99+' : cartCount}
                        </div>
                    )}

                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>

                    {/* Tooltip */}
                    <span className="pointer-events-none absolute right-[120%] top-1/2 -translate-y-1/2 translate-x-4 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 text-[14px] font-bold text-primary-600 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-primary-400 border border-white/20">
                        Giỏ hàng
                    </span>
                </button>
            </div>
        </>
    );
};

export default FloatingCart;
