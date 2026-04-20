"use client";

import React from 'react'
import Slider from "react-slick";
const imgBlock = '/images/TVbanner.jpg';const consal = '/images/consalGame.jpg';const speaker = '/images/WirelessSound.jpg';const printer = '/images/printer.jpg';const camera360 = '/images/360-camers.jpg';const camera = '/images/camera2.jpg';const laptop = '/images/laptop-2.jpg';const ProductSlideCard = ({ image, className = '' }) => (
  <div className={`p-2 md:p-[10px] bg-white !w-[98%] h-[9rem] md:h-[11.5rem] mb-[7px] transition-all duration-300 ease-in-out hover:ring-1 ring-gray-300 z-10 group ${className}`}>
    <div className='flex justify-between gap-2 md:gap-[10px]'>
      <div className='w-2/5 flex items-center'>
        <img className='w-full' src={image} alt="" />
      </div>
      <div className='w-8/12'>
        <p className='text-[10px] md:text-smaller mb-1 md:mb-2'>Game Consoles</p>
        <p className='text-xs md:text-small text-blue-500 font-medium mb-1 md:mb-2 line-clamp-2'>Game Console Controller + USB 3.0 Cable</p>
        <div className='flex justify-between items-center mb-1 md:mb-[10px]'>
          <div>
            <p className='text-sm md:text-h3'>1.000.000<span>đ</span></p>
            <p className='text-xs md:text-small line-through'>1.000.000<span>đ</span></p>
          </div>
          <div className='group-hover:bg-yellow-400 w-7 h-7 md:w-8 md:h-8 bg-gray-300 rounded-[50%] leading-[1.5] text-white cursor-pointer mr-2 md:mr-4 mt-2 md:mt-3 flex items-center justify-center'>
            <i className='bx bxs-cart-add align-middle text-sm md:text-h3'></i>
          </div>
        </div>
        <div className='group-hover:visible group-hover:opacity-100 justify-around border-t border-gray-300 pt-1 md:pt-2 invisible opacity-0 hidden md:flex'>
          <div className='text-gray-400 hover:text-gray-700 flex justify-center gap-1 leading-0 align-middle cursor-pointer'>
            <i className='bx bx-heart text-[14px] md:text-[17px] leading-[1.2] transition-all duration-300 ease-in-out'></i>
            <p className='wishlist text-xs md:text-small transition-all duration-300 ease-in-out'>Thêm vào ưa thích</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BannerProductCarousel = () => {
    var settings = {
        dots: true,
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 3000,
        rows: 2,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              rows: 2,
            }
          }
        ]
      };
  return (
    <div className='w-full bg-banner-product bg-cover bg-center mb-6 md:mb-10'>
        <nav className='xl:mx-auto xl:max-w-[1440px] flex flex-col md:flex-row justify-between items-stretch h-auto md:h-[36rem] py-4 md:py-8 px-4 xl:px-0 gap-4 md:gap-0'>
            <div className='h-48 sm:h-64 md:h-full w-full md:w-1/2'>
                <img className='w-full h-full object-cover rounded-lg md:rounded-none' src={imgBlock} alt="" />
            </div>
            <div className='w-full md:w-1/2 text-sm md:text-h3'>
                <div className='relative font-medium text-black border-b border-gray-300 pb-1 mb-4 md:mb-6 after:absolute after:w-[39%] after:h-[1px] after:bg-yellow-400 after:bottom-0 after:left-0 text-sm md:text-base'>Television Entertainment</div>
                <div className='relative'>
                    <Slider {...settings}>
                        <ProductSlideCard image={speaker} />
                        <ProductSlideCard image={consal} />
                        <ProductSlideCard image={camera} />
                        <ProductSlideCard image={camera360} />
                        <ProductSlideCard image={printer} />
                        <ProductSlideCard image={laptop} />
                    </Slider>
                </div>
            </div>
        </nav>
    </div>
  )
}

export default BannerProductCarousel