"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import AddToCartModal from '@/components/user/MainPage/AddToCartModal';
import defaultImg from '@/assets/images/cameras-2.jpg';
import PageLoader from '@/components/common/PageLoader';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getProductImageSrc = (product) => {
    const imgs = product.images?.$values || product.images || product.Images || [];
    if (imgs.length > 0) {
        const path = imgs[0].imagePath || imgs[0].ImagePath;
        if (path) return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
    }
    return defaultImg;
};

const getCategoryImageSrc = (category) => {
    if (category.imageUrl) {
        return category.imageUrl.startsWith('http') ? category.imageUrl : `${API_ENDPOINT}${category.imageUrl}`;
    }
    return defaultImg;
};

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const slugParams = params?.slug || [];
    const categoryIdentifier = slugParams.length > 0 ? slugParams[0] : null;

    // Dùng React Query hooks thay vì useEffect + fetch trực tiếp
    const { data: categories = [], isLoading: loading } = useCategories();
    const { data: allProducts = [], isLoading: productsLoading } = useProducts();

    const [activeCategory, setActiveCategory] = useState(categoryIdentifier || null);
    const [cartModalProduct, setCartModalProduct] = useState(null);
    const [transitioning, setTransitioning] = useState(false);

    // Smooth category switch with fade
    const handleCategorySwitch = useCallback((slug) => {
        if (slug === activeCategory) return;
        setTransitioning(true);
        setTimeout(() => {
            setActiveCategory(slug);
            window.history.pushState(null, '', `/categories/${slug}`);
            setTimeout(() => setTransitioning(false), 50);
        }, 200);
    }, [activeCategory]);

    // Set default category khi data load xong
    useEffect(() => {
        if (!activeCategory && categories.length > 0) {
            setActiveCategory(categories[0].slug || String(categories[0].id));
        }
    }, [categories, activeCategory]);

    useEffect(() => {
        if (categoryIdentifier) setActiveCategory(categoryIdentifier);
    }, [categoryIdentifier]);

    // Resolve active category object from slug or id
    const activeCategoryData = useMemo(() => {
        if (!activeCategory) return null;
        return categories.find(c => c.slug === activeCategory || String(c.id) === String(activeCategory)) || null;
    }, [categories, activeCategory]);

    // Filter products client-side using the resolved category ID
    const products = useMemo(() => {
        if (!activeCategoryData) return [];
        return allProducts
            .filter(p => String(p.categoryId) === String(activeCategoryData.id))
            .map(product => {
                const imgData = product.images?.$values || product.images;
                const images = Array.isArray(imgData) ? imgData : [];
                return { ...product, images };
            });
    }, [allProducts, activeCategoryData]);

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div className="w-full bg-gray-50 min-h-screen">
                <div className="xl:max-w-[1440px] mx-auto px-4 xl:px-0 py-6 md:py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <span className="hover:text-amber-600 cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="text-gray-800 font-medium">Danh mục sản phẩm</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-700">Danh Mục <span className="text-amber-600">Sản Phẩm</span></h1>
                        <p className="text-gray-500 text-sm mt-1">Khám phá các bộ sưu tập đèn ngủ cao cấp của chúng tôi</p>
                    </div>

                    {loading ? (
                        <PageLoader height="16rem" />
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar */}
                            <div className="w-full lg:w-[260px] flex-shrink-0">
                                <div className="bg-white rounded-sm border border-gray-200 overflow-hidden sticky top-4">
                                    <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-t-sm">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <i className='bx bx-category'></i>
                                            Danh mục ({categories.length})
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {categories.map((cat) => (
                                            <div key={cat.id}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${String(activeCategory) === String(cat.id) || activeCategory === cat.slug
                                                    ? 'bg-amber-50 border-l-[3px] border-amber-500 text-amber-700 font-semibold'
                                                    : 'border-l-[3px] border-transparent hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                                    }`}
                                                onClick={() => handleCategorySwitch(cat.slug || String(cat.id))}>
                                                <div className="relative w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <Image src={getCategoryImageSrc(cat)} alt={cat.name} className="w-full h-full object-cover"
                                                        fill sizes="32px" quality={60} />
                                                </div>
                                                <span className="text-sm truncate">{cat.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className={`flex-1 transition-all duration-300 ease-in-out ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                                {activeCategoryData && (
                                    <div className="relative bg-white rounded-sm border border-gray-200 overflow-hidden mb-6">
                                        <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
                                            <div className="relative w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200">
                                                <Image src={getCategoryImageSrc(activeCategoryData)} alt={activeCategoryData.name} className="w-full h-full object-cover" fill sizes="80px" quality={70} />
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <h2 className="text-xl font-bold text-gray-700">{activeCategoryData.name}</h2>
                                                <p className="text-sm text-gray-500 mt-1">{products.length} sản phẩm</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {productsLoading ? (
                                    <PageLoader height="12rem" />
                                ) : products.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                        {products.map((product) => {
                                            const variant = product.variant;
                                            const price = variant?.discountPrice || variant?.price || 0;
                                            const originalPrice = variant?.price || 0;
                                            const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
                                            const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;

                                            return (
                                                <div key={product.id}
                                                    className="relative group cursor-pointer bg-white rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 border border-gray-100"
                                                    onClick={() => router.push(`/product/${product.slug || product.id}`)}>
                                                    {hasDiscount && (
                                                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-lg">
                                                            -{discountPercent}%
                                                        </div>
                                                    )}
                                                    <div className="relative h-36 sm:h-44 md:h-52 overflow-hidden">
                                                        <Image className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            src={getProductImageSrc(product)} alt={product.name}
                                                            fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" quality={75} />
                                                    </div>
                                                    <div className="p-3 md:p-4">
                                                        <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                                                            {product.category?.name || activeCategoryData?.name || 'Đèn ngủ'}
                                                        </p>
                                                        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-amber-700 transition-colors duration-200">
                                                            {product.name}
                                                        </h3>
                                                        <div className="flex items-end justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                                                            <div>
                                                                <div className="text-sm md:text-base font-bold text-amber-600">
                                                                    {formatPrice(price)}<span className="text-[10px] font-normal ml-0.5">₫</span>
                                                                </div>
                                                                {hasDiscount && (
                                                                    <div className="text-[10px] text-gray-400 line-through -mt-0.5">
                                                                        {formatPrice(originalPrice)}₫
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                className="w-8 h-8 md:w-9 md:h-9 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white"
                                                                onClick={(e) => { e.stopPropagation(); setCartModalProduct(product); }}>
                                                                <i className='bx bxs-cart-add text-base md:text-lg'></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 bg-white rounded-sm border border-gray-200">
                                        <i className='bx bx-package text-4xl text-gray-300 mb-3'></i>
                                        <p className="text-gray-500 text-sm">Chưa có sản phẩm trong danh mục này</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            <AddToCartModal
                isOpen={!!cartModalProduct}
                onClose={() => setCartModalProduct(null)}
                product={cartModalProduct}
            />
        </>
    );
}
