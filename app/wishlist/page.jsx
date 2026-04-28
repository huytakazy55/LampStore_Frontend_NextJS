"use client";


import dynamic from 'next/dynamic';
import PageLoader from '@/components/common/PageLoader';

const WishlistContent = dynamic(
    () => import('@/components/user/WishlistPage/WishlistPage'),
    {
        ssr: false, loading: () => (
            <PageLoader height="100vh" />
        )
    }
);

export default function WishlistPage() {
    return <WishlistContent />;
}
