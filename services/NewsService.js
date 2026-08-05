"use client";

import axiosInstance from '@/lib/axiosConfig';
import { getTotalCount } from '@/lib/pagination';

class NewsService {
    async getAllNews(activeOnly = false) {
        return await axiosInstance.get(`/api/news?activeOnly=${activeOnly}`);
    }

    // Server-driven paginated fetch for the admin News screen (public pages keep using
    // getAllNews() above, which still returns the full list — only the admin screen
    // needs pagination). `activeOnly` is preserved per the existing contract; `search`
    // is forwarded defensively — the backend doesn't yet accept a search/keyword param
    // on GET /api/news, only page/pageSize (+ X-Total-Count header) are being added.
    async getAllNewsPaged(page = 1, pageSize = 10, activeOnly = false, search = '') {
        const response = await axiosInstance.get('/api/news', {
            params: { activeOnly, page, pageSize, search: search || undefined }
        });
        const items = response.data?.$values || response.data || [];
        const total = getTotalCount(response, items);
        return { items, total };
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
