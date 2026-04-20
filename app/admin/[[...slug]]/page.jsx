"use client";


import dynamic from 'next/dynamic';

// Admin Dashboard — fully client-side, uses antd heavily
const AdminDashboard = dynamic(
    () => import('@/components/admin/Dashboard/AdminDashboard/AdminDashboard'),
    {
        ssr: false, loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải Admin Dashboard...</p>
                </div>
            </div>
        )
    }
);

export default function AdminPage() {
    return <AdminDashboard />;
}
