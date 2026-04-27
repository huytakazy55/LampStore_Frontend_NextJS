"use client";

import axiosInstance from '@/lib/axiosConfig';

class FlashSaleService
{
    // Lấy tất cả flash sales (admin)
    async getAllFlashSales()
    {
        try
        {
            const response = await axiosInstance.get("/api/FlashSales");
            return response.data.$values || response.data || [];
        } catch (error)
        {
            console.error('Error fetching flash sales:', error);
            throw error;
        }
    }

    // Lấy flash sale đang diễn ra (public)
    async getActiveFlashSale()
    {
        try
        {
            const response = await axiosInstance.get("/api/FlashSales/active");
            return response.data;
        } catch (error)
        {
            console.error('Error fetching active flash sale:', error);
            throw error;
        }
    }

    // Lấy flash sale theo ID
    async getFlashSaleById(id)
    {
        try
        {
            const response = await axiosInstance.get(`/api/FlashSales/${id}`);
            return response.data;
        } catch (error)
        {
            console.error('Error fetching flash sale:', error);
            throw error;
        }
    }

    // Tạo flash sale mới
    async createFlashSale(data)
    {
        try
        {
            const response = await axiosInstance.post("/api/FlashSales", data);
            return response.data;
        } catch (error)
        {
            console.error('Error creating flash sale:', error);
            throw error;
        }
    }

    // Cập nhật flash sale
    async updateFlashSale(id, data)
    {
        try
        {
            const response = await axiosInstance.put(`/api/FlashSales/${id}`, data);
            return response.data;
        } catch (error)
        {
            console.error('Error updating flash sale:', error);
            throw error;
        }
    }

    // Xóa flash sale
    async deleteFlashSale(id)
    {
        try
        {
            const response = await axiosInstance.delete(`/api/FlashSales/${id}`);
            return response.data;
        } catch (error)
        {
            console.error('Error deleting flash sale:', error);
            throw error;
        }
    }

    // Thêm sản phẩm vào flash sale
    async addItem(flashSaleId, itemData)
    {
        try
        {
            const response = await axiosInstance.post(`/api/FlashSales/${flashSaleId}/items`, itemData);
            return response.data;
        } catch (error)
        {
            console.error('Error adding flash sale item:', error);
            throw error;
        }
    }

    // Xóa sản phẩm khỏi flash sale
    async removeItem(flashSaleId, itemId)
    {
        try
        {
            const response = await axiosInstance.delete(`/api/FlashSales/${flashSaleId}/items/${itemId}`);
            return response.data;
        } catch (error)
        {
            console.error('Error removing flash sale item:', error);
            throw error;
        }
    }
}

export default new FlashSaleService();
