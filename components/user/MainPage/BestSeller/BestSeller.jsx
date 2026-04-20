"use client";

import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../../hooks/useProducts';
import { useNavigate } from '@/lib/router-compat';
const defaultImg = '/images/cameras-2.jpg';
import AddToCartModal from '../AddToCartModal';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) =>
{
  if (!price) return '0';
  return price.toLocaleString('vi-VN');
};

const getImageSrc = (product) =>
{
  if (product.images && product.images.length > 0)
  {
    const path = product.images[0].imagePath || product.images[0].ImagePath;
    if (path) return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
  }
  if (product.Images && product.Images.length > 0)
  {
    const path = product.Images[0].imagePath || product.Images[0].ImagePath;
    if (path) return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
  }
  return defaultImg;
};

const SmallProductCard = ({ product, navigate, onAddToCartClick }) =>
{
  const variant = product.variant;
  const price = variant?.discountPrice || variant?.price || 0;
  const originalPrice = variant?.price || 0;
  const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
  const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;

  return (
    <div
      className='relative group cursor-pointer bg-white rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 border border-gray-100'
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-lg">
          -{discountPercent}%
        </div>
      )}

      <div className='relative h-36 sm:h-44 md:h-52 overflow-hidden'>
        <img
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
          src={getImageSrc(product)}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = defaultImg; }}
        />
      </div>

      {/* Content */}
      <div className='p-3 md:p-4'>
        {/* Category */}
        <p className='text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider mb-1'>
          {product.category?.name || 'Đèn ngủ'}
        </p>

        {/* Title */}
        <h3 className='text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-amber-700 transition-colors duration-200'>
          {product.name}
        </h3>

        {/* Price + Cart */}
        <div className='flex items-end justify-between mt-2.5 pt-2.5 border-t border-gray-100'>
          <div>
            <div className='text-sm md:text-base font-bold text-amber-600'>
              {formatPrice(price)}<span className='text-[10px] font-normal ml-0.5'>₫</span>
            </div>
            {hasDiscount && (
              <div className='text-[10px] text-gray-400 line-through -mt-0.5'>
                {formatPrice(originalPrice)}₫
              </div>
            )}
          </div>
          <button
            className='w-8 h-8 md:w-9 md:h-9 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200 group-hover:scale-105 active:scale-95'
            onClick={(e) =>
            {
              e.stopPropagation();
              onAddToCartClick(product);
            }}
          >
            <i className='bx bxs-cart-add text-base md:text-lg'></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const BigProductCard = ({ product, navigate, onAddToCartClick }) =>
{
  const variant = product.variant;
  const price = variant?.discountPrice || variant?.price || 0;
  const originalPrice = variant?.price || 0;
  const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
  const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;

  return (
    <div
      className='w-full lg:w-[33%] bg-white rounded-sm overflow-hidden p-4 md:p-6 flex flex-col cursor-pointer group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100'
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="inline-flex self-start bg-gradient-to-r from-red-500 to-rose-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-lg mb-2">
          -{discountPercent}%
        </div>
      )}

      {/* Category */}
      <p className='text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider mb-1'>
        {product.category?.name || 'Đèn ngủ'}
      </p>

      {/* Title */}
      <h3 className='text-sm md:text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-amber-700 transition-colors duration-200'>
        {product.name}
      </h3>

      <div className='w-full h-48 md:h-[60%] overflow-hidden rounded-sm my-3'>
        <img
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
          src={getImageSrc(product)}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = defaultImg; }}
        />
      </div>

      {/* Thumbnails */}
      <div className='flex gap-2 mb-3'>
        {product.images && product.images.slice(0, 3).map((img, i) =>
        {
          const path = img.imagePath || img.ImagePath;
          const src = path ? (path.startsWith('http') ? path : `${API_ENDPOINT}${path}`) : defaultImg;
          return (
            <img
              key={i}
              className='w-12 h-12 md:w-16 md:h-16 border border-gray-200 rounded-sm object-cover hover:border-amber-400 transition-colors'
              src={src}
              alt=""
              loading="lazy"
              onError={(e) => { e.target.src = defaultImg; }}
            />
          );
        })}
      </div>

      {/* Price + Cart */}
      <div className='mt-auto flex justify-between items-end pt-3 border-t border-gray-100'>
        <div>
          <div className='text-base md:text-lg font-bold text-amber-600'>
            {formatPrice(price)}<span className='text-xs font-normal ml-0.5'>₫</span>
          </div>
          {hasDiscount && (
            <div className='text-[10px] md:text-xs text-gray-400 line-through -mt-0.5'>
              {formatPrice(originalPrice)}₫
            </div>
          )}
        </div>
        <button
          className='w-9 h-9 md:w-10 md:h-10 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200 group-hover:scale-105 active:scale-95'
          onClick={(e) =>
          {
            e.stopPropagation();
            onAddToCartClick(product);
          }}
        >
          <i className='bx bxs-cart-add text-lg md:text-xl'></i>
        </button>
      </div>
    </div>
  );
};

