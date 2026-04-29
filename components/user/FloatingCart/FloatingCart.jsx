"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    const [flyingItems, setFlyingItems] = useState([]);
    const cartBtnRef = useRef(null);
    const expandedRef = useRef(null);
    const prevCountRef = useRef(cartCount);
    const flyIdRef = useRef(0);

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

    // Listen for fly-to-cart events
    useEffect(() =>
    {
        const handleFlyToCart = (e) =>
        {
            const { x, y, image } = e.detail;
            if (!cartBtnRef.current) return;

            const cartRect = cartBtnRef.current.getBoundingClientRect();
            const id = ++flyIdRef.current;

            setFlyingItems(prev => [...prev, {
                id,
                startX: x,
                startY: y,
                endX: cartRect.left + cartRect.width / 2,
                endY: cartRect.top + cartRect.height / 2,
                image
            }]);

            // Remove after animation completes
            setTimeout(() =>
            {
                setFlyingItems(prev => prev.filter(item => item.id !== id));
            }, 800);
        };

        window.addEventListener('flyToCart', handleFlyToCart);
        return () => window.removeEventListener('flyToCart', handleFlyToCart);
    }, []);

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
            {/* Flying items animation */}
            {flyingItems.map(item => (
                createPortal(
                    <div
                        key={item.id}
                        className="flying-cart-item"
                        style={{
                            '--start-x': `${item.startX}px`,
                            '--start-y': `${item.startY}px`,
                            '--end-x': `${item.endX}px`,
                            '--end-y': `${item.endY}px`,
                        }}
                    >
                        <img
                            src={item.image}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg shadow-lg border-2 border-white"
                        />
                    </div>,
                    document.body
                )
            ))}

            {/* Floating Cart Button */}
            <div
                className={`fixed bottom-24 right-6 z-[9990] transition-all duration-500 ${isVisible
                    ? 'translate-y-0 opacity-100 pointer-events-auto'
                    : 'translate-y-20 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Expanded mini cart panel */}
                <div
                    ref={expandedRef}
                    onWheel={(e) => e.stopPropagation()}
                    className={`absolute bottom-[72px] right-0 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 origin-bottom-right ${isExpanded && cartItems.length > 0
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
                        }`}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 flex justify-between items-center">
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
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        x{item.quantity} · <span className="text-rose-500 font-medium">{formatPrice(item.finalPrice)}₫</span>
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
                            <span className="text-base font-bold text-rose-600">{formatPrice(cartTotal)}₫</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-semibold hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98] cursor-pointer"
                        >
                            Thanh toán ngay
                        </button>
                    </div>
                </div>

                {/* Main floating button */}
                <button
                    ref={cartBtnRef}
                    onClick={handleCartClick}
                    className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center cursor-pointer hover:shadow-xl hover:shadow-rose-600/40 hover:scale-110 active:scale-95 transition-all duration-300 group ${bounce ? 'animate-cartBounce' : ''
                        }`}
                    aria-label="Giỏ hàng"
                    id="floating-cart-btn"
                >
                    <i className="bx bx-shopping-bag text-2xl transition-transform group-hover:rotate-[-8deg]"></i>

                    {/* Badge */}
                    {cartCount > 0 && (
                        <div className={`absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-400 text-gray-800 text-xs font-bold flex items-center justify-center shadow-md transition-transform ${bounce ? 'animate-badgePop' : ''
                            }`}>
                            {cartCount > 99 ? '99+' : cartCount}
                        </div>
                    )}

                    {/* Pulse ring */}
                    {cartCount > 0 && (
                        <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-20 pointer-events-none"></div>
                    )}
                </button>
            </div>
        </>
    );
};

export default FloatingCart;
