"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductManage from '@/services/ProductManage';

// Query Keys - constants để quản lý cache keys
export const PRODUCT_QUERY_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'],
  list: (filters) => [...PRODUCT_QUERY_KEYS.lists(), { filters }],
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...PRODUCT_QUERY_KEYS.details(), id],
  images: (id) => [...PRODUCT_QUERY_KEYS.all, 'images', id],
};

// Hook để lấy tất cả sản phẩm
export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await ProductManage.GetProduct();
      return response.data.$values || response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  });
};

// Hook để lấy sản phẩm theo ID
export const useProduct = (id) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await ProductManage.GetProductById(id);
      return response.data;
    },
    enabled: !!id, // Chỉ chạy khi có ID
    staleTime: 10 * 60 * 1000, // 10 phút cho detail
    cacheTime: 15 * 60 * 1000, // 15 phút
  });
};

// Hook để lấy ảnh sản phẩm
export const useProductImages = (productId) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.images(productId),
    queryFn: async () => {
      const response = await ProductManage.GetProductImageById(productId);
      return response.data.$values || response.data || [];
    },
    enabled: !!productId,
    staleTime: 15 * 60 * 1000, // 15 phút - ảnh ít thay đổi
    cacheTime: 30 * 60 * 1000, // 30 phút
  });
};

// Hook để tạo sản phẩm mới
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData) => ProductManage.CreateProduct(productData),
    onSuccess: () => {
      // Invalidate và refetch products list
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

// Hook để cập nhật sản phẩm
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => ProductManage.UpdateProduct(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific product và products list
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
    },
  });
};

// Hook để xóa sản phẩm
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ProductManage.DeleteProduct(id),
    onSuccess: (_, id) => {
      // Remove specific product từ cache và invalidate list
      queryClient.removeQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
    },
  });
};

// Hook để upload ảnh sản phẩm
export const useUploadProductImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, images }) => ProductManage.UploadImages(productId, images),
    onSuccess: (_, { productId }) => {
      // Invalidate images cache
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.images(productId) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(productId) });
    },
  });
};
