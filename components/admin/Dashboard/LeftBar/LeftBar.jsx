"use client";

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { setCurrentBar, setLeftBar } from '@/redux/slices/leftBarAdminSlice';
import { jwtDecode } from 'jwt-decode';
import UserManage from '@/services/UserManage';
import './LeftBar.css';

const LeftBar = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const leftBar = useSelector((state) => state.leftbar.leftbar);
    const currentBar = useSelector((state) => state.leftbar.currentBar);
    const { themeColors } = useContext(ThemeContext);
    const [userMenus, setUserMenus] = useState([]);
    const [loadingMenus, setLoadingMenus] = useState(true);

    const userRoles = useMemo(() => {
        const token = localStorage.getItem('token');
        if (!token) return [];
        try {
            const decoded = jwtDecode(token);
            const roleClaim = decoded.role;
            return Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
        } catch (error) {
            console.error('Cannot decode token roles:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        const fetchUserMenus = async () => {
            try {
                const menus = await UserManage.GetUserMenus();
                setUserMenus(menus.$values || menus || []);
            } catch (error) {
                console.error('Cannot load user menus, fallback to role-based menu:', error);
            } finally {
                setLoadingMenus(false);
            }
        };

        fetchUserMenus();
    }, []);

    const menuItems = [
        { name: "HomePage", icon: "bxs-home", path: "/admin", roles: null },
        { name: "Users", icon: "bxs-user", path: "/admin/users", roles: ["Administrator"] },
        { name: "Roles", icon: "bxs-shield-alt-2", path: "/admin/roles", roles: ["Administrator"] },
        { name: "Category", icon: "bxs-category", path: "/admin/category", roles: ["Administrator", "Manager", "Warehouse staff"] },
        { name: "Tags", icon: "bxs-tag", path: "/admin/tags", roles: ["Administrator", "Manager"] },
        { name: "Banners", icon: "bxs-image", path: "/admin/banners", roles: ["Administrator", "Manager"] },
        { name: "News", icon: "bxs-news", path: "/admin/news", roles: ["Administrator", "Manager"] },
        { name: "Products", icon: "bxs-package", path: "/admin/products", roles: ["Administrator", "Manager", "Warehouse staff"] },
        { name: "Orders", icon: "bxs-store-alt", path: "/admin/orders", roles: ["Administrator", "Manager", "Accountant"] },
        { name: "Chat", icon: "bxs-chat", path: "/admin/chat", roles: null },
        { name: "Delivery", icon: "bxs-book-content", path: "/admin/delivery", roles: ["Administrator", "Manager", "Warehouse staff"] },
        { name: "Setting", icon: "bxs-cog", path: "/admin/settings", roles: ["Administrator"] },
    ];

    const visibleMenuItems = useMemo(() => {
        if (!loadingMenus && userMenus && userMenus.length > 0) {
            return menuItems.filter(item => userMenus.includes(item.name) || (item.name === "News" && userRoles.includes("Administrator")));
        }

        return menuItems.filter(item => {
            if (!item.roles || item.roles.length === 0) return true;
            return item.roles.some(r => userRoles.includes(r));
        });
    }, [loadingMenus, userMenus, userRoles]);

    const handleMenuClick = (itemName) => {
        dispatch(setCurrentBar(itemName));
        if (window.innerWidth < 768) {
            dispatch(setLeftBar(true));
        }
    };

    const isCollapsed = leftBar;

    return (
        <div
            className={`sidebar-container
                ${isCollapsed
                    ? 'sidebar-collapsed absolute md:relative -left-full md:left-0'
                    : 'sidebar-expanded fixed md:relative left-0 top-16 md:top-0 bottom-0 z-40 md:z-auto'
                }`}
            style={{
                background: `linear-gradient(160deg, ${themeColors.EndColorLinear} 0%, ${themeColors.StartColorLinear} 100%)`,
            }}
        >
            {/* Dark overlay for depth & readability */}
            <div className="sidebar-overlay" />

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">
                    {!isCollapsed && <span>MENU</span>}
                </div>

                <ul className="sidebar-menu">
                    {visibleMenuItems.map((item, index) => {
                        const isActive = currentBar === item.name;
                        return (
                            <li key={item.name} className="sidebar-menu-item" style={{ animationDelay: `${index * 0.03}s` }}>
                                <Link
                                    onClick={() => handleMenuClick(item.name)}
                                    className={`sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
                                    to={item.path}
                                >
                                    {isActive && <div className="sidebar-active-bar" />}

                                    <div className={`sidebar-icon-wrapper ${isActive ? 'active' : ''}`}>
                                        <i className={`bx ${item.icon}`} />
                                    </div>

                                    {!isCollapsed && (
                                        <span className="sidebar-label">{t(item.name)}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom section */}
            {!isCollapsed && (
                <div className="sidebar-footer">
                    <div className="sidebar-footer-card">
                        <div className="sidebar-footer-icon">
                            <i className='bx bxs-zap' />
                        </div>
                        <div className="sidebar-footer-text">
                            <span className="sidebar-footer-title">CapyLumine</span>
                            <span className="sidebar-footer-subtitle">Admin Panel v2.0</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftBar;