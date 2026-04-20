"use client";


import { lazy, Suspense, useEffect } from 'react';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import { SiteContent } from '@/components/user/MainPage/SiteContent/SiteContent';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import NotificationService from '@/services/NotificationService';
import LazySection from '@/components/common/LazySection';
import ScrollTimeline from '@/components/common/ScrollTimeline';
import FloatingCart from '@/components/user/FloatingCart/FloatingCart';

// === Code Splitting: Lazy load các component nặng ===
const CategorySale = lazy(() => import('@/components/user/MainPage/CategorySale/CategorySale'));
const ProductCarousel = lazy(() => import('@/components/user/MainPage/ProductCarousel/ProductCarousel'));
const SectionProductCardCarousel = lazy(() => import('@/components/user/MainPage/SectionProductCardCarousel/SectionProductCardCarousel'));
const NewsSection = lazy(() => import('@/components/user/MainPage/NewsSection/NewsSection'));
const BestSeller = lazy(() => import('@/components/user/MainPage/BestSeller/BestSeller'));
const BannerImage = lazy(() => import('@/components/user/MainPage/BannerImage/BannerImage'));
const BrandCarousel = lazy(() => import('@/components/user/MainPage/BrandCarousel/BrandCarousel'));
const Newsletter = lazy(() => import('@/components/user/MainPage/Newsletter/Newsletter'));

const SectionSpinner = ({ height = '200px' }) => (
    <div className="w-full flex justify-center items-center" style={{ height }}>
        <div className="w-8 h-8 border-2 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>
    </div>
);

export default function HomePage() {
    useEffect(() => {
        const initializeNotifications = async () => {
            try {
                await NotificationService.setupSignalRNotifications();
                NotificationService.requestNotificationPermission();
                NotificationService.cleanOldNotifications();
                console.log('📢 HomePage: Notification system initialized for user');
            } catch (error) {
                console.error('❌ HomePage: Failed to initialize notifications:', error);
            }
        };

        initializeNotifications();
    }, []);

    return (
        <>
            {/* === ABOVE THE FOLD: Load ngay lập tức === */}
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div data-section="hero" data-label="Trang chủ" data-aos="fade-up">
                <SiteContent />
            </div>

            <ScrollTimeline />

            {/* === BELOW THE FOLD: Lazy load khi scroll đến === */}

            <div data-section="categories" data-label="Danh mục" data-aos="fade-up">
                <LazySection height="280px">
                    <Suspense fallback={<SectionSpinner height="280px" />}>
                        <CategorySale />
                    </Suspense>
                </LazySection>
            </div>

            <div data-section="products" data-label="Sản phẩm" data-aos="fade-up" data-aos-delay="100">
                <LazySection height="500px">
                    <Suspense fallback={<SectionSpinner height="500px" />}>
                        <ProductCarousel />
                    </Suspense>
                </LazySection>
            </div>

            <div data-section="trending" data-label="Xu hướng" data-aos="fade-up">
                <LazySection height="400px">
                    <Suspense fallback={<SectionSpinner height="400px" />}>
                        <SectionProductCardCarousel />
                    </Suspense>
                </LazySection>
            </div>

            <div data-section="bestseller" data-label="Bán chạy" data-aos="fade-up" data-aos-delay="100">
                <LazySection height="600px">
                    <Suspense fallback={<SectionSpinner height="600px" />}>
                        <BestSeller />
                    </Suspense>
                </LazySection>
            </div>

            <LazySection height="160px">
                <Suspense fallback={<SectionSpinner height="160px" />}>
                    <BannerImage />
                </Suspense>
            </LazySection>

            <div data-section="news" data-label="Tin tức" data-aos="fade-up">
                <LazySection height="450px">
                    <Suspense fallback={<SectionSpinner height="450px" />}>
                        <NewsSection />
                    </Suspense>
                </LazySection>
            </div>

            <LazySection height="112px">
                <Suspense fallback={<SectionSpinner height="112px" />}>
                    <BrandCarousel />
                </Suspense>
            </LazySection>

            <LazySection height="80px">
                <Suspense fallback={<SectionSpinner height="80px" />}>
                    <Newsletter />
                </Suspense>
            </LazySection>

            <div data-section="footer" data-label="Cuối trang">
                <Footer />
            </div>
        </>
    );
}
