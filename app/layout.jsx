import React from 'react';
import localFont from 'next/font/local';
import './globals.css';
import '../public/css/boxicons.min.css';
import '../public/css/slick.css';
import '../public/css/slick-theme.css';

const geistFont = localFont({
    src: '../public/fonts/geist/GeistVF.woff2',
    display: 'swap',
    variable: '--font-geist',
});

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
        title: 'CapyLumine - Đèn Ngủ & Đèn Trang Trí Cao Cấp',
        description: 'Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Đèn ngủ dễ thương, đèn bàn học, đèn LED nghệ thuật. Giao hàng toàn quốc, đổi trả miễn phí 15 ngày.',
        url: 'https://capylumine.com',
        type: 'website',
        locale: 'vi_VN',
        siteName: 'CapyLumine',
        images: [
            {
                url: 'https://capylumine.com/og-image.png',
                width: 1200,
                height: 630,
                alt: 'CapyLumine - Đèn trang trí cao cấp',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@capylumine',
        title: 'CapyLumine - Đèn Ngủ & Đèn Trang Trí Cao Cấp',
        description: 'Cửa hàng đèn trang trí cao cấp hàng đầu Việt Nam. Đèn ngủ, đèn bàn, đèn LED nghệ thuật.',
        images: ['https://capylumine.com/og-image.png'],
    },
    other: {
        'fb:app_id': '',
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
            </head>
            <body className={`${geistFont.variable} font-sans antialiased`}>
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
