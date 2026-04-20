"use client";

import React from 'react'
import Slider from "react-slick";
const Brand = '/images/Brand.png';const BrandCarousel = () => {
    var settings = {
        dots: false,
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        rows: 1,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 4,
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 3,
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 2,
            }
          }
        ]
      };
  return (
    <div className='h-20 md:h-28 border-y border-gray-300 mt-8 md:mt-16 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
        <Slider {...settings}>
            <div className='h-20 md:h-28 !flex justify-center items-center group'>
                <img className='opacity-50 group-hover:opacity-100 group-hover:cursor-pointer max-w-[80%] md:max-w-full' src={Brand} alt="" />
            </div>
            <div className='h-20 md:h-28 !flex justify-center items-center group'>
                <img className='opacity-50 group-hover:opacity-100 group-hover:cursor-pointer max-w-[80%] md:max-w-full' src={Brand} alt="" />
            </div>
            <div className='h-20 md:h-28 !flex justify-center items-center group'>
                <img className='opacity-50 group-hover:opacity-100 group-hover:cursor-pointer max-w-[80%] md:max-w-full' src={Brand} alt="" />
            </div>
            <div className='h-20 md:h-28 !flex justify-center items-center group'>
                <img className='opacity-50 group-hover:opacity-100 group-hover:cursor-pointer max-w-[80%] md:max-w-full' src={Brand} alt="" />
            </div>
            <div className='h-20 md:h-28 !flex justify-center items-center group'>
                <img className='opacity-50 group-hover:opacity-100 group-hover:cursor-pointer max-w-[80%] md:max-w-full' src={Brand} alt="" />
            </div>
        </Slider>
    </div>
  )
}

export default BrandCarousel