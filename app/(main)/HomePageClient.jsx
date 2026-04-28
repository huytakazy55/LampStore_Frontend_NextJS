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

// === Code Splitting: Lazy load các component nặng ===
import CategorySale from '@/components/user/MainPage/CategorySale/CategorySale';
const ProductCarousel = lazy(() => import('@/components/user/MainPage/ProductCarousel/ProductCarousel'));
const SectionProductCardCarousel = lazy(() => import('@/components/user/MainPage/SectionProductCardCarousel/SectionProductCardCarousel'));
const NewsSection = lazy(() => import('@/components/user/MainPage/NewsSection/NewsSection'));
const AllProducts = lazy(() => import('@/components/user/MainPage/AllProducts/AllProducts'));
const BannerImage = lazy(() => import('@/components/user/MainPage/BannerImage/BannerImage'));
const BrandCarousel = lazy(() => import('@/components/user/MainPage/BrandCarousel/BrandCarousel'));
const Newsletter = lazy(() => import('@/components/user/MainPage/Newsletter/Newsletter'));

import PageLoader from '@/components/common/PageLoader';

const SectionSpinner = ({ height = '200px' }) => (
    <PageLoader height={height} />
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

            <main>

                <div data-section="hero" data-label="Trang chủ" data-aos="fade-up">
                    <SiteContent />
                </div>

                <ScrollTimeline />

                {/* === BELOW THE FOLD: Lazy load khi scroll đến === */}

                <div data-section="categories" data-label="Danh mục" data-aos="fade-up">
                    <CategorySale />
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

                <div data-section="allproducts" data-label="Tất cả SP" data-aos="fade-up" data-aos-delay="100">
                    <Suspense fallback={<SectionSpinner height="160px" />}>
                        <div className="py-2" />
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
                            <AllProducts />
                        </div>
                    </Suspense>
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

            </main>

            <div data-section="footer" data-label="Cuối trang">
                <Footer />
            </div>
        </>
    );
}
