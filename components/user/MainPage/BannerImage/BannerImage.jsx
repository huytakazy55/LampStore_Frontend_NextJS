"use client";

import React from 'react'
import { useQuery } from '@tanstack/react-query';
import BannerService from '@/services/BannerService';
import { resolveImagePath } from '@/lib/imageUtils';

const BannerImage = () => {

  const { data: banners = [], isLoading: loading, isError } = useQuery({
    queryKey: ['banners', 'active'],
    queryFn: async () => {
      const activeBanners = await BannerService.getActiveBanners();
      return Array.isArray(activeBanners) ? activeBanners : [];
    },
    staleTime: 10 * 60 * 1000, // 10 phút - banners ít thay đổi
    cacheTime: 20 * 60 * 1000, // 20 phút
  });

  if (loading) {
    return (
      <div className='w-full h-28 md:h-40 mt-8 md:mt-16 xl:mx-auto xl:max-w-[1440px] flex justify-center items-center px-4 xl:px-0'>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (isError || banners.length === 0) {
    return null;
  }

  return (
    <div className='w-full mt-8 md:mt-16 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
      <div className='flex flex-col sm:flex-row justify-between items-center w-full gap-3 md:gap-4'>
        {banners.slice(0, 2).map((banner, index) => (
          <div key={banner.id} className='w-full sm:w-[49%] h-28 md:h-40 relative overflow-hidden rounded-lg'>
            <img
              className='w-full h-full object-cover'
              src={resolveImagePath(banner.imageUrl)}
              alt={banner.title || 'Banner'}
              loading="lazy"
            />
            {banner.linkUrl && (
              <a
                href={banner.linkUrl}
                className='absolute inset-0 block'
                target="_blank"
                rel="noopener noreferrer"
              >
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BannerImage