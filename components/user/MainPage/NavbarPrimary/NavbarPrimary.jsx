"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from '@/lib/router-compat'
import { useCategories } from '../../../../hooks/useCategories'
import { useProducts } from '../../../../hooks/useProducts'
import ProductManage from '@/services/ProductManage'
const Product1 = '/images/cameras-2.jpg';const NavbarPrimary = () =>
{
  const navigate = useNavigate()
  const { data: categories = [], isLoading: loading } = useCategories()
  const { data: allProducts = [] } = useProducts()
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [categoryProducts, setCategoryProducts] = useState({})
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT
  const hoverTimeoutRef = useRef(null)
  const animTimeoutRef = useRef(null)

  const fetchProductsByCategory = async (categoryId) =>
  {
    if (categoryProducts[categoryId]) return

    try
    {
      const filteredProducts = allProducts.filter(product =>
        product.categoryId === categoryId
      ).slice(0, 6)

      const productsWithImages = await Promise.all(
        filteredProducts.map(async (product) =>
        {
          try
          {
            const imageResponse = await ProductManage.GetProductImageById(product.id)
            const images = imageResponse.data.$values || imageResponse.data || []
            return { ...product, Images: images }
          } catch (error)
          {
            return { ...product, Images: [] }
          }
        })
      )

      setCategoryProducts(prev => ({
        ...prev,
        [categoryId]: productsWithImages
      }))
    } catch (error)
    {
      console.error('Error fetching products:', error)
    }
  }

  const handleCategoryHover = (category) =>
  {
    if (hoverTimeoutRef.current)
    {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (animTimeoutRef.current)
    {
      clearTimeout(animTimeoutRef.current)
      animTimeoutRef.current = null
    }

    if (category)
    {
      setHoveredCategory(category)
      setShowDropdown(true)
      fetchProductsByCategory(category.id)
    } else
    {
      hoverTimeoutRef.current = setTimeout(() =>
      {
        setShowDropdown(false)
        animTimeoutRef.current = setTimeout(() =>
        {
          setHoveredCategory(null)
        }, 300)
      }, 120)
    }
  }

  const getImageSrc = (category) =>
  {
    if (category.imageUrl)
    {
      return category.imageUrl.startsWith('http')
        ? category.imageUrl
        : `${API_ENDPOINT}${category.imageUrl}`
    }
    return Product1
  }

  const getProductImageSrc = (product) =>
  {
    const imgs = product.Images || product.images || []
    if (imgs.length > 0)
    {
      const path = imgs[0].imagePath || imgs[0].ImagePath
      if (path) return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`
    }
    return Product1
  }

  const formatPrice = (price) =>
  {
    if (!price) return 'Liên hệ'
    return `${price.toLocaleString('vi-VN')}₫`
  }

  const stripHtml = (html) =>
  {
    if (!html) return ''
    try
    {
      const div = document.createElement('div')
      div.innerHTML = html
      return div.textContent || div.innerText || ''
    } catch (e)
    {
      return ''
    }
  }

  // Inject keyframe CSS into head instead of inline <style> to avoid React DOM errors
  useEffect(() =>
  {
    const styleId = 'navbar-dropdown-keyframes'
    if (!document.getElementById(styleId))
    {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes dropdownSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdownSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-8px); }
        }
        .dropdown-enter {
          animation: dropdownSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .dropdown-exit {
          animation: dropdownSlideOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          pointer-events: none;
        }
      `
      document.head.appendChild(style)
    }
    return () =>
    {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  if (loading)
  {
    return (
      <div className='bg-yellow-400 w-full h-12'>
        <nav className='relative xl:mx-auto xl:max-w-[1440px] flex justify-center items-center h-full px-4 xl:px-0'>
          <div className="text-black font-medium text-sm">Đang tải danh mục...</div>
        </nav>
      </div>
    )
  }

  const products = hoveredCategory ? (categoryProducts[hoveredCategory.id] || []) : []

  return (
    <div className='bg-yellow-400 dark:bg-gray-900 dark:border-b dark:border-amber-500/30 w-full h-12'>
      <nav className='relative xl:mx-auto xl:max-w-[1440px] flex justify-between items-center h-full px-4 xl:px-0'>
        <ul className='flex justify-start h-full relative overflow-x-auto overflow-y-hidden scrollbar-hide w-full'>
          {categories.map((category) => (
            <li
              key={category.id}
              className={`flex items-center px-3 md:px-5 h-full border-r border-yellow-300/60 dark:border-amber-500/20 transition-colors duration-200 flex-shrink-0 cursor-pointer ${hoveredCategory?.id === category.id ? 'bg-yellow-500 dark:bg-amber-500/20' : 'hover:bg-yellow-500/70 dark:hover:bg-amber-500/10'
                }`}
              onMouseEnter={() => handleCategoryHover(category)}
              onMouseLeave={() => handleCategoryHover(null)}
            >
              <a className='text-black dark:text-amber-400 font-medium text-xs md:text-sm whitespace-nowrap' href={`/categories/${category.id}`}
                onClick={(e) => { e.preventDefault(); navigate(`/categories/${category.id}`) }}
              >
                {category.name}
              </a>
              <i className={`bx bx-chevron-down text-sm md:text-base ml-1 hidden sm:inline transition-transform duration-300 ${hoveredCategory?.id === category.id ? 'rotate-180' : ''
                }`}></i>
            </li>
          ))}
        </ul>

        {/* Mega Dropdown */}
        {hoveredCategory && (
          <div
            className={`hidden md:block absolute top-[48px] left-0 z-[1000] rounded-b-sm ${showDropdown ? 'dropdown-enter' : 'dropdown-exit'}`}
            style={{
              width: '100%',
              maxWidth: '1440px',
            }}
            onMouseEnter={() => handleCategoryHover(hoveredCategory)}
            onMouseLeave={() => handleCategoryHover(null)}
          >
            <div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/40 dark:border-gray-700/40 shadow-2xl rounded-b-sm overflow-hidden"
              style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.2)' }}
            >
              <div className="flex h-[350px]">
                {/* Left — Category Image + Info */}
                <div className="hidden lg:flex w-[30%] flex-col bg-gradient-to-br from-gray-900 to-gray-800 p-5 relative overflow-hidden">
                  <img
                    src={getImageSrc(hoveredCategory)}
                    alt={hoveredCategory.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    onError={(e) => { e.target.src = Product1 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                  <div className="relative mt-auto z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-6 bg-amber-400 rounded-full" />
                      <span className="text-amber-400 text-[10px] font-semibold tracking-[0.2em] uppercase">Bộ sưu tập</span>
                    </div>
                    <h3 className="text-white text-xl font-bold leading-tight mb-2">{hoveredCategory.name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                      {hoveredCategory.description
                        ? stripHtml(hoveredCategory.description)
                        : `Khám phá bộ sưu tập ${hoveredCategory.name.toLowerCase()}`}
                    </p>
                    <button
                      onClick={() =>
                      {
                        setShowDropdown(false)
                        navigate(`/categories/${hoveredCategory.id}`)
                      }}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-sm transition-all duration-200 cursor-pointer"
                    >
                      Xem tất cả
                      <i className='bx bx-right-arrow-alt text-sm' />
                    </button>
                  </div>
                </div>

                {/* Right — Products Grid */}
                <div className="w-full lg:w-[70%] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-800 dark:text-gray-100 text-base font-bold flex items-center gap-2">
                      <i className='bx bx-grid-alt text-amber-500' />
                      Sản phẩm nổi bật
                    </h4>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">{products.length} sản phẩm</span>
                  </div>

                  {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[280px] pr-1 custom-scrollbar">
                      {products.map((product, idx) => (
                        <div
                          key={product.id || idx}
                          className="flex items-center gap-3 p-2.5 rounded-sm bg-gray-50/80 dark:bg-gray-800/80 hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-transparent hover:border-amber-200 dark:hover:border-amber-700 cursor-pointer group transition-all duration-200 hover:shadow-sm"
                          onClick={() =>
                          {
                            setShowDropdown(false)
                            setHoveredCategory(null)
                            navigate(`/product/${product.id}`)
                          }}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                            <img
                              src={getProductImageSrc(product)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.target.src = Product1 }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-200">
                              {product.name}
                            </h5>
                            <p className="text-xs font-bold text-amber-600 mt-0.5">
                              {formatPrice(product.minPrice || product.price)}
                            </p>
                          </div>
                          <i className='bx bx-chevron-right text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors text-lg' />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-gray-400 dark:text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                        <i className='bx bx-loader-alt bx-spin text-xl text-gray-400' />
                      </div>
                      <p className="text-sm font-medium">Đang tải sản phẩm...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}

export default NavbarPrimary