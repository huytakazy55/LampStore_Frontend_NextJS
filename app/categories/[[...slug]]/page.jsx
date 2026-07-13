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
import PageLoader from '@/components/common/PageLoader';
import { resolveImagePath } from '@/lib/imageUtils';
import { useWishlist } from '@/contexts/WishlistContext';

const DEFAULT_IMAGE = '/images/cameras-2.jpg';

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getProductImageSrc = (product) => {
    const imgs = product.images?.$values || product.images || product.Images || [];
    if (imgs.length > 0) {
        const path = imgs[0].imagePath || imgs[0].ImagePath || imgs[0].imageUrl || imgs[0].ImageUrl;
        if (path) return resolveImagePath(path, DEFAULT_IMAGE);
    }
    const fallbackPath = product.imageUrl || product.ImageUrl || product.productImage || product.thumbnail;
    return resolveImagePath(fallbackPath, DEFAULT_IMAGE);
};

const getCategoryImageSrc = (category) => {
    const path = category.imageUrl || category.ImageUrl || category.thumbnail;
    return resolveImagePath(path, DEFAULT_IMAGE);
};

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const slugParams = params?.slug || [];
    const categoryIdentifier = slugParams.length > 0 ? slugParams[0] : null;

    // Dùng React Query hooks thay vì useEffect + fetch trực tiếp
    const { data: categories = [], isLoading: loading } = useCategories();
    const { data: allProducts = [], isLoading: productsLoading } = useProducts();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [activeCategory, setActiveCategory] = useState(categoryIdentifier || null);
    const [cartModalProduct, setCartModalProduct] = useState(null);
    const [cartModalMode, setCartModalMode] = useState(null);
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
                        <span className="hover:text-primary-600 cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="text-gray-800 font-medium">Danh mục sản phẩm</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-700">Danh Mục <span className="text-primary-600">Sản Phẩm</span></h1>
                        <p className="text-gray-500 text-sm mt-1">Khám phá các bộ sưu tập đèn ngủ cao cấp của chúng tôi</p>
                    </div>

                    {loading ? (
                        <PageLoader height="16rem" />
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Sidebar */}
                            <div className="w-full lg:w-[260px] flex-shrink-0">
                                <div className="bg-white rounded-sm border border-gray-200 overflow-hidden sticky top-4">
                                    <div className="p-4 bg-primary-600 text-white rounded-t-sm">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <i className='bx bx-category'></i>
                                            Danh mục ({categories.length})
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {categories.map((cat) => (
                                            <div key={cat.id}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${String(activeCategory) === String(cat.id) || activeCategory === cat.slug
                                                    ? 'bg-primary-50 border-l-[3px] border-primary-500 text-primary-700 font-semibold'
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
                                                    className="relative group cursor-pointer bg-white dark:bg-[#1a1a1a] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(249,115,22,0.3)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_0_1px_rgba(249,115,22,0.3)] hover:-translate-y-1 border border-gray-100 dark:border-[#2a2a2a] hover:border-orange-500 dark:hover:border-orange-500"
                                                    onClick={() => { if (product.slug || product.id) router.push(`/product/${product.slug || product.id}`); }}>
                                                    {/* Discount Badge */}
                                                    {hasDiscount && (
                                                        <div className="absolute top-2.5 left-2.5 z-10 bg-primary-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-[0_2px_6px_rgba(139,92,246,0.25)]">
                                                            -{discountPercent}%
                                                        </div>
                                                    )}
                                                    {/* Wishlist Button */}
                                                    <button
                                                        className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 md:w-8 md:h-8 rounded-sm flex items-center justify-center transition-all duration-300 shadow-sm backdrop-blur-sm ${isInWishlist(product.id)
                                                        ? 'bg-primary-600 text-white scale-105'
                                                        : 'bg-white/80 dark:bg-[#1a1a1a]/80 text-gray-400 dark:text-gray-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-500 hover:scale-105'
                                                        }`}
                                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                                        aria-label={isInWishlist(product.id) ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                                                    >
                                                        <i className={`bx ${isInWishlist(product.id) ? 'bxs-heart' : 'bx-heart'} text-sm md:text-base`}></i>
                                                    </button>
                                                    {/* Image Container */}
                                                    <div className="relative h-48 sm:h-56 md:h-60 overflow-hidden bg-gray-50 dark:bg-[#111]">
                                                        <Image className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                                                            src={getProductImageSrc(product)} alt={product.name}
                                                            fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" quality={75} />
                                                    </div>
                                                    {/* Content */}
                                                    <div className="p-3 md:p-3.5">
                                                        {/* Category */}
                                                        <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-1">
                                                            {product.category?.name || activeCategoryData?.name || 'Đèn ngủ'}
                                                        </p>
                                                        {/* Title */}
                                                        <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                                                            {product.name}
                                                        </h3>
                                                        {/* Price Row */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[0.95rem] md:text-[1.1rem] font-bold text-orange-600 dark:text-orange-500 inline-block leading-tight">
                                                                {formatPrice(price)}<span className="text-[0.7rem] font-medium ml-px underline">đ</span>
                                                            </span>
                                                            {hasDiscount && (
                                                                <span className="text-[0.65rem] md:text-[0.75rem] text-gray-400 dark:text-[#6b6b6b] line-through leading-none">
                                                                    {formatPrice(originalPrice)}<span className="underline">đ</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Sold Count */}
                                                        <div className="flex items-center gap-1 mt-1.5 text-gray-500 dark:text-gray-400 text-[0.65rem] md:text-xs">
                                                            <i className='bx bx-purchase-tag text-orange-500'></i>
                                                            <span>Đã bán {product.sellCount || 0}</span>
                                                        </div>
                                                        {/* Actions Row */}
                                                        <div className="flex items-stretch gap-1.5 md:gap-2 mt-3">
                                                            <button
                                                                className="flex-1 flex items-center justify-center py-1.5 rounded-sm border border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCartModalMode('add_to_cart');
                                                                    setCartModalProduct(product);
                                                                }}
                                                                aria-label="Thêm vào giỏ hàng"
                                                            >
                                                                <span className="text-[8.5px] sm:text-[9px] md:text-xs font-semibold">Thêm vào giỏ</span>
                                                            </button>
                                                            <button
                                                                className="flex-1 flex items-center justify-center py-1.5 rounded-sm border border-transparent bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCartModalMode('buy_now');
                                                                    setCartModalProduct(product);
                                                                }}
                                                                aria-label="Mua ngay"
                                                            >
                                                                <span className="text-[9px] md:text-xs font-semibold">Mua ngay</span>
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
                mode={cartModalMode}
            />
        </>
    );
}
