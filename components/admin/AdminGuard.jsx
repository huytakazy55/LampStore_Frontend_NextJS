"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import PageLoader from '@/components/common/PageLoader';

// Roles allowed into the admin dashboard shell at all.
// Kept in sync with the role sets referenced by components/admin/Dashboard/LeftBar/LeftBar.jsx
// (every non-null `roles` value used across its menuItems).
const ADMIN_ROLES = ['Administrator', 'Manager', 'Warehouse staff', 'Accountant'];

const getAuthorizedRoles = () => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (!decoded.exp || decoded.exp < currentTime) return [];

        const roleClaim = decoded.role;
        const roles = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
        return roles.filter((r) => ADMIN_ROLES.includes(r));
    } catch {
        return [];
    }
};

/**
 * AdminGuard — client-side route guard for the whole /admin/* section.
 *
 * The token lives in localStorage (not accessible to server components/middleware),
 * so this check is necessarily client-side. To avoid a flash-of-admin-content for
 * unauthorized visitors, `children` is only rendered AFTER the check passes — while
 * checking (or on failure, right before the redirect fires) we show a loading state.
 */
export default function AdminGuard({ children }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const authorizedRoles = getAuthorizedRoles();

        if (authorizedRoles.length === 0) {
            router.replace('/');
            return;
        }

        setIsAuthorized(true);
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <PageLoader height="auto" />
            </div>
        );
    }

    return children;
}
