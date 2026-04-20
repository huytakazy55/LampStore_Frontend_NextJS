"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CategoryManage from '@/services/CategoryManage';

// Query Keys cho categories
export const CATEGORY_QUERY_KEYS = {
  all: ['categories'],
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'],
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...CATEGORY_QUERY_KEYS.details(), id],
};

// Hook để lấy tất cả categories
export const useCategories = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await CategoryManage.GetCategory();
      return response.data.$values || response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 phút - categories ít thay đổi
    cacheTime: 20 * 60 * 1000, // 20 phút
  });
};

// Hook để lấy category theo ID
export const useCategory = (id) => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await CategoryManage.GetCategoryById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 phút
    cacheTime: 25 * 60 * 1000, // 25 phút
  });
};

// Hook để tạo category mới
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData) => CategoryManage.CreateCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
};

// Hook để cập nhật category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => CategoryManage.UpdateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
};

// Hook để xóa category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => CategoryManage.DeleteCategory(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: CATEGORY_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
};