const BestSeller = () =>
{
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartModalProduct, setCartModalProduct] = useState(null);
  const navigate = useNavigate();

  const products = useMemo(() =>
  {
    const sorted = [...allProducts].sort((a, b) => (b.sellCount || 0) - (a.sellCount || 0));
    return sorted.slice(0, 15).map((product) =>
    {
      const variant = product.variant;
      const imgData = product.images?.$values || product.images;
      const images = Array.isArray(imgData) ? imgData : [];
      return { ...product, variant, images };
    });
  }, [allProducts]);

  const categories = useMemo(() =>
  {
    return [...new Map(
      products
        .filter(p => p.category)
        .map(p => [p.category?.id || p.categoryId, p.category?.name || 'Khác'])
    ).entries()].map(([id, name]) => ({ id, name })).slice(0, 3);
  }, [products]);

  const filteredProducts = activeCategory
    ? products.filter(p => (p.category?.id || p.categoryId) === activeCategory)
    : products;

  const gridProducts = filteredProducts.slice(0, 8);
  const featuredProduct = filteredProducts[8] || filteredProducts[0];



  // Ẩn hoàn toàn nếu không có data
  if (!loading && products.length === 0)
  {
    return null;
  }

  if (loading)
  {
    return (
      <div className='w-full py-8 md:py-16 bg-gray-100 flex justify-center items-center'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Đang tải sản phẩm bán chạy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-transparent'>
      <div className='xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
        <div className='border-b border-gray-300 pb-1 relative mb-6 md:mb-8 pt-4 md:pt-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 after:w-1/12 after:h-[1px] after:absolute after:bottom-0 after:bg-yellow-400'>
          <h3 className='text-sm md:text-h3 font-medium text-black'>Bán chạy nhất</h3>
          <div className='text-xs md:text-normal flex justify-start sm:justify-end gap-4 md:gap-8 items-center font-medium overflow-x-auto pr-1'>
            <button
              className={`transition-colors whitespace-nowrap ${!activeCategory ? 'text-yellow-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveCategory(null)}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`transition-colors whitespace-nowrap ${activeCategory === cat.id ? 'text-yellow-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className='w-full flex flex-col lg:flex-row justify-between gap-2 md:gap-[0.5%]'>
          <div className='w-full lg:w-[70%]'>
            {/* Row 1 */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4'>
              {gridProducts.slice(0, 4).map((product) => (
                <SmallProductCard key={product.id} product={product} navigate={navigate} onAddToCartClick={setCartModalProduct} />
              ))}
              {gridProducts.length < 4 && Array.from({ length: 4 - Math.min(gridProducts.length, 4) }).map((_, i) => (
                <div key={`empty-1-${i}`} className='bg-white flex items-center justify-center text-gray-300 h-48 md:h-[22.25rem]'>
                  <i className='bx bx-package text-4xl'></i>
                </div>
              ))}
            </div>
            {/* Row 2 */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
              {gridProducts.slice(4, 8).map((product) => (
                <SmallProductCard key={product.id} product={product} navigate={navigate} onAddToCartClick={setCartModalProduct} />
              ))}
              {gridProducts.length < 8 && gridProducts.length > 4 && Array.from({ length: 4 - Math.min(Math.max(gridProducts.length - 4, 0), 4) }).map((_, i) => (
                <div key={`empty-2-${i}`} className='bg-white flex items-center justify-center text-gray-200 h-48 md:h-[22.25rem] rounded-lg'>
                  <i className='bx bx-package text-4xl'></i>
                </div>
              ))}
            </div>
          </div>
          {/* Featured big card */}
          {featuredProduct && (
            <BigProductCard product={featuredProduct} navigate={navigate} onAddToCartClick={setCartModalProduct} />
          )}
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

export default BestSeller;