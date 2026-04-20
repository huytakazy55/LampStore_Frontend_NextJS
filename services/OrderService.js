"use client";

import axiosInstance from '@/lib/axiosConfig';

const OrderService = {
    // Get all orders (admin)
    getAllOrders: async () =>
    {
        const response = await axiosInstance.get('/api/Orders');
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id) =>
    {
        const response = await axiosInstance.get(`/api/Orders/${id}`);
        return response.data;
    },

    // Create a new order (checkout)
    createOrder: async (orderData) =>
    {
        const response = await axiosInstance.post('/api/Orders', orderData);
        return response.data;
    },

    // Update order status (admin)
    updateOrderStatus: async (id, status) =>
    {
        const response = await axiosInstance.patch(`/api/Orders/${id}/status`, { status });
        return response.data;
    },

    // Delete order (admin)
    deleteOrder: async (id) =>
    {
        const response = await axiosInstance.delete(`/api/Orders/${id}`);
        return response.data;
    },

    // Get current user's orders
    getMyOrders: async () =>
    {
        const response = await axiosInstance.get('/api/Orders/my-orders');
        return response.data;
    },
};

export default OrderService;
