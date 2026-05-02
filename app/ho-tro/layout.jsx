"use client";

import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
    { href: '/ho-tro/gioi-thieu', label: 'Giới thiệu', icon: 'bx-info-circle' },
    { href: '/ho-tro/huong-dan-su-dung', label: 'Hướng dẫn sử dụng', icon: 'bx-book-open' },
    { href: '/ho-tro/huong-dan-chon-mua', label: 'Hướng dẫn chọn mua', icon: 'bx-cart' },
    { href: '/ho-tro/bao-hanh', label: 'Bảo hành sản phẩm', icon: 'bx-shield-quarter' },
    { href: '/ho-tro/van-chuyen-thanh-toan', label: 'Vận chuyển & thanh toán', icon: 'bx-package' },
    { href: '/ho-tro/chinh-sach-doi-tra', label: 'Chính sách đổi trả', icon: 'bx-transfer' },
    { href: '/ho-tro/dieu-khoan-su-dung', label: 'Điều khoản sử dụng', icon: 'bx-file' },
    { href: '/ho-tro/chinh-sach-bao-mat', label: 'Chính sách bảo mật', icon: 'bx-shield' },
];

export default function HoTroLayout({ children }) {
    const pathname = usePathname();

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            {/* Hero */}
            <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-hidden border-b border-amber-100 dark:border-gray-800">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-yellow-200/20 dark:bg-yellow-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                <div className="w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 py-10 md:py-14 relative z-10">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5">
                        <Link href="/" className="hover:text-amber-600 transition-colors font-medium">Trang chủ</Link>
                        <i className='bx bx-chevron-right text-xs' />
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Hỗ trợ khách hàng</span>
                    </nav>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                        Hỗ trợ <span className="text-amber-600 dark:text-amber-400">khách hàng</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
                        Tìm hiểu thông tin về cửa hàng, hướng dẫn mua sắm, chính sách bảo hành và đổi trả.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 py-8 md:py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="lg:w-72 shrink-0">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24">
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        <i className='bx bx-support text-lg' /> Danh mục hỗ trợ
                                    </h3>
                                </div>
                                <nav className="p-2">
                                    {sidebarLinks.map(link => (
                                        <Link key={link.href} href={link.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${pathname === link.href
                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-800/50'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-amber-600 dark:hover:text-amber-400'
                                                }`}>
                                            <i className={`bx ${link.icon} text-lg ${pathname === link.href ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Main content */}
                        <main className="flex-1 min-w-0">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-10">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
