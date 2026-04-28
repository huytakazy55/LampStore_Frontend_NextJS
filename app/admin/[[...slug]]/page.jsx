"use client";


import dynamic from 'next/dynamic';
import PageLoader from '@/components/common/PageLoader';

// Admin Dashboard — fully client-side, uses antd heavily
const AdminDashboard = dynamic(
    () => import('@/components/admin/Dashboard/AdminDashboard/AdminDashboard'),
    {
        ssr: false, loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <PageLoader height="auto" />
            </div>
        )
    }
);

export default function AdminPage() {
    return <AdminDashboard />;
}
