"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Slider2 from "react-slick";
import { useNavigate } from '@/lib/router-compat';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '../../../../hooks/useProducts';
import AddToCartModal from '../AddToCartModal';
import { resolveImagePath } from '@/lib/imageUtils';

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

const ProductCardItem = ({ product, onClick, isInWishlist, onToggleWishlist, onAddToCartClick }) =>
{
  const images = product.images?.$values || product.images || [];
  const firstImage = images.length > 0 ? images[0] : null;
  const imageSrc = firstImage
    ? resolveImagePath(firstImage.imagePath)
    : null;

  const variant = product.variant;
  const price = variant?.price || product.maxPrice || 0;
  const discountPrice = variant?.discountPrice || product.minPrice || 0;
  const displayPrice = discountPrice > 0 && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round((1 - discountPrice / price) * 100) : 0;

  const formatPrice = (p) =>
  {
    if (!p) return '0';
    return new Intl.NumberFormat('vi-VN').format(p);
  };

  return (
    <div className='p-[5px]' onClick={onClick}>
      <div className='flex gap-0 h-48 md:h-54 rounded-sm overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] cursor-pointer transition-all duration-300 relative hover:border-amber-200 dark:hover:border-[#4a3800] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(245,158,11,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_0_1px_rgba(180,134,11,0.15)] hover:-translate-y-0.5 group'>
        {/* Image Section */}
        <div className='relative w-[42%] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111] dark:to-[#1a1a1a] flex items-center justify-center p-3 overflow-hidden'>
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[0.6rem] md:text-[0.65rem] font-bold px-1.5 md:px-2 py-0.5 rounded-sm shadow-[0_2px_6px_rgba(239,68,68,0.25)] tracking-wide">
              -{discountPercent}%
            </div>
          )}
          {/* Sold Badge */}
          <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-[3px] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm text-gray-500 dark:text-gray-400 text-[0.6rem] md:text-[0.65rem] font-medium px-1.5 md:px-2 py-0.5 md:py-[3px] rounded-sm border border-black/5 dark:border-white/5">
            <i className='bx bx-purchase-tag text-amber-500 text-[0.7rem]'></i>
            {product.sellCount || 0} đã bán
          </div>
          {imageSrc ? (
            <Image src={imageSrc} alt={product.name} className='object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-transform duration-500 group-hover:scale-108' fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" quality={50} />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <i className='bx bx-image text-3xl text-gray-300'></i>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className='flex-1 flex flex-col py-3 px-3 md:py-4 md:px-4 min-w-0'>
          {/* Title */}
          <h3 className='text-[0.78rem] md:text-[0.85rem] font-semibold text-gray-700 dark:text-gray-300 leading-snug line-clamp-2 m-0 transition-colors duration-200 group-hover:text-amber-600 dark:group-hover:text-amber-400'>
            {product.name}
          </h3>

          {/* Price Row */}
          <div className='mt-auto flex items-end justify-between gap-2'>
            <div className='flex flex-col gap-px'>
              <span className='text-[0.95rem] md:text-[1.05rem] font-bold text-orange-600 dark:text-orange-400 leading-tight'>
                {formatPrice(displayPrice)}<span className='text-[0.7rem] font-medium ml-px'>₫</span>
              </span>
              {hasDiscount && (
                <span className='text-[0.65rem] md:text-[0.72rem] text-gray-400 dark:text-[#6b6b6b] line-through leading-none'>
                  {formatPrice(price)}₫
                </span>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className='flex items-center gap-1.5 md:gap-2 mt-2 md:mt-2.5 pt-[0.45rem] md:pt-[0.55rem] border-t border-gray-100 dark:border-[#2a2a2a]'>
            <button
              className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border rounded-sm bg-white dark:bg-[#222] text-[0.9rem] md:text-[1rem] cursor-pointer transition-all duration-200 flex-shrink-0 ${isInWishlist
                ? 'text-rose-500 border-rose-200 bg-rose-50 dark:bg-[#2a1520] dark:border-[#5a2035]'
                : 'text-gray-300 dark:text-[#555] border-gray-200 dark:border-[#333] hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-[#2a1520] dark:hover:border-[#5a2035]'
                }`}
              onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
              aria-label="Yêu thích"
            >
              <i className={`bx ${isInWishlist ? 'bxs-heart' : 'bx-heart'}`}></i>
            </button>
            <button
              className='flex-1 flex items-center justify-center gap-1.5 h-7 md:h-8 border-none rounded-sm bg-gradient-to-r from-amber-100 to-amber-200 dark:from-[#3d2e00] dark:to-[#4a3200] text-amber-800 dark:text-amber-400 text-[0.68rem] md:text-[0.72rem] font-semibold cursor-pointer transition-all duration-200 hover:from-amber-500 hover:to-orange-500 dark:hover:from-amber-600 dark:hover:to-orange-600 hover:text-white hover:shadow-[0_2px_8px_rgba(245,158,11,0.3)] active:scale-[0.97]'
              onClick={(e) => { e.stopPropagation(); onAddToCartClick && onAddToCartClick(product); }}
              tabIndex={-1}
              aria-label="Thêm vào giỏ hàng"
            >
              <i className='bx bx-cart-add text-sm md:text-[0.95rem]'></i>
              <span>Thêm giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getSlidesForWidth = (w) => {
  if (w < 640) return 1;
  if (w < 1024) return 2;
  return 3;
};

const SectionProductCardCarousel = () =>
{
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [cartModalProduct, setCartModalProduct] = useState(null);
  const sliderContainerRef = useRef(null);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [mounted, setMounted] = useState(false);

  // Manage slidesToShow via resize listener — bypasses react-slick responsive which is unreliable in SSR
  useEffect(() => {
    const update = () => setSlidesToShow(getSlidesForWidth(window.innerWidth));
    update();
    setMounted(true);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Fix ARIA: disable focus on interactive elements inside aria-hidden slides
  const fixAriaHiddenFocus = useCallback(() => {
    if (!sliderContainerRef.current) return;
    const hiddenSlides = sliderContainerRef.current.querySelectorAll('[aria-hidden="true"]');
    hiddenSlides.forEach((slide) => {
      const focusable = slide.querySelectorAll('button, a, input, [tabindex]');
      focusable.forEach((el) => el.setAttribute('tabindex', '-1'));
    });
    const visibleSlides = sliderContainerRef.current.querySelectorAll('[aria-hidden="false"]');
    visibleSlides.forEach((slide) => {
      const focusable = slide.querySelectorAll('button, a, input');
      focusable.forEach((el) => el.removeAttribute('tabindex'));
    });
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      // Run after slider mounts and DOM settles
      const timer = setTimeout(fixAriaHiddenFocus, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, mounted, fixAriaHiddenFocus]);

  const products = useMemo(() =>
  {
    return [...allProducts]
      .filter(p => p.status)
      .sort((a, b) => (b.sellCount || 0) - (a.sellCount || 0))
      .slice(0, 12);
  }, [allProducts]);

  var settings = {
    dots: true,
    infinite: products.length > slidesToShow,
    slidesToShow: slidesToShow,
    slidesToScroll: slidesToShow,
    autoplay: false,
    autoplaySpeed: 3000,
    rows: 2,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  // Hide section if no products
  if (!loading && products.length === 0) return null;

  return (
    <div className='w-full overflow-hidden xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 mb-8'>
      {/* Section Header */}
      <div className='flex items-center justify-between mb-6 pb-3 border-b border-gray-300 dark:border-[#333] relative after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-40 after:h-0.5 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 md:w-[42px] md:h-[42px] flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-[#3d2e00] dark:to-[#4a3200] rounded-md flex-shrink-0'>
            <i className='bx bx-trending-up text-xl md:text-[1.4rem] text-amber-600 dark:text-amber-400'></i>
          </div>
          <div>
            <h3 className='text-sm md:text-h3 font-bold text-gray-800 dark:text-gray-200 m-0 leading-tight'>Sản phẩm bán chạy</h3>
            <p className='text-[0.7rem] md:text-xs text-gray-400 dark:text-[#666] m-0 leading-tight'>Được yêu thích nhất tại CapyLumine</p>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div ref={sliderContainerRef} className='bestseller-dots-custom' style={{ minHeight: (loading || !mounted) ? '300px' : 'auto', contain: 'layout style' }}>
        {(loading || !mounted) ? (
          <div className='flex items-center justify-center h-[300px]'>
            <i className='bx bx-loader-alt bx-spin text-3xl text-amber-500'></i>
          </div>
        ) : (
          <Slider2 key={`slider-${slidesToShow}`} {...settings} afterChange={fixAriaHiddenFocus}>
            {products.map((product, index) => (
              <ProductCardItem
                key={product.id}
                product={product}
                onClick={() => navigate(`/product/${product.slug || product.id}`)}
                isInWishlist={isInWishlist(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCartClick={setCartModalProduct}
              />
            ))}
          </Slider2>
        )}
      </div>

      <AddToCartModal
        isOpen={!!cartModalProduct}
        onClose={() => setCartModalProduct(null)}
        product={cartModalProduct}
      />
    </div>
  )
}

export default SectionProductCardCarousel

