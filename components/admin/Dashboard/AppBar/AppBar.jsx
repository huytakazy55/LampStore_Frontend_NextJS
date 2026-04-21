"use client";

import React, { useState, useContext, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setLeftBar } from '@/redux/slices/leftBarAdminSlice';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import AuthService from '@/services/AuthService';
import NotificationDropdown from './NotificationDropdown';
import './AppBar.css';

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

const AppBar = () => {
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
        <header className="appbar" style={{
            background: `linear-gradient(90deg, ${themeColors.EndColorLinear} 0%, ${themeColors.StartColorLinear} 100%)`,
        }}>
            {/* Dark overlay for depth */}
            <div className="appbar-overlay" />

            {/* Logo zone — visually bridges with sidebar */}
            <div className="appbar-logo-zone">
                <a href="/admin" className="appbar-brand">
                    <div className="appbar-logo">
                        <img src={Logo} alt="CapyLumine" />
                    </div>
                    <div className="appbar-brand-text">
                        <span className="appbar-brand-name">CapyLumine</span>
                        <span className="appbar-brand-sub">Admin Dashboard</span>
                    </div>
                </a>
            </div>

            {/* Divider */}
            <div className="appbar-divider" />

            {/* Main header area */}
            <div className="appbar-main">
                <button className="appbar-toggle" onClick={toggleHideLeftBar}>
                    <i className={`bx ${leftbar ? 'bx-menu' : 'bx-menu-alt-left'}`} />
                </button>

                <div className="appbar-spacer" />

                {/* Right: Actions */}
                <div className="appbar-actions">
                    {/* Theme Color Picker */}
                    <div className="appbar-action-item" ref={buttonColorRef} onClick={() => setShowColor(!showColor)}>
                        <div className="appbar-icon-btn">
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
                            <div ref={colorRef} className="appbar-dropdown appbar-dropdown-colors">
                                <div className="appbar-dropdown-header">Theme Color</div>
                                <div className="appbar-color-grid">
                                    {themePresets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            className="appbar-color-option"
                                            onClick={() => changeTheme({ StartColorLinear: preset.start, EndColorLinear: preset.end })}
                                            title={preset.name}
                                        >
                                            <div
                                                className="appbar-color-circle"
                                                style={{ background: `linear-gradient(135deg, ${preset.start}, ${preset.end})` }}
                                            />
                                            <span className="appbar-color-name">{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Language Picker */}
                    <div className="appbar-action-item" ref={buttonLanguageRef} onClick={() => setShowLanguage(!showLanguage)}>
                        <div className="appbar-icon-btn">
                            <img
                                className="appbar-lang-flag"
                                src={i18n.language === 'vi' ? VietNam : England}
                                alt="Language"
                            />
                        </div>
                        {showLanguage && (
                            <div ref={languageRef} className="appbar-dropdown">
                                <div className="appbar-dropdown-header">Language</div>
                                <button
                                    className={`appbar-dropdown-item ${i18n.language === 'vi' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('vi')}
                                >
                                    <img className="appbar-lang-flag-sm" src={VietNam} alt="VN" />
                                    <span>Tiếng Việt</span>
                                    {i18n.language === 'vi' && <i className='bx bx-check' />}
                                </button>
                                <button
                                    className={`appbar-dropdown-item ${i18n.language === 'en' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    <img className="appbar-lang-flag-sm" src={England} alt="EN" />
                                    <span>English</span>
                                    {i18n.language === 'en' && <i className='bx bx-check' />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <NotificationDropdown themeColors={themeColors} />

                    {/* Messages */}
                    <div className="appbar-action-item appbar-hidden-mobile">
                        <div className="appbar-icon-btn">
                            <i className='bx bx-envelope' />
                            <span className="appbar-badge" />
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="appbar-action-item" ref={buttonServiceRef} onClick={() => setShowUserService(!showUserService)}>
                        <div className="appbar-avatar" style={{
                            background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
                        }}>
                            <i className='bx bx-user' />
                        </div>
                        {showUserService && (
                            <div ref={serviceRef} className="appbar-dropdown appbar-dropdown-user">
                                <div className="appbar-dropdown-header">Account</div>
                                <button className="appbar-dropdown-item appbar-logout" onClick={Logout}>
                                    <i className='bx bx-log-out' />
                                    <span>Đăng xuất</span>
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