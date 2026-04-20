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

    const visibleMenuItems = useMemo(() =>
    {
        if (!loadingMenus && userMenus && userMenus.length > 0)
        {
            return menuItems.filter(item => userMenus.includes(item.name) || (item.name === "News" && userRoles.includes("Administrator")));
        }

        return menuItems.filter(item =>
        {
            if (!item.roles || item.roles.length === 0) return true;
            return item.roles.some(r => userRoles.includes(r));
        });
    }, [loadingMenus, userMenus, userRoles]);

    // Close sidebar on mobile when clicking a menu item
    const handleMenuClick = (itemName) =>
    {
        dispatch(setCurrentBar(itemName));
        // Close sidebar on mobile
        if (window.innerWidth < 768)
        {
            dispatch(setLeftBar(true));
        }
    };

    return (
        <div
            style={{
                background: `linear-gradient(0deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)`,
            }}
            className={`h-full border-r border-gray-300 transition-all duration-400 ease-linear overflow-hidden overflow-y-auto
                ${leftBar
                    ? 'w-0 md:w-[4.5rem] absolute md:relative -left-full md:left-0'
                    : 'w-[70%] sm:w-[50%] md:w-[13%] fixed md:relative left-0 top-16 bottom-0 z-40 md:z-auto'
                }`}
        >
            <ul className="p-3 md:p-4 text-white">
                {visibleMenuItems.map((item) => (
                    <Link
                        key={item.name}
                        onClick={() => handleMenuClick(item.name)}
                        className="left-10 text-white font-medium w-full md:w-52 transition-all duration-400 ease-in-out block"
                        to={item.path}
                    >
                        <li
                            className={`relative p-[10px] h-10 flex justify-start items-center rounded-md mb-2 cursor-pointer hover:bg-fuchsia-700/25 ${currentBar === item.name ? 'bg-fuchsia-700/25' : ''
                                }`}
                        >
                            <i
                                className={`bx ${item.icon} text-h3 mr-4 transition-all duration-400 ease-in-out ${leftBar ? 'md:flex md:justify-center md:items-center md:mr-40' : ''
                                    }`}
                            ></i>
                            <span className={`text-sm md:text-base whitespace-nowrap ${leftBar ? 'md:hidden' : ''}`}>{t(item.name)}</span>
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
};

export default LeftBar;