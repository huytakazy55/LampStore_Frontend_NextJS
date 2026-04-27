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
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '32x32' },
        ],
        apple: [
            { url: '/Capylumine.png', sizes: '512x512', type: 'image/png' },
        ],
    },
};

export default function RootLayout({ children })
{
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="dns-prefetch" href="https://capylumine.com" />
                {/* Preload local Geist font */}
                <link rel="preload" href="/fonts/geist/GeistVF.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                {/* Preload LCP banner image */}
                <link rel="preload" href="/images/banner_new_03.webp" as="image" type="image/webp" fetchPriority="high" />
                {/* Boxicons — local with font-display:swap */}
                <link rel="stylesheet" href="/css/boxicons.min.css" />
                {/* Slick Carousel — local */}
                <link rel="stylesheet" href="/css/slick.css" />
                <link rel="stylesheet" href="/css/slick-theme.css" />
            </head>
            <body className="font-sans antialiased">
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
