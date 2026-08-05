"use client";

import axiosInstance from "./axiosConfig";
import { getTotalCount } from "@/lib/pagination";
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

class CategoryManage {
    GetCategory() {
        return axiosInstance.get("/api/Categories");

    }

    // Server-driven pagination and search for the admin Category screen.
    async GetCategoriesPaged(page = 1, pageSize = 20, search = '') {
        const response = await axiosInstance.get('/api/Categories', {
            params: { page, pageSize, search: search || undefined }
        });
        const items = response.data?.$values || response.data || [];
        const total = getTotalCount(response, items);
        return { items, total };
    }

    GetCategoryById(id) {
        return axiosInstance.get(`/api/Categories/${id}`);
    }

    GetCategoryBySlug(slug) {
        return axiosInstance.get(`/api/Categories/slug/${slug}`);
    }

    UpdateCategory(id, name, description, imageUrl, isDisplayed = true) {
        return axiosInstance.put(`/api/Categories/${id}`, {
            id: id,
            name: name,
            description: description,
            imageUrl: imageUrl,
            isDisplayed: isDisplayed
        });
    }

    CreateCategory(name, description, imageUrl, isDisplayed = true) {
        return axiosInstance.post("/api/Categories", {
            name: name,
            description: description,
            imageUrl: imageUrl,
            isDisplayed: isDisplayed
        });
    }

    DeleteCategory(id) {
        return axiosInstance.delete(`/api/Categories/${id}`);
    }

    BulkDeleteCategories(ids) {
        return axiosInstance.delete("/api/categories/bulk", {
            data: ids
        });
    }

    UploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        return axiosInstance.post("/api/Categories/upload", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}

export default new CategoryManage
