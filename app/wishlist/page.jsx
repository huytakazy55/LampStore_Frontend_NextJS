"use client";


import dynamic from 'next/dynamic';

const WishlistContent = dynamic(
    () => import('@/components/user/WishlistPage/WishlistPage'),
    {
        ssr: false, loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
        )
    }
);

export default function WishlistPage() {
    return <WishlistContent />;
}
