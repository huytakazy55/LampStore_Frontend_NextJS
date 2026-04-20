"use client";

import React, { useState, useContext, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
const Logo = '/images/Capylumine.png';const England = '/images/England-img.jpg';const VietNam = '/images/VietNam-icon.jpg';import { useDispatch } from 'react-redux';
import { setLeftBar } from '@/redux/slices/leftBarAdminSlice';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import AuthService from '@/services/AuthService';
import NotificationDropdown from './NotificationDropdown';

const AppBar = () =>
{
    const dispatch = useDispatch();

    const leftbar = useSelector(state => state.leftbar.leftbar);

    const toggleHideLeftBar = () =>
    {
        dispatch(setLeftBar(!leftbar));
    }

    const [showLanguage, setShowLanguage] = useState(false);
    const [showUserService, setShowUserService] = useState(false);
    const [showColor, setShowColor] = useState(false);
    const { themeColors, changeTheme } = useContext(ThemeContext);
    const languageRef = useRef(null);
    const colorRef = useRef(null);
    const serviceRef = useRef(null);
    const buttonColorRef = useRef(null);
    const buttonLanguageRef = useRef(null);
    const buttonServiceRef = useRef(null);
    const { i18n } = useTranslation();

    const changeLanguage = (lng) =>
    {
        i18n.changeLanguage(lng);
    };

    const toggleShowLanguage = () =>
    {
        setShowLanguage(!showLanguage);
    }

    const toggleShowColor = () =>
    {
        setShowColor(!showColor);
    }

    const toggleShowUserService = () =>
    {
        setShowUserService(!showUserService);
    }

    const handleClickOutside = (event, ref, buttonRef, functionRef) =>
    {
        if (ref.current && !ref.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target))
        {
            functionRef(false);
        }
    };
    useEffect(() =>
    {
        const handleClickOutsideClick = (event) =>
        {
            handleClickOutside(event, colorRef, buttonColorRef, setShowColor);
            handleClickOutside(event, languageRef, buttonLanguageRef, setShowLanguage);
            handleClickOutside(event, serviceRef, buttonServiceRef, setShowUserService);
        }

        document.addEventListener('click', handleClickOutsideClick, true);
        return () =>
        {
            document.removeEventListener('click', handleClickOutsideClick, true);
        };
    }, []);

    const Logout = () =>
    {
        AuthService.logout()
    }

    return (
        <div className='w-full h-16 bg-white flex justify-between items-center px-3 md:px-8 border-b border-gray-300'>
            <div className='w-auto md:w-[15%] h-full flex-shrink-0'>
                <img className='max-h-full h-12 md:h-full' src={Logo} alt="" />
            </div>
            <div onClick={() => toggleHideLeftBar()} className='text-h2 flex justify-center items-center cursor-pointer ml-2 md:ml-0'>
                <i className='bx bx-menu'></i>
            </div>
            <div className='flex-1 hidden md:block'>

            </div>
            <div className='flex justify-center items-center gap-3 md:gap-8'>
                {/* Color picker - hidden on small mobile */}
                <div ref={buttonColorRef} onClick={toggleShowColor} className='hidden sm:block w-10 md:w-12 h-4 md:h-5 rounded-[10%] cursor-pointer relative'>
                    <div style={{ background: `linear-gradient(0deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)` }} className='w-full h-full rounded-[10%]'></div>
                    <div ref={colorRef} style={{ background: `linear-gradient(0deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)` }} className={`absolute top-7 right-1 w-44 md:w-52 py-3 md:py-4 px-4 md:px-5 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl z-[1000] ${showColor ? 'block' : 'hidden'}`}>
                        <div className='flex justify-start gap-3 md:gap-4 items-center font-medium py-1 px-2 md:px-3 rounded-md text-white hover:bg-fuchsia-700/25 text-xs md:text-sm' onClick={() => changeTheme({ StartColorLinear: 'rgba(136,70,249,1)', EndColorLinear: 'rgba(255,175,0,1)' })}>
                            <div style={{ backgroundImage: "linear-gradient(0deg, rgba(136,70,249,1) 0%, rgba(255,175,0,1) 100%)", }} className="w-5 h-5 md:w-6 md:h-6 rounded-[50%] relative flex-shrink-0"></div>
                            <div>Defaul Color</div>
                        </div>
                        <div className='flex justify-start gap-3 md:gap-4 items-center font-medium py-1 px-2 md:px-3 rounded-md text-white hover:bg-fuchsia-700/25 text-xs md:text-sm' onClick={() => changeTheme({ StartColorLinear: 'rgba(100,90,255,1)', EndColorLinear: 'rgba(255,100,100,1)' })}>
                            <div style={{ backgroundImage: "linear-gradient(0deg, rgba(100,90,255,1) 0%, rgba(255,100,100,1) 100%)", }} className="w-5 h-5 md:w-6 md:h-6 rounded-[50%] relative flex-shrink-0"></div>
                            <div>Red - Blue</div>
                        </div>
                        <div className='flex justify-start gap-3 md:gap-4 items-center font-medium py-1 px-2 md:px-3 rounded-md text-white hover:bg-fuchsia-700/25 text-xs md:text-sm' onClick={() => changeTheme({ StartColorLinear: 'rgba(112,254,255,1)', EndColorLinear: 'rgba(80,80,255,1)' })}>
                            <div style={{ backgroundImage: "linear-gradient(0deg, rgba(112,255,255,1) 0%, rgba(80,80,255,1) 100%)", }} className="w-5 h-5 md:w-6 md:h-6 rounded-[50%] relative flex-shrink-0"></div>
                            <div>Blue - Cyan</div>
                        </div>
                        <div className='flex justify-start gap-3 md:gap-4 items-center font-medium py-1 px-2 md:px-3 rounded-md text-white hover:bg-fuchsia-700/25 text-xs md:text-sm' onClick={() => changeTheme({ StartColorLinear: 'rgba(247,255,60,1)', EndColorLinear: 'rgba(250,74,255,1)' })}>
                            <div style={{ backgroundImage: "linear-gradient(0deg, rgba(247,255,60,1) 0%, rgba(250,74,255,1) 100%)", }} className="w-5 h-5 md:w-6 md:h-6 rounded-[50%] relative flex-shrink-0"></div>
                            <div>Pink - Yellow</div>
                        </div>
                        <div className='flex justify-start gap-3 md:gap-4 items-center font-medium py-1 px-2 md:px-3 rounded-md text-white hover:bg-fuchsia-700/25 text-xs md:text-sm' onClick={() => changeTheme({ StartColorLinear: 'rgba(145,0,255,1)', EndColorLinear: 'rgba(0,255,149,1)' })}>
                            <div style={{ backgroundImage: "linear-gradient(0deg, rgba(145,0,255,1) 0%, rgba(0,255,149,1) 100%)", }} className="w-5 h-5 md:w-6 md:h-6 rounded-[50%] relative flex-shrink-0"></div>
                            <div>Green - Puple</div>
                        </div>
                        <div className='flex justify-start gap-3 md:gap-4 items-center font-medium py-1 px-2 md:px-3 rounded-md text-white hover:bg-fuchsia-700/25 text-xs md:text-sm' onClick={() => changeTheme({ StartColorLinear: 'rgba(150,150,150,1)', EndColorLinear: 'rgba(0,0,0,1)' })}>
                            <div style={{ backgroundImage: "linear-gradient(0deg, rgba(150,150,150,1) 0%, rgba(0,0,0,1) 100%)", }} className="w-5 h-5 md:w-6 md:h-6 rounded-[50%] relative flex-shrink-0"></div>
                            <div>Black - Light</div>
                        </div>
                    </div>
                </div>

                <div ref={buttonLanguageRef} onClick={toggleShowLanguage} className='relative flex w-7 md:w-9 h-4 md:h-5 cursor-pointer flex-shrink-0'>
                    <img className='w-full h-full' src={i18n.language == 'vi' ? VietNam : England} alt="" />
                    <div ref={languageRef} style={{ background: `linear-gradient(0deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)` }} className={`absolute top-7 right-1 w-44 md:w-52 py-3 md:py-4 px-4 md:px-5 bg-orange-500 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl z-[1000] ${showLanguage ? 'block' : 'hidden'}`}>
                        <div onClick={() => changeLanguage('vi')} className='flex justify-start items-center gap-2 md:gap-3 font-semibold text-white py-1 px-2 rounded-sm cursor-pointer hover:bg-fuchsia-700/25 mb-1 text-xs md:text-sm'>
                            <img className='w-6 md:w-8 flex-shrink-0' src={VietNam} alt="" /> Tiếng việt
                            {i18n.language == 'vi' ? <span className="text-white text-base md:text-h3"><i className='bx bx-check-double'></i></span> : ''}
                        </div>
                        <div onClick={() => changeLanguage('en')} className='flex justify-start items-center gap-2 md:gap-3 font-semibold text-white py-1 px-2 rounded-sm cursor-pointer hover:bg-fuchsia-700/25 text-xs md:text-sm'>
                            <img className='w-6 md:w-8 flex-shrink-0' src={England} alt="" /> English
                            {i18n.language == 'en' ? <span className="text-white text-base md:text-h3"><i className='bx bx-check-double'></i></span> : ''}
                        </div>
                    </div>
                </div>
                <NotificationDropdown themeColors={themeColors} />
                <div className='hidden sm:flex justify-center items-center relative after:absolute after:w-2 after:h-2 after:bg-red-700 after:rounded-[50%] after:-right-[2px] after:top-[3px]'>
                    <i className='bx bx-envelope text-lg md:text-h2 cursor-pointer mt-1'></i>
                </div>
                <div className='relative' ref={buttonServiceRef} onClick={toggleShowUserService}>
                    <i className='bx bx-user text-lg md:text-h2 cursor-pointer mt-1 flex ml-2 md:ml-12'></i>
                    <div ref={serviceRef} className={`absolute z-[1000] w-36 md:w-40 top-8 right-0 py-1 px-2 md:px-3 rounded-tl-xl rounded-br-xl ${showUserService ? 'block' : 'hidden'}`} style={{ background: `linear-gradient(0deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)` }}>
                        <ul>
                            <li className='flex justify-start items-center gap-2 md:gap-3 py-1 px-2 md:px-3 rounded-md text-white hover:bg-violet-700/25 text-xs md:text-sm' onClick={() => Logout()}>
                                <i className="bx bx-exit text-lg md:text-h2 cursor-pointer ml-0 mt-0"></i>
                                <a className='font-medium text-inherit' href="#">Đăng xuất</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppBar