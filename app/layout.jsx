import React from 'react';
import './globals.css';

import ClientProviders from '@/components/providers/ClientProviders';
import AnalyticsTracker from '@/components/common/AnalyticsTracker';

export const metadata = {
    title: {
        default: 'CapyLumine - Đèn Ngủ & Đèn Trang Trí Cao Cấp | Giao Hàng Toàn Quốc',
        template: '%s | CapyLumine',
    },
    description: 'CapyLumine - Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Chuyên đèn ngủ dễ thương, đèn bàn học, đèn LED nghệ thuật, đèn anime. Giao hàng toàn quốc, đổi trả miễn phí 15 ngày.',
    metadataBase: new URL('https://capylumine.com'),
    keywords: ['đèn ngủ', 'đèn trang trí', 'đèn bàn học', 'đèn LED', 'đèn anime', 'đèn dễ thương', 'mua đèn online', 'CapyLumine', 'đèn capybara', 'đèn nghệ thuật'],
    openGraph: {
        type: 'website',
        locale: 'vi_VN',
        siteName: 'CapyLumine',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'CapyLumine - Đèn trang trí cao cấp',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@capylumine',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="dns-prefetch" href="https://capylumine.com" />
                <link rel="preconnect" href="https://capylumine.com" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Geist:wght@100..900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
                    rel="stylesheet"
                />
                {/* Slick Carousel */}
                <link
                    rel="preload"
                    href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
                    as="style"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"
                />
                <link
                    rel="preload"
                    href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"
                    as="style"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"
                />
            </head>
            <body className="font-poppins antialiased">
                <React.Suspense fallback={null}>
                    <AnalyticsTracker />
                </React.Suspense>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
