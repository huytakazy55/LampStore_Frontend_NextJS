"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useProducts } from '../../../../hooks/useProducts';
import { useNavigate } from '@/lib/router-compat';
const defaultImg = '/images/cameras-2.jpg';
import AddToCartModal from '../AddToCartModal';
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

const SmallProductCard = ({ product, navigate, onAddToCartClick }) => {
  const variant = product.variant;
  const price = variant?.discountPrice || variant?.price || 0;
  const originalPrice = variant?.price || 0;
  const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
  const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;

  return (
    <div
      className='relative group cursor-pointer bg-white rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 border border-gray-100'
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-lg">
          -{discountPercent}%
        </div>
      )}

      <div className='relative h-36 sm:h-44 md:h-52 overflow-hidden'>
        <Image
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
          src={getImageSrc(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          quality={50}
        />
      </div>

      {/* Content */}
      <div className='p-3 md:p-4'>
        {/* Category */}
        <p className='text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider mb-1'>
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
              <div className='text-[10px] text-gray-500 line-through -mt-0.5'>
                {formatPrice(originalPrice)}₫
              </div>
            )}
          </div>
          <button
            className='w-8 h-8 md:w-9 md:h-9 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200 group-hover:scale-105 active:scale-95'
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

const AllProducts = () => {
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartModalProduct, setCartModalProduct] = useState(null);
  const navigate = useNavigate();

  const products = useMemo(() => {
    // Show newest first
    const sorted = [...allProducts].reverse();
    return sorted.map((product) => {
      const variant = product.variant;
      const imgData = product.images?.$values || product.images;
      const images = Array.isArray(imgData) ? imgData : [];
      return { ...product, variant, images };
    });
  }, [allProducts]);

  const categories = useMemo(() => {
    return [...new Map(
      products
        .filter(p => p.category)
        .map(p => [p.category?.id || p.categoryId, p.category?.name || 'Khác'])
    ).entries()].map(([id, name]) => ({ id, name })).slice(0, 3);
  }, [products]);

  const [visibleRows, setVisibleRows] = useState(2);
  const itemsPerRow = 6;
  const visibleCount = visibleRows * itemsPerRow;

  const filteredProducts = activeCategory
    ? products.filter(p => (p.category?.id || p.categoryId) === activeCategory)
    : products;

  const gridProducts = filteredProducts.slice(0, visibleCount);



  // Ẩn hoàn toàn nếu không có data
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
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
          <h3 className='text-sm md:text-h3 font-medium text-black'>Tất cả sản phẩm</h3>
          <div className='text-xs md:text-normal flex justify-start sm:justify-end gap-4 md:gap-8 items-center font-medium overflow-x-auto pr-1'>
            <button
              className={`transition-colors whitespace-nowrap ${!activeCategory ? 'text-yellow-600 font-bold' : 'text-gray-500 hover:text-gray-600'}`}
              onClick={() => setActiveCategory(null)}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`transition-colors whitespace-nowrap ${activeCategory === cat.id ? 'text-yellow-600 font-bold' : 'text-gray-500 hover:text-gray-600'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className='w-full'>
          <style jsx global>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.5s ease-out forwards;
              opacity: 0;
            }
          `}</style>
          <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4'>
            {gridProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index % itemsPerRow) * 75}ms` }}
              >
                <SmallProductCard product={product} navigate={navigate} onAddToCartClick={setCartModalProduct} />
              </div>
            ))}
            {/* Fill empty spaces with placeholders if less than visibleCount and not total length (optional, keeping minimal empty state here) */}
            {gridProducts.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500">Không có sản phẩm nào</div>
            )}
          </div>

          {gridProducts.length < filteredProducts.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisibleRows(prev => prev + 2)}
                className="px-8 py-2 border-2 border-amber-400 text-amber-600 font-medium rounded hover:bg-amber-50 transition-colors"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddToCartModal
        isOpen={!!cartModalProduct}
        onClose={() => setCartModalProduct(null)}
        product={cartModalProduct}
      />
    </div >
  );
};

export default AllProducts;
