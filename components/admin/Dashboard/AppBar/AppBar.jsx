"use client";

import React, { useState, useContext, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setLeftBar } from '@/redux/slices/leftBarAdminSlice';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import AuthService from '@/services/AuthService';
import NotificationDropdown from './NotificationDropdown';

const Logo = '/images/Capylumine.png';
const England = '/images/England-img.jpg';
const VietNam = '/images/VietNam-icon.jpg';

const themePresets = [
    { name: 'Amber Gold', start: 'rgba(136,70,249,1)', end: 'rgba(255,175,0,1)' },
    { name: 'Coral Flame', start: 'rgba(100,90,255,1)', end: 'rgba(255,100,100,1)' },
    { name: 'Ocean Blue', start: 'rgba(112,254,255,1)', end: 'rgba(80,80,255,1)' },
    { name: 'Neon Bloom', start: 'rgba(247,255,60,1)', end: 'rgba(250,74,255,1)' },
    { name: 'Emerald Night', start: 'rgba(145,0,255,1)', end: 'rgba(0,255,149,1)' },
    { name: 'Noir Classic', start: 'rgba(150,150,150,1)', end: 'rgba(0,0,0,1)' },
];

const AppBar = ({ onOpenAccount }) => {
    const dispatch = useDispatch();
    const leftbar = useSelector(state => state.leftbar.leftbar);

    const toggleHideLeftBar = () => dispatch(setLeftBar(!leftbar));

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
    const changeLanguage = (lng) => i18n.changeLanguage(lng);
    const openAccountProfile = (event) => {
        event.stopPropagation();
        setShowUserService(false);
        onOpenAccount?.();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colorRef.current && !colorRef.current.contains(event.target) && buttonColorRef.current && !buttonColorRef.current.contains(event.target))
                setShowColor(false);
            if (languageRef.current && !languageRef.current.contains(event.target) && buttonLanguageRef.current && !buttonLanguageRef.current.contains(event.target))
                setShowLanguage(false);
            if (serviceRef.current && !serviceRef.current.contains(event.target) && buttonServiceRef.current && !buttonServiceRef.current.contains(event.target))
                setShowUserService(false);
        };

        document.addEventListener('click', handleClickOutside, true);
        return () => document.removeEventListener('click', handleClickOutside, true);
    }, []);

    const Logout = () => AuthService.logout();

    return (
        <header className="relative z-50 flex h-16 w-full items-center p-0" style={{
            background: `linear-gradient(90deg, ${themeColors.EndColorLinear} 0%, ${themeColors.StartColorLinear} 100%)`,
        }}>
            {/* Dark overlay for depth */}
            <div className="absolute inset-0 z-0 bg-black/15 pointer-events-none" />

            {/* Logo zone — visually bridges with sidebar */}
            <div className="relative z-10 flex h-full shrink-0 items-center bg-black/[0.12] px-4 md:w-60 md:px-5">
                <a href="/admin" className="flex items-center gap-2.5 no-underline">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                        <img src={Logo} alt="CapyLumine" className="h-full w-full object-cover" />
                    </div>
                    <div className="hidden flex-col sm:flex">
                        <span className="text-base font-bold leading-tight tracking-[-0.3px] text-white">CapyLumine</span>
                        <span className="text-[9px] font-medium uppercase tracking-[1px] text-white/55">Admin Dashboard</span>
                    </div>
                </a>
            </div>

            {/* Divider */}
            <div className="relative z-10 h-7 w-px shrink-0 bg-white/15" />

            {/* Main header area */}
            <div className="relative z-10 flex h-full flex-1 items-center gap-3 px-3 md:px-6">
                <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xl text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white"
                    onClick={toggleHideLeftBar}
                    aria-label={leftbar ? 'Ẩn thanh bên' : 'Hiện thanh bên'}
                >
                    <i className={`bx ${leftbar ? 'bx-menu' : 'bx-menu-alt-left'}`} />
                </button>

                <div className="flex-1" />

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5 md:gap-3">
                    {/* Theme Color Picker */}
                    <div className="relative cursor-pointer" ref={buttonColorRef} onClick={() => setShowColor(!showColor)}>
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-lg text-white/75 no-underline transition-all duration-200 hover:border-white/25 hover:bg-white/[0.18] hover:text-white">
                            <div
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                }}
                            />
                        </div>
                        {showColor && (
                            <div ref={colorRef} className="absolute right-0 top-[calc(100%+8px)] z-[1000] min-w-[200px] rounded-xl border border-white/[0.08] bg-[#1a1b23] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)] animate-dropdownEnter">
                                <div className="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[1px] text-white/25">Theme Color</div>
                                <div className="flex flex-col gap-0.5">
                                    {themePresets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            className="group flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-[7px] transition-all duration-150 hover:bg-white/[0.06]"
                                            onClick={() => changeTheme({ StartColorLinear: preset.start, EndColorLinear: preset.end })}
                                            title={preset.name}
                                        >
                                            <div
                                                className="h-[22px] w-[22px] shrink-0 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-transform duration-200 group-hover:scale-[1.15]"
                                                style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }}
                                            />
                                            <span className="whitespace-nowrap text-[12.5px] font-medium text-white/50 group-hover:text-white/[0.85]">{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Language Picker */}
                    <div className="relative cursor-pointer" ref={buttonLanguageRef} onClick={() => setShowLanguage(!showLanguage)}>
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-lg text-white/75 no-underline transition-all duration-200 hover:border-white/25 hover:bg-white/[0.18] hover:text-white">
                            <img
                                className="h-3.5 w-5 rounded-sm object-cover"
                                src={i18n.language === 'vi' ? VietNam : England}
                                alt="Language"
                            />
                        </div>
                        {showLanguage && (
                            <div ref={languageRef} className="absolute right-0 top-[calc(100%+8px)] z-[1000] min-w-[180px] rounded-xl border border-white/[0.08] bg-[#1a1b23] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)] animate-dropdownEnter">
                                <div className="px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[1px] text-white/25">Language</div>
                                <button
                                    className={`flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-2 text-left text-[13px] font-medium transition-all duration-150 hover:bg-white/[0.06] hover:text-white ${i18n.language === 'vi' ? 'text-white' : 'text-white/60'}`}
                                    onClick={() => changeLanguage('vi')}
                                >
                                    <img className="h-4 w-6 shrink-0 rounded-[3px] object-cover" src={VietNam} alt="VN" />
                                    <span>Tiếng Việt</span>
                                    {i18n.language === 'vi' && <i className="bx bx-check ml-auto text-lg text-green-500" />}
                                </button>
                                <button
                                    className={`flex w-full items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-2 text-left text-[13px] font-medium transition-all duration-150 hover:bg-white/[0.06] hover:text-white ${i18n.language === 'en' ? 'text-white' : 'text-white/60'}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    <img className="h-4 w-6 shrink-0 rounded-[3px] object-cover" src={England} alt="EN" />
                                    <span>English</span>
                                    {i18n.language === 'en' && <i className="bx bx-check ml-auto text-lg text-green-500" />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <NotificationDropdown themeColors={themeColors} />

                    {/* User Menu */}
                    <div className="relative cursor-pointer" ref={buttonServiceRef} onClick={() => setShowUserService(!showUserService)}>
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08] text-lg text-white/75 no-underline transition-all duration-200 hover:border-white/25 hover:bg-white/[0.18] hover:text-white">
                            <i className="bx bx-user text-xl" />
                        </div>
                        {showUserService && (
                            <div
                                ref={serviceRef}
                                className="absolute right-0 top-[calc(100%+8px)] z-[1000] min-w-[230px] rounded-[14px] bg-gradient-to-b from-[rgba(26,27,35,0.98)] to-[rgba(22,23,31,0.98)] p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)] animate-dropdownEnter"
                            >
                                <div className="px-3 pb-2.5 pt-2 text-[11px] font-semibold uppercase tracking-[2.4px] text-white/[0.36]">Account</div>
                                <button
                                    className="flex min-h-[42px] w-full items-center gap-3 rounded-[10px] border-none bg-transparent px-3 py-2.5 text-left text-sm font-bold text-white/[0.72] transition-all duration-150 hover:bg-white/[0.06] hover:text-white"
                                    onClick={openAccountProfile}
                                >
                                    <i className="bx bx-user-circle w-[22px] shrink-0 grow-0 text-center text-xl text-white/[0.72]" />
                                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Thông tin tài khoản</span>
                                </button>
                                <button
                                    className="group flex min-h-[42px] w-full items-center gap-3 rounded-[10px] border-none bg-transparent px-3 py-2.5 text-left text-sm font-bold text-white/[0.72] transition-all duration-150 hover:bg-white/[0.06] hover:text-red-500"
                                    onClick={Logout}
                                >
                                    <i className="bx bx-log-out w-[22px] shrink-0 grow-0 text-center text-xl text-white/[0.72] transition-colors duration-150 group-hover:text-red-500" />
                                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AppBar
