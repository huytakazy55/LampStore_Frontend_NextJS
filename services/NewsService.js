"use client";

import axiosInstance from '@/lib/axiosConfig';

class NewsService {
    async getAllNews(activeOnly = false) {
        return await axiosInstance.get(`/api/news?activeOnly=${activeOnly}`);
    }

    async getNewsById(id) {
        return await axiosInstance.get(`/api/news/${id}`);
    }

    async getNewsBySlug(slug) {
        return await axiosInstance.get(`/api/news/slug/${slug}`);
    }

    async createNews(data) {
        return await axiosInstance.post('/api/news', data);
    }

    async updateNews(id, data) {
        return await axiosInstance.put(`/api/news/${id}`, data);
    }

    async deleteNews(id) {
        return await axiosInstance.delete(`/api/news/${id}`);
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosInstance.post('/api/news/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

const instance = new NewsService();
export default instance;
