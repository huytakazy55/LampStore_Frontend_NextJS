"use client";


import { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import { SiteContent } from '@/components/user/MainPage/SiteContent/SiteContent';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import NotificationService from '@/services/NotificationService';
import LazySection from '@/components/common/LazySection';
import ScrollTimeline from '@/components/common/ScrollTimeline';

// === Code Splitting: Lazy load các component nặng ===
const CategorySale = dynamic(() => import('@/components/user/MainPage/CategorySale/CategorySale'), { ssr: false });
const ProductCarousel = dynamic(() => import('@/components/user/MainPage/ProductCarousel/ProductCarousel'), { ssr: false });
const SectionProductCardCarousel = dynamic(() => import('@/components/user/MainPage/SectionProductCardCarousel/SectionProductCardCarousel'), { ssr: false });
const NewsSection = dynamic(() => import('@/components/user/MainPage/NewsSection/NewsSection'), { ssr: false });
const AllProducts = dynamic(() => import('@/components/user/MainPage/AllProducts/AllProducts'), { ssr: false });
const BannerImage = dynamic(() => import('@/components/user/MainPage/BannerImage/BannerImage'), { ssr: false });
const Newsletter = dynamic(() => import('@/components/user/MainPage/Newsletter/Newsletter'), { ssr: false });
const FlashSale = dynamic(() => import('@/components/user/MainPage/FlashSale/FlashSale'), { ssr: false });
const CustomerReviews = dynamic(() => import('@/components/user/MainPage/SocialProof/CustomerReviews'), { ssr: false });
const CustomerGallery = dynamic(() => import('@/components/user/MainPage/SocialProof/CustomerGallery'), { ssr: false });
const WhyChooseUs = dynamic(() => import('@/components/user/MainPage/WhyChooseUs/WhyChooseUs'), { ssr: false });

import PageLoader from '@/components/common/PageLoader';

const SectionSpinner = ({ height, minHeightClass = '' }) => (
    <PageLoader height={height} minHeightClass={minHeightClass} />
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

                <div data-section="hero" data-label="Trang chủ">
                    <SiteContent />
                </div>

                <ScrollTimeline />

                {/* 1. Sản phẩm bán chạy (Trending) */}
                <div data-section="trending" data-label="Bán chạy" data-aos="fade-up" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 400px' }}>
                    <LazySection minHeightClass="min-h-[200px] sm:min-h-[400px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[200px] sm:min-h-[400px]" />}>
                            <SectionProductCardCarousel />
                        </Suspense>
                    </LazySection>
                </div>

                {/* 2. Danh mục nổi bật */}
                <div data-section="categories" data-label="Danh mục" data-aos="fade-up" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 280px' }}>
                    <LazySection minHeightClass="min-h-[120px] sm:min-h-[280px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[120px] sm:min-h-[280px]" />}>
                            <CategorySale />
                        </Suspense>
                    </LazySection>
                </div>

                {/* FLASH SALE */}
                <Suspense fallback={null}>
                    <FlashSale />
                </Suspense>

                {/* 3. Banner sản phẩm chủ lực */}
                <LazySection minHeightClass="min-h-[100px] sm:min-h-[160px]">
                    <Suspense fallback={<SectionSpinner minHeightClass="min-h-[100px] sm:min-h-[160px]" />}>
                        <BannerImage />
                    </Suspense>
                </LazySection>

                {/* 4. Tại sao chọn CapyLumine */}
                <div data-section="whychooseus" data-label="Tại sao chọn" data-aos="fade-up">
                    <LazySection minHeightClass="min-h-[300px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[300px]" />}>
                            <WhyChooseUs />
                        </Suspense>
                    </LazySection>
                </div>

                {/* 5. Không gian / Video thực tế */}
                <div data-section="gallery" data-label="Feedback" data-aos="fade-up">
                    <LazySection minHeightClass="min-h-[300px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[300px]" />}>
                            <CustomerGallery />
                        </Suspense>
                    </LazySection>
                </div>

                {/* 6. Sản phẩm mới / Tất cả SP */}
                <div data-section="products" data-label="Sản phẩm" data-aos="fade-up" data-aos-delay="100" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
                    <LazySection minHeightClass="min-h-[280px] sm:min-h-[500px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[280px] sm:min-h-[500px]" />}>
                            <ProductCarousel />
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

                {/* 7. Khách hàng nói gì (Reviews) */}
                <div data-section="reviews" data-label="Đánh giá" data-aos="fade-up">
                    <LazySection minHeightClass="min-h-[300px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[300px]" />}>
                            <CustomerReviews />
                        </Suspense>
                    </LazySection>
                </div>

                {/* 8. Bài viết tư vấn */}
                <div data-section="news" data-label="Tin tức" data-aos="fade-up" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 450px' }}>
                    <LazySection minHeightClass="min-h-[300px] sm:min-h-[450px]">
                        <Suspense fallback={<SectionSpinner minHeightClass="min-h-[300px] sm:min-h-[450px]" />}>
                            <NewsSection />
                        </Suspense>
                    </LazySection>
                </div>

                <LazySection minHeightClass="min-h-[80px] sm:min-h-[80px]">
                    <Suspense fallback={<SectionSpinner minHeightClass="min-h-[80px] sm:min-h-[80px]" />}>
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
