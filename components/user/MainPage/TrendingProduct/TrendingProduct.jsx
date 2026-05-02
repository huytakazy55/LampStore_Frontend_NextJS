"use client";

import React, { useState, useMemo } from 'react';
import Slider3 from "react-slick";
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

const CustomPrevArrow = ({ onClick }) => (
  <button
    className='absolute -top-[52px] md:-top-[56px] right-[44px] md:right-[50px] z-10 flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-sm bg-gradient-to-br from-amber-500 to-orange-500 text-white cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(245,158,11,0.25)] hover:from-amber-600 hover:to-orange-600 hover:shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
    onClick={onClick}
    aria-label="Sản phẩm trước"
  >
    <i className="bx bx-chevron-left text-xl md:text-2xl leading-none"></i>
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    className='absolute -top-[52px] md:-top-[56px] right-1 z-10 flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-sm bg-gradient-to-br from-amber-500 to-orange-500 text-white cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(245,158,11,0.25)] hover:from-amber-600 hover:to-orange-600 hover:shadow-[0_4px_14px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95'
    onClick={onClick}
    aria-label="Sản phẩm tiếp theo"
  >
    <i className="bx bx-chevron-right text-xl md:text-2xl leading-none"></i>
  </button>
);

const TrendingProduct = () => {
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const [cartModalProduct, setCartModalProduct] = useState(null);
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const products = useMemo(() => {
    const sorted = [...allProducts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    return sorted.slice(0, 12).map((product) => {
      const variant = product.variant;
      const imgData = product.images?.$values || product.images;
      const images = Array.isArray(imgData) ? imgData : [];
      return { ...product, variant, images };
    });
  }, [allProducts]);

  const slidesToShow = Math.min(products.length, 4) || 1;

  const settings = {
    dots: false,
    infinite: products.length > 4,
    slidesToShow: slidesToShow,
    slidesToScroll: slidesToShow,
    autoplay: false,
    autoplaySpeed: 3000,
    rows: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(products.length, 3) || 1,
          slidesToScroll: Math.min(products.length, 3) || 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(products.length, 2) || 1,
          slidesToScroll: Math.min(products.length, 2) || 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };



  // Ẩn hoàn toàn nếu không có data (API fail hoặc không có sản phẩm)
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className='w-full py-8 md:py-16 xl:mx-auto xl:max-w-[1440px] flex justify-center items-center px-4 xl:px-0'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Đang tải sản phẩm thịnh hành...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 mb-8'>
      {/* Section Header — matching best-seller style */}
      <div className='flex items-center justify-between mb-6 md:mb-8 pb-3 border-b border-gray-300 dark:border-[#333] relative after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-40 after:h-0.5 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 md:w-[42px] md:h-[42px] flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-[#3d2e00] dark:to-[#4a3200] rounded-md flex-shrink-0'>
            <i className='bx bx-line-chart text-xl md:text-[1.4rem] text-amber-600 dark:text-amber-400'></i>
          </div>
          <div>
            <h3 className='text-sm md:text-h3 font-bold text-gray-800 dark:text-gray-200 m-0 leading-tight'>Sản phẩm thịnh hành</h3>
            <p className='text-[0.7rem] md:text-xs text-gray-400 dark:text-[#666] m-0 leading-tight'>Được xem nhiều nhất</p>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div>
        <Slider3 key={`slider-${products.length}`} {...settings}>
          {products.map((product) => {
            const variant = product.variant;
            const price = variant?.discountPrice || variant?.price || 0;
            const originalPrice = variant?.price || 0;
            const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
            const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;

            return (
              <div key={product.id} className='p-[3px]'>
                <div
                  className='flex h-[10rem] md:h-[12rem] cursor-pointer bg-white dark:bg-[#1a1a1a] rounded-sm overflow-hidden border border-gray-100 dark:border-[#2a2a2a] transition-all duration-300 hover:border-amber-200 dark:hover:border-[#4a3800] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(245,158,11,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 group'
                  onClick={() => navigate(`/product/${product.slug || product.id}`)}
                >
                  {/* Image */}
                  <div className='relative w-[38%] md:w-[40%] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111] dark:to-[#1a1a1a] flex items-center justify-center p-3 overflow-hidden'>
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-sm shadow-[0_2px_6px_rgba(239,68,68,0.25)]">
                        -{discountPercent}%
                      </div>
                    )}
                    <img
                      className='max-h-full max-w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-transform duration-500 group-hover:scale-108'
                      src={getImageSrc(product)}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => { e.target.src = defaultImg; }}
                    />
                  </div>

                  {/* Info */}
                  <div className='flex-1 flex flex-col py-3 px-3 md:py-4 md:px-4 min-w-0'>
                    {/* Category */}
                    <p className='text-[10px] md:text-[0.65rem] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1 truncate'>
                      {product.category?.name || 'Đèn ngủ'}
                    </p>

                    {/* Title */}
                    <h3 className='text-xs md:text-[0.85rem] font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug m-0 transition-colors duration-200 group-hover:text-amber-600 dark:group-hover:text-amber-400'>
                      {product.name}
                    </h3>

                    {/* Price + Cart */}
                    <div className='mt-auto flex items-end justify-between gap-2'>
                      <div className='flex flex-col gap-px'>
                        <span className='text-[0.9rem] md:text-[1rem] font-bold text-orange-600 dark:text-orange-400 leading-tight'>
                          {formatPrice(price)}<span className='text-[0.65rem] font-medium ml-px'>₫</span>
                        </span>
                        {hasDiscount && (
                          <span className='text-[0.6rem] md:text-[0.68rem] text-gray-400 dark:text-[#6b6b6b] line-through leading-none'>
                            {formatPrice(originalPrice)}₫
                          </span>
                        )}
                      </div>
                      <button
                        className='w-7 h-7 md:w-8 md:h-8 rounded-sm bg-gradient-to-br from-amber-100 to-amber-200 dark:from-[#3d2e00] dark:to-[#4a3200] text-amber-600 dark:text-amber-400 flex items-center justify-center cursor-pointer transition-all duration-300 hover:from-amber-500 hover:to-orange-500 hover:text-white hover:shadow-[0_2px_8px_rgba(245,158,11,0.3)] active:scale-95'
                        onClick={(e) => {
                          e.stopPropagation();
                          setCartModalProduct(product);
                        }}
                        aria-label="Thêm vào giỏ hàng"
                      >
                        <i className='bx bxs-cart-add text-sm md:text-base'></i>
                      </button>
                    </div>

                    {/* Wishlist */}
                    <div className='hidden md:flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-[#2a2a2a]'>
                      <button
                        className={`flex items-center gap-1 text-[0.65rem] cursor-pointer transition-colors ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-300 dark:text-[#555] hover:text-rose-400'}`}
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      >
                        <i className={`bx ${isInWishlist(product.id) ? 'bxs-heart' : 'bx-heart'} text-sm`}></i>
                        <span>{isInWishlist(product.id) ? 'Đã yêu thích' : 'Yêu thích'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider3>
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

export default TrendingProduct;