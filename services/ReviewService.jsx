"use client";

import axiosInstance from '@/lib/axiosConfig';

const ReviewService = {
    // Lấy đánh giá theo sản phẩm (public, không cần auth)
    getProductReviews: (productId) =>
    {
        return axiosInstance.get(`/api/ProductReviews/${productId}`);
    },

    // Gửi đánh giá (cần đăng nhập)
    submitReview: (data) =>
    {
        return axiosInstance.post('/api/ProductReviews', data);
    },

    // Kiểm tra trạng thái: đã mua? đã đánh giá?
    getReviewStatus: (productId) =>
    {
        return axiosInstance.get(`/api/ProductReviews/status/${productId}`);
    }
};

export default ReviewService;
