"use client";

import axiosInstance from '@/lib/axiosConfig';

const WishlistService = {
    // Lấy danh sách yêu thích (kèm thông tin sản phẩm)
    getWishlist: () => {
        return axiosInstance.get('/api/Wishlists');
    },

    // Lấy danh sách productId đã yêu thích (load nhanh)
    getWishlistIds: () => {
        return axiosInstance.get('/api/Wishlists/ids');
    },

    // Thêm sản phẩm vào yêu thích
    addToWishlist: (productId) => {
        return axiosInstance.post(`/api/Wishlists/${productId}`);
    },

    // Xóa sản phẩm khỏi yêu thích
    removeFromWishlist: (productId) => {
        return axiosInstance.delete(`/api/Wishlists/${productId}`);
    },

    // Kiểm tra sản phẩm có trong yêu thích
    checkInWishlist: (productId) => {
        return axiosInstance.get(`/api/Wishlists/check/${productId}`);
    }
};

export default WishlistService;
