"use client";

import axiosInstance from '@/lib/axiosConfig';
import { getTotalCount } from '@/lib/pagination';

const DeliveryService = {
    getDeliveries: async (page = 1, pageSize = 10, search = '') =>
    {
        const response = await axiosInstance.get('/api/Deliveries', {
            params: { page, pageSize, search: search || undefined },
        });
        const items = response.data?.$values || response.data || [];
        return { items, total: getTotalCount(response, items) };
    },
};

export default DeliveryService;
