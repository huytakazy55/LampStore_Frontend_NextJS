"use client";

import React, { useEffect, useState } from 'react'
import AuthService from '@/services/AuthService';
import GuestProfileService from '@/services/GuestProfileService';

const TopBar = () =>
{
    const [name, setName] = useState('');
    const [token, setToken] = useState(null);
    const [guestCode, setGuestCode] = useState(null);
    const [showMap, setShowMap] = useState(false);

    useEffect(() =>
    {
        const t = localStorage.getItem('token');
        setToken(t);
        if (!t)
        {
            setGuestCode(GuestProfileService.getGuestCode());
        }
    }, []);

    useEffect(() =>
    {
        if (token)
        {
            AuthService.profile()
                .then((res) =>
                {
                    setName(res.fullName);
                })
                .catch((error) =>
                {
                    console.error("Error fetching profile:", error);
                });
        }
    }, [token]);
    return (
        <div className='h-10 md:h-12 bg-gray-100 border-b border-gray-300'>
            <nav className='xl:mx-auto xl:max-w-[1440px] flex justify-between items-center h-full px-4 xl:px-0'>
                <div className='hidden sm:block'>
                    <p className='text-xs md:text-sm'>Welcome to CapyLumine</p>
                </div>
                {/* Mobile: chỉ hiện Welcome ngắn */}
                <div className='sm:hidden'>
                    <p className='text-xs'>Welcome to CapyLumine</p>
                </div>
                <div>
                    <ul className='flex justify-between gap-2 md:gap-4 text-xs md:text-sm'>
                        <li className='hidden md:flex cursor-pointer items-center gap-1 hover:text-primary-600 transition-colors' onClick={() => setShowMap(true)}><i className='bx bx-map text-base md:text-h3 relative top-[1px]' ></i> Store Locator</li>
                        <li className='hidden md:block text-slate-300 relative top-[3px]'>|</li>
                        <li className='hidden lg:flex cursor-pointer items-center gap-1'><i className='bx bx-rocket text-base md:text-h3 relative top-[1px]'></i> Track your order</li>
                        <li className='hidden lg:block text-slate-300 relative top-[3px]'>|</li>
                        <li className='cursor-pointer flex items-center gap-2'>
                            <div className='w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-[2px] border border-gray-400'>
                                <i className='bx bx-phone text-sm md:text-base'></i>
                            </div>
                            <div className='hidden sm:flex flex-col text-left'>
                                <span className='text-[9px] md:text-[10px] text-gray-500 leading-none mb-0.5'>Gọi ngay</span>
                                <span className='text-[11px] md:text-xs font-bold leading-none'>0969608810</span>
                            </div>
                        </li>
                        <li className='text-slate-300 relative top-[3px]'>|</li>
                        <li className='cursor-pointer flex items-center gap-1'><i className='bx bx-user text-base md:text-h3 relative top-[1px]'></i> <span className='truncate max-w-[80px] sm:max-w-none'>{name ? name : (guestCode ? `Khách: ${guestCode}` : 'My Account')}</span></li>
                    </ul>
                </div>
            </nav>

            {/* Google Map Popup */}
            {showMap && (
                <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity' onClick={() => setShowMap(false)}>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl w-[95%] max-w-6xl h-[60vh] md:h-[70vh] p-5 relative shadow-2xl scale-100 transition-transform' onClick={(e) => e.stopPropagation()}>
                        <button
                            className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors z-10'
                            onClick={() => setShowMap(false)}
                            title='Đóng bản đồ'
                        >
                            <i className='bx bx-x text-xl'></i>
                        </button>
                        <h3 className='text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-primary-600 dark:text-primary-400'>
                            <i className='bx bx-map text-2xl'></i> Vị trí Cửa hàng CapyLumine
                        </h3>
                        <div className='w-full h-[calc(100%-3.5rem)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700'>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1862.3516020899583!2d105.8194656114243!3d21.004531067309728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad3745ecd1cd%3A0x7d736e82eec7e4ea!2sPaimon%20Shop!5e0!3m2!1svi!2s!4v1783758217361!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TopBar