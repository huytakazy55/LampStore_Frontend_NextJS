"use client";

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { setCurrentBar, setLeftBar } from '@/redux/slices/leftBarAdminSlice';
import { jwtDecode } from 'jwt-decode';
import UserManage from '@/services/UserManage';

const LeftBar = () =>
{
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const leftBar = useSelector((state) => state.leftbar.leftbar);
    const currentBar = useSelector((state) => state.leftbar.currentBar);
    const { themeColors } = useContext(ThemeContext);
    const [userMenus, setUserMenus] = useState([]);
    const [loadingMenus, setLoadingMenus] = useState(true);

    const userRoles = useMemo(() =>
    {
        if (typeof window === 'undefined') return [];
        const token = localStorage.getItem('token');
        if (!token) return [];
        try
        {
            const decoded = jwtDecode(token);
            const roleClaim = decoded.role;
            return Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
        } catch (error)
        {
            console.error('Cannot decode token roles:', error);
            return [];
        }
    }, []);

    useEffect(() =>
    {
        const fetchUserMenus = async () =>
        {
            try
            {
                const menus = await UserManage.GetUserMenus();
                setUserMenus(menus.$values || menus || []);
            } catch (error)
            {
                console.error('Cannot load user menus, fallback to role-based menu:', error);
            } finally
            {
                setLoadingMenus(false);
            }
        };

        fetchUserMenus();
    }, []);

    const menuItems = [
        { name: "HomePage", icon: "bxs-home", path: "/admin", roles: null },
        { name: "Analytics", icon: "bxs-chart", path: "/admin/analytics", roles: ["Administrator"] },
        { name: "VisitorMap", icon: "bxs-map", path: "/admin/visitor-map", roles: ["Administrator"] },
        { name: "Users", icon: "bxs-user", path: "/admin/users", roles: ["Administrator"] },
        { name: "Roles", icon: "bxs-shield-alt-2", path: "/admin/roles", roles: ["Administrator"] },
        { name: "Category", icon: "bxs-category", path: "/admin/category", roles: ["Administrator", "Manager", "Warehouse staff"] },
        { name: "Tags", icon: "bxs-tag", path: "/admin/tags", roles: ["Administrator", "Manager"] },
        { name: "Banners", icon: "bxs-image", path: "/admin/banners", roles: ["Administrator", "Manager"] },
        { name: "Flash Sale", icon: "bxs-bolt", path: "/admin/flashsales", roles: ["Administrator", "Manager"] },
        { name: "Discount", icon: "bxs-purchase-tag", path: "/admin/discounts", roles: ["Administrator", "Manager"] },
        { name: "News", icon: "bxs-news", path: "/admin/news", roles: ["Administrator", "Manager"] },
        { name: "Products", icon: "bxs-package", path: "/admin/products", roles: ["Administrator", "Manager", "Warehouse staff"] },
        { name: "Orders", icon: "bxs-store-alt", path: "/admin/orders", roles: ["Administrator", "Manager", "Accountant"] },
        { name: "Chat", icon: "bxs-chat", path: "/admin/chat", roles: null },
        { name: "Delivery", icon: "bxs-book-content", path: "/admin/delivery", roles: ["Administrator", "Manager", "Warehouse staff"] },
        { name: "Setting", icon: "bxs-cog", path: "/admin/settings", roles: ["Administrator"] },
    ];

    const visibleMenuItems = useMemo(() =>
    {
        if (!loadingMenus && userMenus && userMenus.length > 0)
        {
            return menuItems.filter(item =>
                userMenus.includes(item.name) ||
                (["Analytics", "VisitorMap"].includes(item.name) && userRoles.includes("Administrator")) ||
                (item.name === "News" && userRoles.includes("Administrator")) ||
                (item.name === "Flash Sale" && userRoles.some(r => ["Administrator", "Manager"].includes(r))) ||
                (item.name === "Discount" && userRoles.some(r => ["Administrator", "Manager"].includes(r)))
            );
        }

        return menuItems.filter(item =>
        {
            if (!item.roles || item.roles.length === 0) return true;
            return item.roles.some(r => userRoles.includes(r));
        });
    }, [loadingMenus, userMenus, userRoles]);

    const handleMenuClick = (itemName) =>
    {
        dispatch(setCurrentBar(itemName));
        if (window.innerWidth < 768)
        {
            dispatch(setLeftBar(true));
        }
    };

    const isCollapsed = leftBar;

    return (
        <div
            className={`relative flex h-full flex-col overflow-hidden transition-all duration-300
                ${isCollapsed
                    ? 'absolute w-0 md:relative md:w-[72px] -left-full md:left-0'
                    : 'fixed w-[70%] sm:w-1/2 md:relative md:w-60 left-0 top-16 md:top-0 bottom-0 z-40 md:z-auto'
                }`}
            style={{
                background: `linear-gradient(160deg, ${themeColors.EndColorLinear} 0%, ${themeColors.StartColorLinear} 100%)`,
            }}
        >
            {/* Dark overlay for depth & readability */}
            <div className="absolute inset-0 z-0 bg-black/15 pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 scrollbar-hide">
                <div className="min-h-9 px-3.5 pb-2 pt-3">
                    {!isCollapsed && <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-white/45">MENU</span>}
                </div>

                <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                    {visibleMenuItems.map((item, index) =>
                    {
                        const isActive = currentBar === item.name;
                        return (
                            <li key={item.name} className="animate-menuFadeIn" style={{ animationDelay: `${index * 0.03}s` }}>
                                <Link
                                    onClick={() => handleMenuClick(item.name)}
                                    className={`relative flex items-center gap-3 overflow-hidden rounded-[10px] px-3 py-[9px] text-[13.5px] font-medium no-underline transition-all duration-200
                                        ${isActive ? 'bg-white/[0.18] text-white font-semibold' : 'text-white/70 hover:bg-white/[0.12] hover:text-white'}
                                        ${isCollapsed ? 'justify-center p-2.5' : ''}`}
                                    to={item.path}
                                >
                                    {isActive && <div className="absolute left-0 top-[15%] bottom-[15%] w-[3px] rounded-r-[4px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-barSlideIn" />}

                                    <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg text-[17px] text-inherit transition-all duration-200 ${isActive ? 'scale-105 bg-white/15' : ''}`}>
                                        <i className={`bx ${item.icon}`} />
                                    </div>

                                    {!isCollapsed && (
                                        <span className="overflow-hidden whitespace-nowrap text-ellipsis">{t(item.name)}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom section */}
            {!isCollapsed && (
                <div className="relative z-10 shrink-0 border-t border-white/10 p-3">
                    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/10 p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-base text-white">
                            <i className='bx bxs-zap' />
                        </div>
                        <div className="flex flex-col gap-px overflow-hidden">
                            <span className="whitespace-nowrap text-xs font-semibold text-white/85">CapyLumine</span>
                            <span className="whitespace-nowrap text-[10px] text-white/45">Admin Panel v2.0</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftBar;
