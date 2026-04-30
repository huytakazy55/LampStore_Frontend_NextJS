"use client";

import React, { useEffect, useState } from 'react'
import AuthService from '@/services/AuthService';
import GuestProfileService from '@/services/GuestProfileService';

const TopBar = () => {
    const [name, setName] = useState('');
    const [token, setToken] = useState(null);
    const [guestCode, setGuestCode] = useState(null);

    useEffect(() => {
        const t = localStorage.getItem('token');
        setToken(t);
        if (!t) {
            setGuestCode(GuestProfileService.getGuestCode());
        }
    }, []);

    useEffect(() => {
        if (token) {
            AuthService.profile()
                .then((res) => {
                    setName(res.fullName);
                })
                .catch((error) => {
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
                        <li className='hidden md:flex cursor-pointer items-center gap-1'><i className='bx bx-map text-base md:text-h3 relative top-[1px]' ></i> Store Locator</li>
                        <li className='hidden md:block text-slate-300 relative top-[3px]'>|</li>
                        <li className='hidden lg:flex cursor-pointer items-center gap-1'><i className='bx bx-rocket text-base md:text-h3 relative top-[1px]'></i> Track your order</li>
                        <li className='hidden lg:block text-slate-300 relative top-[3px]'>|</li>
                        <li className='cursor-pointer flex items-center gap-1'><i className='bx bx-shopping-bag text-base md:text-h3 relative top-[1px]'></i> <span className='hidden sm:inline'>Shop</span></li>
                        <li className='text-slate-300 relative top-[3px]'>|</li>
                        <li className='cursor-pointer flex items-center gap-1'><i className='bx bx-user text-base md:text-h3 relative top-[1px]'></i> <span className='truncate max-w-[80px] sm:max-w-none'>{name ? name : (guestCode ? `Khách: ${guestCode}` : 'My Account')}</span></li>
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default TopBar