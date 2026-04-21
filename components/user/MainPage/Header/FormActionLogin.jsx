"use client";

import React, { useState, useEffect, useRef } from 'react'
const avatar = '/images/Avatar.jpg'; import AuthService from '@/services/AuthService'
import { useDispatch } from 'react-redux'
import { logout as logoutAction } from '@/redux/slices/authSlice'
import { useNavigate } from '@/lib/router-compat'
import { useCart } from '@/contexts/CartContext'

const FormActionLogin = ({ toggleActionLogin, popupActionRef, setToggleActionLogin, setToggleProfile, buttonProfileRef }) =>
{
    const [token, setToken] = useState(null);
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        Email: '',
        ProfileAvatar: ''
    });

    useEffect(() =>
    {
        setToken(localStorage.getItem("token"));
    }, []);

    useEffect(() =>
    {
        if (toggleActionLogin && token)
        {
            AuthService.profile()
                .then((res) =>
                {
                    setProfileData({
                        Email: res?.email,
                        ProfileAvatar: res?.profileAvatar
                    });
                })
                .catch((error) =>
                {
                    console.error("Error fetching profile:", error);
                });
        }
    }, [toggleActionLogin, token]);

    const { clearCartOnLogout } = useCart();

    const handleLogout = async () =>
    {
        clearCartOnLogout();
        const result = await AuthService.logout();
        if (result)
        {
            dispatch(logoutAction());
            setToggleActionLogin(false);
            navigate('/');
        }
    }
    const handleProfileClick = () =>
    {
        setToggleActionLogin(false);
        setToggleProfile(true);
    }

    const menuItems = [
        { icon: 'bx-user-circle', label: 'Thông Tin Tài Khoản', onClick: handleProfileClick, ref: buttonProfileRef },
        { icon: 'bx-package', label: 'Đơn Hàng Của Tôi', onClick: () => { setToggleActionLogin(false); navigate('/my-orders'); } },
        { icon: 'bx-heart', label: 'Sản Phẩm Yêu Thích', onClick: () => { setToggleActionLogin(false); navigate('/wishlist'); } },
    ];

    return (
        <div ref={popupActionRef} onClick={(e) => e.stopPropagation()}
            className={`w-[280px] absolute -right-1 top-[56px] z-[1000] bg-white dark:bg-gray-900 rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.18)] border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-out ${toggleActionLogin ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2 pointer-events-none'}`}
            id='FormActionLogin'>

            {/* Profile Header */}
            <div className='relative px-5 pt-5 pb-4 bg-gradient-to-br from-rose-100 to-amber-100 dark:from-gray-800 dark:to-gray-800'>
                {/* Decorative circle */}
                <div className='absolute -top-6 -right-6 w-20 h-20 bg-rose-100/50 dark:bg-rose-900/10 rounded-full'></div>
                <div className='relative flex items-center gap-3'>
                    <div className='w-11 h-11 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-md flex-shrink-0'>
                        <img className='w-full h-full object-cover'
                            src={profileData.ProfileAvatar ? (profileData.ProfileAvatar.startsWith('http') ? profileData.ProfileAvatar : `${API_ENDPOINT}${profileData.ProfileAvatar}`) : avatar}
                            alt="Avatar" />
                    </div>
                    <div className='min-w-0'>
                        <p className='text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate'>
                            {profileData.Email || 'Cập nhật tài khoản'}
                        </p>
                        <p className='text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5'>
                            <span className='w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block'></span>
                            Đang hoạt động
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className='py-1.5 px-2'>
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        ref={item.ref || null}
                        onClick={item.onClick}
                        className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-rose-600 transition-colors duration-150 cursor-pointer'
                    >
                        <span className='w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors'>
                            <i className={`bx ${item.icon} text-lg text-gray-500 transition-colors`}></i>
                        </span>
                        <span className='font-medium transition-colors'>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className='mx-4 h-px bg-gray-100 dark:bg-gray-800'></div>

            {/* Logout */}
            <div className='py-1.5 px-2 pb-2'>
                <button
                    onClick={() => handleLogout()}
                    className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-colors duration-150 cursor-pointer'
                >
                    <span className='w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors'>
                        <i className='bx bx-log-out text-lg text-gray-400 transition-colors'></i>
                    </span>
                    <span className='font-medium transition-colors'>Đăng Xuất</span>
                </button>
            </div>
        </div>
    )
}

export default FormActionLogin