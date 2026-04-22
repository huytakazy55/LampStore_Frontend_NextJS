"use client";

import React from 'react'
import Image from 'next/image'
import { useCategories } from '../../../../hooks/useCategories'
const Product1 = '/images/cameras-2.jpg'; import { useNavigate } from '@/lib/router-compat'

const CategorySale = () => {
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT
  const navigate = useNavigate()

  // Sử dụng React Query hook thay vì useState/useEffect
  const {
    data: allCategories = [],
    isLoading: loading,
    error,
    isError
  } = useCategories()

  // Filter và limit categories (được cache tự động)
  const categories = React.useMemo(() => {
    const displayedCategories = allCategories.filter(category => category.isDisplayed !== false)
    return displayedCategories.slice(0, 4)
  }, [allCategories])




  const getImageSrc = (category) => {
    if (category.imageUrl) {
      // Kiểm tra nếu là URL từ Cloudinary (bắt đầu với https://)
      if (category.imageUrl.startsWith('http')) {
        return category.imageUrl // URL đầy đủ từ Cloudinary
      } else {
        // Legacy local images (cũ)
        return `${API_ENDPOINT}${category.imageUrl}`
      }
    } else {
      // Fallback về ảnh mặc định
      return Product1
    }
  }

  const formatCategoryName = (name) => {
    // Chia tên thành các từ và hiển thị trên nhiều dòng
    const words = name.split(' ')
    if (words.length <= 2) {
      return [name.toUpperCase()]
    } else {
      return [
        words.slice(0, Math.ceil(words.length / 2)).join(' ').toUpperCase(),
        words.slice(Math.ceil(words.length / 2)).join(' ').toUpperCase()
      ]
    }
  }

  const stripHtmlTags = (html) => {
    // Tạo một temporary div để strip HTML tags
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  const getDisplayDescription = (category) => {
    if (!category.description) {
      return `Sản phẩm ${category.name.toLowerCase()}`
    }

    const plainText = stripHtmlTags(category.description)

    return plainText.length > 25 ?
      `${plainText.substring(0, 25)}...` :
      plainText
  }

  if (loading) {
    return (
      <div className='w-full h-36 flex justify-center items-center mb-6 xl:mx-auto xl:max-w-[1440px]'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh mục... (React Query Cache)</p>
        </div>
      </div>
    )
  }

  if (isError || categories.length === 0) {
    // Ẩn hoàn toàn section khi lỗi hoặc không có dữ liệu
    return null;
  }

  return (
    <div className='w-full mb-8'>
      <div className='xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {categories.map((category, index) => {
            const nameLines = formatCategoryName(category.name)
            return (
              <div
                key={category.id || index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-200"
                onClick={() => navigate(`/categories/${category.slug || category.id}`)}
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    src={getImageSrc(category)}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    quality={75}
                    priority={index === 0}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-white">
                      <p className="text-xs font-medium mb-1 opacity-90">KHÁM PHÁ BỘ SƯU TẬP</p>
                      {nameLines.map((line, lineIndex) => (
                        <p key={lineIndex} className="text-sm font-bold leading-tight">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex flex-col h-20">
                    <div className="flex-1 mb-3">
                      <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed h-10 overflow-hidden">
                        {getDisplayDescription(category)}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <span
                        className='inline-flex items-center text-amber-700 group-hover:text-amber-800 font-semibold text-sm transition-colors duration-200 whitespace-nowrap'
                      >
                        Xem ngay
                        <i className='bx bx-chevron-right ml-1 text-lg bg-yellow-400 group-hover:bg-yellow-500 rounded-full text-white transition-colors duration-200 w-6 h-6 grid place-items-center pl-[3px] pt-[2px]'></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Nếu có ít hơn 4 danh mục, hiển thị placeholder */}
          {categories.length < 4 && Array.from({ length: 4 - categories.length }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center items-center p-8 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-all duration-300"
              style={{ minHeight: '240px' }}
            >
              <i className='bx bx-image text-4xl mb-3'></i>
              <p className="text-sm font-medium">Chưa có danh mục</p>
              <p className="text-xs text-center mt-1">Thêm danh mục mới từ trang quản trị</p>
            </div>
          ))}
        </div>
      </div>
    </div >
  )
}

export default CategorySale