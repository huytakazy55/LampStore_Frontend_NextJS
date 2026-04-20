"use client";

import axiosInstance from "./axiosConfig";

class CartService
{
    /**
     * Lấy giỏ hàng của user đang đăng nhập
     */
    async getMyCart()
    {
        const response = await axiosInstance.get("/api/Carts/my");
        return response.data;
    }

    /**
     * Sync giỏ hàng từ localStorage lên backend
     * @param {Array} items - Danh sách items từ localStorage
     */
    async syncCart(items)
    {
        const syncItems = items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedOptions: JSON.stringify(item.selectedOptions || {})
        }));
        const response = await axiosInstance.post("/api/Carts/sync", syncItems);
        return response.data;
    }

    /**
     * Xóa 1 item khỏi giỏ hàng backend
     * @param {string} itemId - Backend CartItem ID (Guid)
     */
    async removeItem(itemId)
    {
        const response = await axiosInstance.delete(`/api/Carts/my/items/${itemId}`);
        return response.data;
    }

    /**
     * Cập nhật số lượng 1 item trong giỏ hàng backend
     * @param {string} itemId - Backend CartItem ID (Guid)
     * @param {number} quantity - Số lượng mới
     */
    async updateItemQuantity(itemId, quantity)
    {
        const response = await axiosInstance.put(`/api/Carts/my/items/${itemId}`, { quantity });
        return response.data;
    }

    /**
     * Xóa tất cả giỏ hàng của user
     */
    async clearMyCart()
    {
        const response = await axiosInstance.delete("/api/Carts/my");
        return response.data;
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new CartService();
