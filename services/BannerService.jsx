"use client";

import axiosInstance from '@/lib/axiosConfig';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class BannerService {
    // Lấy tất cả banner
    async getAllBanners() {
        try {
            const response = await axiosInstance.get("/api/Banners");
            return response.data.$values || response.data || [];
        } catch (error) {
            console.error('Error fetching banners:', error);
            throw error;
        }
    }

    // Lấy banner đang hoạt động
    async getActiveBanners() {
        try {
            const response = await axiosInstance.get("/api/Banners/active");
            return response.data.$values || response.data || [];
        } catch (error) {
            console.error('Error fetching active banners:', error);
            throw error;
        }
    }

    // Lấy banner theo ID
    async getBannerById(id) {
        try {
            const response = await axiosInstance.get(`/api/Banners/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching banner:', error);
            throw error;
        }
    }

    // Tạo banner mới
    async createBanner(bannerData) {
        try {
            const response = await axiosInstance.post("/api/Banners", bannerData);
            return response.data;
        } catch (error) {
            console.error('Error creating banner:', error);
            throw error;
        }
    }

    // Cập nhật banner
    async updateBanner(id, bannerData) {
        try {
            const response = await axiosInstance.put(`/api/Banners/${id}`, bannerData);
            return response.data;
        } catch (error) {
            console.error('Error updating banner:', error);
            throw error;
        }
    }

    // Xóa banner
    async deleteBanner(id) {
        try {
            const response = await axiosInstance.delete(`/api/Banners/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting banner:', error);
            throw error;
        }
    }

    // Upload ảnh banner
    async uploadBannerImage(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post("/api/Banners/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading banner image:', error);
            throw error;
        }
    }
}

export default new BannerService(); 