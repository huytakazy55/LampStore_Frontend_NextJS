"use client";

import React, { useState, useMemo } from 'react'
import Slider2 from "react-slick";
import { useNavigate } from '@/lib/router-compat';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '../../../../hooks/useProducts';
import AddToCartModal from '../AddToCartModal';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const CustomPrevArrow = ({ onClick }) => (
  <button
    className='absolute -top-[50px] md:-top-[70px] right-8 bg-gray-300 hover:bg-gray-400'
    onClick={onClick}
  >
    <i className="bx bx-chevron-left text-2xl md:text-3xl text-white"></i>
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    className='absolute -top-[50px] md:-top-[70px] right-0 bg-gray-300 hover:bg-gray-400'
    onClick={onClick}
  >
    <i className="bx bx-chevron-right text-2xl md:text-3xl text-white"></i>
  </button>
);

const ProductCardItem = ({ product, onClick, isInWishlist, onToggleWishlist, onAddToCartClick }) =>
{
  const images = product.images?.$values || product.images || [];
  const firstImage = images.length > 0 ? images[0] : null;
  const imageSrc = firstImage
    ? `${API_ENDPOINT}${firstImage.imagePath?.startsWith('/') ? '' : '/'}${firstImage.imagePath}`
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
    <div
      className='!w-[98%] h-[12rem] md:h-[14rem] cursor-pointer relative m-1 group bg-white rounded-sm overflow-hidden border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300'
      onClick={onClick}
    >
      <div className='flex gap-3 h-full'>
        {/* Image */}
        <div className='h-full aspect-square flex-shrink-0 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-3 relative overflow-hidden'>
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm shadow-md">
              -{discountPercent}%
            </div>
          )}
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} className='w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110' />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <i className='bx bx-image text-3xl text-gray-300'></i>
            </div>
          )}
        </div>

        {/* Info */}
        <div className='flex flex-col flex-1 py-3 pr-3 min-w-0'>
          {/* Sell Count */}
          <div className='text-[10px] md:text-xs text-gray-400 flex items-center gap-1 mb-1.5'>
            <i className='bx bx-purchase-tag text-amber-500 text-xs'></i>
            Đã bán {product.sellCount || 0}
          </div>

          {/* Title */}
          <h3 className='text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors duration-200'>
            {product.name}
          </h3>

          {/* Price */}
          <div className='mt-auto flex items-end justify-between'>
            <div>
              <div className='text-sm md:text-base font-bold text-amber-600'>
                {formatPrice(displayPrice)}<span className='text-[10px] md:text-xs font-normal ml-0.5'>₫</span>
              </div>
              {hasDiscount && (
                <div className='text-[10px] md:text-xs text-gray-400 line-through'>
                  {formatPrice(price)}₫
                </div>
              )}
            </div>
            <button
              className='w-7 h-7 md:w-8 md:h-8 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200 group-hover:scale-105 active:scale-95'
              onClick={(e) => { e.stopPropagation(); onAddToCartClick && onAddToCartClick(product); }}
            >
              <i className='bx bxs-cart-add text-sm md:text-base'></i>
            </button>
          </div>

          {/* Wishlist */}
          <div
            className={`flex items-center gap-1 text-[10px] md:text-xs cursor-pointer transition-all mt-1.5 ${isInWishlist ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          >
            <i className={`bx ${isInWishlist ? 'bxs-heart' : 'bx-heart'} text-sm`}></i>
            <span>{isInWishlist ? 'Đã thích' : 'Yêu thích'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionProductCardCarousel = () =>
{
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [cartModalProduct, setCartModalProduct] = useState(null);

  const products = useMemo(() =>
  {
    return [...allProducts]
      .filter(p => p.status)
      .sort((a, b) => (b.sellCount || 0) - (a.sellCount || 0))
      .slice(0, 12);
  }, [allProducts]);

  var settings = {
    dots: true,
    infinite: products.length > 3,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: false,
    autoplaySpeed: 3000,
    rows: 2,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          rows: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          rows: 2,
        }
      }
    ]
  };

  // Hide section if no products
  if (!loading && products.length === 0) return null;

  return (
    <div className='w-full overflow-visible xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 mb-8'>
      <div className='border-b border-gray-300 pb-1 relative mb-6 md:mb-8 after:w-[30%] md:after:w-[16%] after:h-[1px] after:bg-yellow-400 after:absolute after:bottom-0 after:left-0'>
        <h3 className='font-medium text-sm md:text-h3 text-black flex items-center gap-2'>
          <i className='bx bx-trending-up text-yellow-500'></i>
          Sản phẩm bán chạy
        </h3>
      </div>
      <div>
        {loading ? (
          <div className='flex items-center justify-center h-[300px]'>
            <i className='bx bx-loader-alt bx-spin text-3xl text-yellow-400'></i>
          </div>
        ) : (
          <Slider2 {...settings}>
            {products.map((product) => (
              <ProductCardItem
                key={product.id}
                product={product}
                onClick={() => navigate(`/product/${product.id}`)}
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