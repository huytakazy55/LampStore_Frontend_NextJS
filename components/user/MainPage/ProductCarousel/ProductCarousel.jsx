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
      className="relative group cursor-pointer bg-white dark:bg-[#1a1a1a] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(245,158,11,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 border border-gray-100 dark:border-[#2a2a2a] hover:border-amber-200 dark:hover:border-[#4a3800]"
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-[0_2px_6px_rgba(239,68,68,0.25)]">
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist Button */}
      <button
        className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center transition-all duration-300 shadow-sm backdrop-blur-sm ${isInWishlist
          ? 'bg-rose-500 text-white scale-105'
          : 'bg-white/80 dark:bg-[#1a1a1a]/80 text-gray-400 dark:text-gray-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 hover:scale-105'
          }`}
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
        aria-label={isInWishlist ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
      >
        <i className={`bx ${isInWishlist ? 'bxs-heart' : 'bx-heart'} text-sm md:text-base`}></i>
      </button>

      {/* Image Container */}
      <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-[#111] dark:to-[#1a1a1a]">
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
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Price + Cart Row */}
        <div className="flex items-end justify-between mt-2.5 pt-2.5 border-t border-gray-100 dark:border-[#2a2a2a]">
          <div>
            <div className="text-sm md:text-base font-bold text-orange-600 dark:text-orange-400">
              {formatPrice(price)}<span className="text-[10px] font-normal ml-0.5">₫</span>
            </div>
            {hasDiscount && (
              <div className="text-[10px] md:text-xs text-gray-400 dark:text-[#6b6b6b] line-through -mt-0.5">
                {formatPrice(originalPrice)}₫
              </div>
            )}
          </div>
          <button
            className="w-8 h-8 md:w-9 md:h-9 rounded-sm bg-gradient-to-br from-amber-100 to-amber-200 dark:from-[#3d2e00] dark:to-[#4a3200] text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all duration-300 hover:from-amber-500 hover:to-orange-500 hover:text-white hover:shadow-[0_2px_8px_rgba(245,158,11,0.3)] active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCartClick(product);
            }}
            aria-label="Thêm vào giỏ hàng"
          >
            <i className='bx bxs-cart-add text-base md:text-lg'></i>
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
      <div className='w-full py-8 md:py-16 mb-4 xl:mx-auto xl:max-w-[1440px] flex justify-center items-center px-4 xl:px-0'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full mb-4 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
      {/* Tab Selector */}
      <div className='flex justify-center items-center mb-6 md:mb-8'>
        <div className='inline-flex items-center bg-gray-50 dark:bg-gray-800/80 rounded-sm p-1 md:p-1.5 border border-gray-200/60 dark:border-gray-700/50 shadow-sm'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`relative flex items-center gap-1.5 md:gap-2 px-5 md:px-7 py-2 md:py-2.5 rounded-sm text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
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