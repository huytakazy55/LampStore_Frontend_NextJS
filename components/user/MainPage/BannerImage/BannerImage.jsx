"use client";

import React, { useState, useEffect } from 'react'
import BannerService from '@/services/BannerService';

const BannerImage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const activeBanners = await BannerService.getActiveBanners();
        setBanners(activeBanners);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className='w-full h-28 md:h-40 mt-8 md:mt-16 xl:mx-auto xl:max-w-[1440px] flex justify-center items-center px-4 xl:px-0'>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  const bannersArray = Array.isArray(banners) ? banners : [];

  if (bannersArray.length === 0) {
    return null;
  }

  return (
    <div className='w-full mt-8 md:mt-16 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
        <div className='flex flex-col sm:flex-row justify-between items-center w-full gap-3 md:gap-4'>
            {bannersArray.slice(0, 2).map((banner, index) => (
                <div key={banner.id} className='w-full sm:w-[49%] h-28 md:h-40 relative overflow-hidden rounded-lg'>
                    <img 
                        className='w-full h-full object-cover' 
                        src={`${API_ENDPOINT}${banner.imageUrl}`} 
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