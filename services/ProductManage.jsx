"use client";

import axiosInstance from "./axiosConfig";
import { getTotalCount } from "@/lib/pagination";

class ProductManage {
    GetProduct() {
        return axiosInstance.get("/api/Products");

    }

    // Server-driven paginated + filtered fetch for the admin Products screen.
    // Uses the AdvancedSearch endpoint (/api/Products/search) which already accepts
    // page/pageSize plus keyword/categoryId/status filters, and already returns
    // totalCount in the response body (no need to rely solely on X-Total-Count here).
    async SearchProducts({ page = 1, pageSize = 20, keyword, categoryId, status, sortBy = 'name', sortOrder = 'asc' } = {}) {
        const response = await axiosInstance.get('/api/Products/search', {
            params: { keyword, categoryId, status, page, pageSize, sortBy, sortOrder }
        });
        const result = response.data || {};
        const items = result.$values || result.products?.$values || result.products || [];
        const total = getTotalCount(response, items, result.totalCount);
        return { items, total };
    }

    GetProductById(id) {
        return axiosInstance.get(`/api/Products/${id}`);
    }

    GetProductBySlug(slug) {
        return axiosInstance.get(`/api/Products/slug/${slug}`);
    }

    GetVariantById(id) {
        return axiosInstance.get(`/api/Products/Variant/${id}`);
    }

    GetProductImageById(id) {
        return axiosInstance.get(`/api/Products/${id}/images`);
    }

    GetProductTypeByProductId(productId) {
        return axiosInstance.get(`/api/Products/VariantType/${productId}`);
    }

    GetProductValueByTypeId(typeId) {
        return axiosInstance.get(`/api/Products/VariantValue/${typeId}`);
    }

    UpdateProduct(productData) {
        return axiosInstance.put(`/api/Products/${productData.id}`, productData);
    }

    async CreateProduct(productData) {
        try {
            const reponse = await axiosInstance.post("/api/Products", productData);
            return reponse.data;
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data || error.message
            }
        }
    }

    UploadImageProduct(productId, formData) {
        return axiosInstance.post(`/api/Products/${productId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log('Upload progress:', percentCompleted);
            }
        });
    }

    UploadVideoProduct(productId, formData, config = {}) {
        return axiosInstance.post(`/api/Products/${productId}/video`, formData, {
            ...config,
            headers: {
                ...config.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    DeleteProductVideo(productId) {
        return axiosInstance.delete(`/api/Products/${productId}/video`);
    }

    DeleteProductImage(imageId) {
        return axiosInstance.delete(`/api/Products/image/${imageId}`);
    }

    DeleteProduct(id) {
        return axiosInstance.delete(`/api/Products/${id}`);
    }

    ImportProducts(products) {
        return axiosInstance.post('/api/Products/import', products);
    }

    BulkDeleteProducts(ids) {
        return axiosInstance.delete('/api/Products/bulk', {
            data: ids
        });
    }
}

export default new ProductManage
