"use client";

import axiosInstance from '@/lib/axiosConfig';
import axios from 'axios';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || (typeof window !== 'undefined' ? window.location.origin : '');

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
