"use client";

import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../../hooks/useProducts';
import { useNavigate } from '@/lib/router-compat';
const defaultImg = '/images/cameras-2.jpg';
import AddToCartModal from '../AddToCartModal';
import { useWishlist } from '@/contexts/WishlistContext';
import { resolveImagePath } from '@/lib/imageUtils';

const formatPrice = (price) => {
  if (!price) return '0';
  return price.toLocaleString('vi-VN');
};

const getImageSrc = (product) => {
  if (product.images && product.images.length > 0) {
    const path = product.images[0].imagePath || product.images[0].ImagePath;
    if (path) return resolveImagePath(path, defaultImg);
  }
  if (product.Images && product.Images.length > 0) {
    const path = product.Images[0].imagePath || product.Images[0].ImagePath;
    if (path) return resolveImagePath(path, defaultImg);
  }
  return defaultImg;
};

const ProductCard = ({ product, isLast, navigate, onAddToCartClick, isInWishlist, onToggleWishlist }) => {
  const variant = product.variant;
  const price = variant?.discountPrice || variant?.price || 0;
  const originalPrice = variant?.price || 0;
  const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
  const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;

  return (
    <div
      className="relative group cursor-pointer bg-white dark:bg-[#1a1a1a] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(249,115,22,0.3)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_0_1px_rgba(249,115,22,0.3)] hover:-translate-y-1 border border-gray-100 dark:border-[#2a2a2a] hover:border-orange-500 dark:hover:border-orange-500"
      onClick={() => { if (product.slug || product.id) navigate(`/product/${product.slug || product.id}`); }}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-primary-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-[0_2px_6px_rgba(139,92,246,0.25)]">
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center transition-all duration-300 shadow-sm backdrop-blur-sm ${isInWishlist
          ? 'bg-primary-600 text-white scale-105'
          : 'bg-white/80 dark:bg-[#1a1a1a]/80 text-gray-400 dark:text-gray-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-500 hover:scale-105'
          }`}
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
        aria-label={isInWishlist ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
      >
        <i className={`bx ${isInWishlist ? 'bxs-heart' : 'bx-heart'} text-sm md:text-base`}></i>
      </button>

      {/* Image Container */}
      <div className="relative h-48 sm:h-56 md:h-60 overflow-hidden bg-gray-50 dark:bg-[#111]">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          src={getImageSrc(product)}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = defaultImg; }}
        />
      </div>

      {/* Content */}
      <div className="p-3 md:p-3.5">
        {/* Category */}
        <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">
          {product.category?.name || 'Đèn ngủ'}
        </p>

        {/* Title */}
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex items-center gap-2 mt-2">
            <span className="text-[0.95rem] md:text-[1.1rem] font-bold text-orange-600 dark:text-orange-500 inline-block leading-tight">
                {formatPrice(price)}<span className="text-[0.7rem] font-medium ml-px underline">đ</span>
            </span>
            {hasDiscount && (
                <span className="text-[0.65rem] md:text-[0.75rem] text-gray-400 dark:text-[#6b6b6b] line-through leading-none">
                    {formatPrice(originalPrice)}<span className="underline">đ</span>
                </span>
            )}
        </div>

        {/* Sold Count */}
        <div className="flex items-center gap-1 mt-1.5 text-gray-500 dark:text-gray-400 text-[0.65rem] md:text-xs">
            <i className='bx bx-purchase-tag text-orange-500'></i>
            <span>Đã bán {product.sellCount || 0}</span>
        </div>

        {/* Actions Row */}
        <div className="flex items-stretch gap-1.5 md:gap-2 mt-3">
            <button
                className="flex-1 flex items-center justify-center py-1.5 rounded-sm border border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToCartClick(product);
                }}
                aria-label="Thêm vào giỏ hàng"
            >
                <span className="text-[8.5px] sm:text-[9px] md:text-xs font-semibold">Thêm vào giỏ</span>
            </button>
            <button
                className="flex-1 flex items-center justify-center py-1.5 rounded-sm border border-transparent bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToCartClick(product);
                }}
                aria-label="Mua ngay"
            >
                <span className="text-[9px] md:text-xs font-semibold">Mua ngay</span>
            </button>
        </div>
      </div>
    </div>
  );
};

const ProductCarousel = () => {
  const [activeTab, setActiveTab] = useState('featured');
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const [cartModalProduct, setCartModalProduct] = useState(null);
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const products = useMemo(() => {
    return allProducts.map((product) => {
      const variant = product.variant;
      const imgData = product.images?.$values || product.images;
      const images = Array.isArray(imgData) ? imgData : [];
      return { ...product, variant, images };
    });
  }, [allProducts]);

  // Filter products theo tab
  const getFilteredProducts = () => {
    let filtered = [...products];
    switch (activeTab) {
      case 'featured':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'onsale':
        filtered = filtered.filter(p => {
          const v = p.variant;
          return v && v.discountPrice && v.discountPrice < v.price;
        });
        filtered.sort((a, b) => {
          const discountA = a.variant ? (a.variant.price - a.variant.discountPrice) / a.variant.price : 0;
          const discountB = b.variant ? (b.variant.price - b.variant.discountPrice) / b.variant.price : 0;
          return discountB - discountA;
        });
        break;
      case 'toprated':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        break;
    }
    return filtered.slice(0, 10);
  };

  const displayProducts = getFilteredProducts();

  const tabs = [
    { key: 'featured', label: 'Nổi bật', icon: 'bx bxs-star' },
    { key: 'onsale', label: 'Giảm giá', icon: 'bx bxs-purchase-tag' },
    { key: 'toprated', label: 'Đánh giá cao', icon: 'bx bxs-like' },
  ];



  // Ẩn section nếu không có sản phẩm
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className='w-full py-8 md:py-16 xl:mx-auto xl:max-w-[1440px] flex justify-center items-center px-4 xl:px-0'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
      {/* Tab Selector */}
      <div className='flex justify-center items-center mb-6 md:mb-8'>
        <div className='inline-flex items-center bg-gray-50 dark:bg-gray-800/80 rounded-sm p-1 md:p-1.5 border border-gray-200/60 dark:border-gray-700/50 shadow-sm'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`relative flex items-center gap-1.5 md:gap-2 px-5 md:px-7 py-2 md:py-2.5 rounded-sm text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md dark:bg-primary-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`${tab.icon} text-sm md:text-base`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className='tab-content'>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4'>
          {displayProducts.length > 0 ? (
            displayProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isLast={index === displayProducts.length - 1}
                navigate={navigate}
                onAddToCartClick={setCartModalProduct}
                isInWishlist={isInWishlist(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))
          ) : null}
        </div>
      </div>

      {/* Modal */}
      <AddToCartModal
        isOpen={!!cartModalProduct}
        onClose={() => setCartModalProduct(null)}
        product={cartModalProduct}
      />
    </div>
  );
};

export default ProductCarousel;
