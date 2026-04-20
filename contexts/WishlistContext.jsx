"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import WishlistService from '@/services/WishlistService';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const fetchWishlistIds = useCallback(async () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('token');
        if (!token) {
            setWishlistIds(new Set());
            return;
        }

        try {
            setLoading(true);
            const response = await WishlistService.getWishlistIds();
            const ids = response.data?.$values || response.data || [];
            setWishlistIds(new Set(ids));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlistIds();

        const handleLoginChange = () => fetchWishlistIds();
        window.addEventListener('userLoginStatusChanged', handleLoginChange);
        window.addEventListener('storage', handleLoginChange);

        return () => {
            window.removeEventListener('userLoginStatusChanged', handleLoginChange);
            window.removeEventListener('storage', handleLoginChange);
        };
    }, [fetchWishlistIds]);

    const toggleWishlist = useCallback(async (productId) => {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('token');
        if (!token) {
            toast.info('Vui lòng đăng nhập để sử dụng chức năng yêu thích!');
            return false;
        }

        try {
            if (wishlistIds.has(productId)) {
                await WishlistService.removeFromWishlist(productId);
                setWishlistIds(prev => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
                toast.success('Đã xóa khỏi danh sách yêu thích');
                return false;
            } else {
                await WishlistService.addToWishlist(productId);
                setWishlistIds(prev => {
                    const next = new Set(prev);
                    next.add(productId);
                    return next;
                });
                toast.success('Đã thêm vào danh sách yêu thích ❤');
                return true;
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
            return null;
        }
    }, [wishlistIds]);

    const isInWishlist = useCallback((productId) => {
        return wishlistIds.has(productId);
    }, [wishlistIds]);

    const wishlistCount = wishlistIds.size;

    return (
        <WishlistContext.Provider value={{
            wishlistIds,
            wishlistCount,
            toggleWishlist,
            isInWishlist,
            fetchWishlistIds,
            loading
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};

export default WishlistContext;
