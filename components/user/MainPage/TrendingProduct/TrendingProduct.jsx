"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Slider3 from "react-slick";
import { useProducts } from '../../../../hooks/useProducts';
import { useNavigate } from '@/lib/router-compat';
const defaultImg = '/images/cameras-2.jpg';
import AddToCartModal from '../AddToCartModal';
import { useWishlist } from '@/contexts/WishlistContext';

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

const CustomPrevArrow = ({ onClick }) => (
  <button
    className='absolute -top-[50px] md:-top-[70px] right-8 bg-gray-300 hover:bg-gray-400 transition-colors'
    onClick={onClick}
  >
    <i className="bx bx-chevron-left text-2xl md:text-3xl text-white"></i>
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    className='absolute -top-[50px] md:-top-[70px] right-0 bg-gray-300 hover:bg-gray-400 transition-colors'
    onClick={onClick}
  >
    <i className="bx bx-chevron-right text-2xl md:text-3xl text-white"></i>
  </button>
);

const TrendingProduct = () =>
{
  const { data: allProducts = [], isLoading: loading } = useProducts();
  const [cartModalProduct, setCartModalProduct] = useState(null);
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const products = useMemo(() =>
  {
    const sorted = [...allProducts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    return sorted.slice(0, 12).map((product) =>
    {
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
  if (!loading && products.length === 0)
  {
    return null;
  }

  if (loading)
  {
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
      <div className='relative pb-2 border-b border-gray-300 mb-6 md:mb-8 after:w-[30%] md:after:w-[13%] after:h-[1px] after:absolute after:bottom-0 after:bg-yellow-400'>
        <h3 className='text-sm md:text-h3 font-medium text-black'>Sản phẩm thịnh hành</h3>
      </div>
      <div>
        <Slider3 key={`slider-${products.length}`} {...settings}>
          {products.map((product) =>
          {
            const variant = product.variant;
            const price = variant?.discountPrice || variant?.price || 0;

            return (
              <div
                key={product.id}
                className='!w-[99%] h-[10rem] md:h-[12.2rem] p-3 md:p-4 cursor-pointer relative m-[2px] hover:after:content-none hover:ring-1 hover:ring-gray-300 group'
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className='!flex justify-between items-center h-[7rem] md:h-[8.5rem]'>
                  <div className='w-[35%] md:w-[40%] flex justify-center items-center'>
                    <img
                      className='max-h-full max-w-full object-contain'
                      src={getImageSrc(product)}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => { e.target.src = defaultImg; }}
                    />
                  </div>
                  <div className='flex flex-col h-[7rem] md:h-[8.5rem] relative pr-1 md:pr-2 pb-1 md:pb-2 pl-2 md:pl-4 w-[65%] md:w-[60%]'>
                    <div>
                      <div className='text-[10px] md:text-smaller text-gray-500 truncate'>
                        {product.category?.name || 'Đèn ngủ'}
                      </div>
                      <div className='text-blue-400 text-xs md:text-small font-bold line-clamp-2'>
                        {product.name}
                      </div>
                    </div>
                    <div className='mt-auto flex justify-between items-center'>
                      <div className='text-xs md:text-normal font-bold text-yellow-600'>
                        {formatPrice(price)}<span>₫</span>
                      </div>
                      <div
                        className='w-7 h-7 md:w-9 md:h-9 rounded-sm bg-gray-300 -mt-[1px] cursor-pointer group-hover:bg-yellow-400 transition-colors flex justify-center items-center'
                        onClick={(e) =>
                        {
                          e.stopPropagation();
                          setCartModalProduct(product);
                        }}
                      >
                        <i className='bx bxs-cart-add text-base md:text-h2 text-white'></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='hidden md:flex ml-[41%] border-t border-gray-300 pt-[0.7rem] justify-around items-center text-small text-gray-400 invisible opacity-0 transition-all duration-200 ease-in-out group-hover:visible group-hover:opacity-100'>
                  <div
                    className={`flex leading-[1.4] align-middle gap-[5px] cursor-pointer transition-colors ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-300 hover:text-gray-500'}`}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  >
                    <i className={`bx ${isInWishlist(product.id) ? 'bxs-heart' : 'bx-heart'} text-h3`}></i>
                    <p className='mt-[1px]'>{isInWishlist(product.id) ? 'Đã yêu thích' : 'Thêm vào ưa thích'}</p>
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