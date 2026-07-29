"use client";

import axiosInstance from '@/lib/axiosConfig';

const DeliveryService = {
    getDeliveries: async (page = 1, pageSize = 10, search = '') =>
    {
        const response = await axiosInstance.get('/api/Deliveries', {
            params: { page, pageSize, search: search || undefined },
        });
        const items = response.data?.$values || response.data || [];
        const totalHeader = response.headers['x-total-count'];
        return {
            items,
            total: totalHeader !== undefined ? Number(totalHeader) : items.length,
        };
    },
};

export default DeliveryService;
