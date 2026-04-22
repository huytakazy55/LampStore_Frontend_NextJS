import './globals.css';
import { Poppins } from 'next/font/google';

import ClientProviders from '@/components/providers/ClientProviders';

const poppins = Poppins({
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600'],
    display: 'swap',
    variable: '--font-poppins',
});

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
        <html lang="vi" className={poppins.variable} suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="dns-prefetch" href="https://capylumine.com" />
                <link rel="preconnect" href="https://capylumine.com" />
                {/* Preconnect to CDNs for faster resource loading */}
                <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
                {/* Boxicons - preload font to fix font-display */}
                <link
                    rel="preload"
                    href="https://unpkg.com/boxicons@2.1.4/fonts/boxicons.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preload"
                    href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
                    as="style"
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
            <body className={`${poppins.className} antialiased`}>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
