"use client";

import axiosInstance from '@/lib/axiosConfig';
import axios from 'axios';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || (typeof window !== 'undefined' ? window.location.origin : '');

const OrderService = {
    // Get all orders (admin) — real server-side pagination.
    // The backend enforces a max pageSize=100 (see OrdersController.GetOrders) and now
    // also returns an X-Total-Count header with the total matching record count.
    // Filtering the main Orders table remains client-side; delivery filtering is
    // handled by the dedicated /api/Deliveries endpoint.
    getAllOrders: async (page = 1, pageSize = 20) =>
    {
        const response = await axiosInstance.get('/api/Orders', { params: { page, pageSize } });
        const items = response.data?.$values || response.data || [];
        const totalHeader = response.headers['x-total-count'];
        // TODO: remove this fallback once backend confirms X-Total-Count is present on /api/Orders
        const total = totalHeader !== undefined ? Number(totalHeader) : items.length;
        return { items, total };
    },

    getOrderStats: async () =>
    {
        const response = await axiosInstance.get('/api/Orders/stats');
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id) =>
    {
        const response = await axiosInstance.get(`/api/Orders/${id}`);
        return response.data;
    },

    // Create a new order (checkout — logged in user)
    createOrder: async (orderData) =>
    {
        const response = await axiosInstance.post('/api/Orders', orderData);
        return response.data;
    },

    // Create a guest order (checkout — no auth required)
    createGuestOrder: async (orderData) =>
    {
        const response = await axiosInstance.post('/api/Orders/guest', orderData);
        return response.data;
    },

    // Get guest orders by guest token
    getGuestOrders: async (guestToken) =>
    {
        const response = await axiosInstance.get(`/api/Orders/guest/${guestToken}`);
        return response.data;
    },

    // Update order status (admin)
    updateOrderStatus: async (id, status) =>
    {
        const response = await axiosInstance.patch(`/api/Orders/${id}/status`, { status });
        return response.data;
    },

    // Update payment status (admin)
    updatePaymentStatus: async (id, status) =>
    {
        const response = await axiosInstance.patch(`/api/Orders/${id}/payment-status`, { status });
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
