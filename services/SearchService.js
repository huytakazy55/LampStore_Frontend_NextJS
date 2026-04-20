"use client";

import axiosInstance from '@/lib/axiosConfig';

class SearchService
{
    // Tìm kiếm nhanh (chỉ theo từ khóa)
    async quickSearch(keyword, page = 1, pageSize = 20)
    {
        try
        {
            const response = await axiosInstance.get(`/api/Products/search`, {
                params: {
                    keyword,
                    page,
                    pageSize,
                    sortBy: 'name',
                    sortOrder: 'asc'
                }
            });
            return response.data;
        } catch (error)
        {
            console.error('Quick search error:', error);
            throw error;
        }
    }

    // Tìm kiếm nâng cao (với tất cả tiêu chí)
    async advancedSearch(searchCriteria)
    {
        try
        {
            const response = await axiosInstance.get(`/api/Products/search`, {
                params: searchCriteria
            });
            return response.data;
        } catch (error)
        {
            console.error('Advanced search error:', error);
            throw error;
        }
    }

    // Tìm kiếm theo danh mục
    async searchByCategory(categoryId, page = 1, pageSize = 20)
    {
        try
        {
            const response = await axiosInstance.get(`/api/Products/search`, {
                params: {
                    categoryId,
                    page,
                    pageSize,
                    sortBy: 'name',
                    sortOrder: 'asc'
                }
            });
            return response.data;
        } catch (error)
        {
            console.error('Category search error:', error);
            throw error;
        }
    }

    // Tìm kiếm theo giá
    async searchByPrice(minPrice, maxPrice, page = 1, pageSize = 20)
    {
        try
        {
            const response = await axiosInstance.get(`/api/Products/search`, {
                params: {
                    minPrice,
                    maxPrice,
                    page,
                    pageSize,
                    sortBy: 'price',
                    sortOrder: 'asc'
                }
            });
            return response.data;
        } catch (error)
        {
            console.error('Price search error:', error);
            throw error;
        }
    }

    // Tìm kiếm theo tags
    async searchByTags(tags, page = 1, pageSize = 20)
    {
        try
        {
            const response = await axiosInstance.get(`/api/Products/search`, {
                params: {
                    tags,
                    page,
                    pageSize,
                    sortBy: 'name',
                    sortOrder: 'asc'
                }
            });
            return response.data;
        } catch (error)
        {
            console.error('Tags search error:', error);
            throw error;
        }
    }
}

export default new SearchService();
