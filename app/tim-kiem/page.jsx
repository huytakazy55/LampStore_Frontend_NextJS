"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import SearchService from '@/services/SearchService';
import { useCategories } from '@/hooks/useCategories';
import { useNavigate } from '@/lib/router-compat';
import { resolveImagePath } from '@/lib/imageUtils';
import PageLoader from '@/components/common/PageLoader';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-toastify';

function SearchResults() {
    const searchParams = useSearchParams();
    const navigate = useNavigate();
    const keyword = searchParams.get('q') || '';
    const { addToCart } = useCart();
    const { data: allCategories = [] } = useCategories();

    const [products, setProducts] = useState([]);
    const [matchedCategories, setMatchedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (!keyword.trim()) {
            setProducts([]);
            setMatchedCategories([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const result = await SearchService.advancedSearch({
                    keyword,
                    page: 1,
                    pageSize: 50,
                    sortBy,
                    sortOrder
                });

                const productList = result?.$values || result?.products?.$values || result?.products || [];
                setProducts(Array.isArray(productList) ? productList : []);
                setTotalResults(result?.totalCount || result?.total || productList.length || 0);

                // Match categories
                const lowerKeyword = keyword.toLowerCase();
                const matched = allCategories.filter(c =>
                    c.name.toLowerCase().includes(lowerKeyword)
                );
                setMatchedCategories(matched);
            } catch (error) {
                console.error('Search error:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [keyword, sortBy, sortOrder, allCategories]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    };

    const getImageSrc = (product) => {
        const img = product?.images?.$values?.[0] || product?.images?.[0];
        if (img?.imagePath) return resolveImagePath(img.imagePath);
        if (img?.imageUrl) return resolveImagePath(img.imageUrl);
        if (product?.imageUrl) return resolveImagePath(product.imageUrl);
        return '/images/placeholder.png';
    };

    const getPrice = (product) => {
        return product.minPrice || product.price || 0;
    };

    const getOriginalPrice = (product) => {
        return product.maxPrice || product.originalPrice || 0;
    };

    const getDiscountPercent = (product) => {
        const price = getPrice(product);
        const original = getOriginalPrice(product);
        if (original && original > price) {
            return Math.round((1 - price / original) * 100);
        }
        return 0;
    };

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div className="bg-gray-50 dark:bg-[#0f0f0f] min-h-screen">
                <div className="w-full xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 py-6 md:py-10">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <a href="/" className="hover:text-amber-600 transition-colors">Trang chủ</a>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">Tìm kiếm</span>
                    </nav>

                    {/* Search header */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Kết quả tìm kiếm cho "{keyword}"
                        </h1>
                        {!loading && (
                            <p className="text-gray-500 dark:text-gray-400">
                                Tìm thấy <span className="font-semibold text-amber-600">{totalResults}</span> sản phẩm
                                {matchedCategories.length > 0 && ` và ${matchedCategories.length} danh mục`}
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <PageLoader height="40vh" />
                    ) : (
                        <>
                            {/* Matched categories */}
                            {matchedCategories.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <i className='bx bx-category text-amber-500'></i>
                                        Danh mục liên quan
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {matchedCategories.map(cat => (
                                            <button
                                                key={cat.id}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all duration-200 group cursor-pointer"
                                                onClick={() => navigate(`/categories/${cat.slug || cat.id}`)}
                                            >
                                                <div className="w-8 h-8 rounded-md overflow-hidden relative flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                                    {cat.imageUrl ? (
                                                        <Image src={resolveImagePath(cat.imageUrl)} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="32px" />
                                                    ) : (
                                                        <div className="w-full h-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                                            <i className='bx bx-category text-amber-600 dark:text-amber-400 text-sm'></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{cat.name}</span>
                                                <i className='bx bx-right-arrow-alt text-gray-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all ml-auto'></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sort bar */}
                            {products.length > 0 && (
                                <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{products.length}</span> sản phẩm
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Sắp xếp:</span>
                                        <select
                                            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-amber-400/30"
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [sb, so] = e.target.value.split('-');
                                                setSortBy(sb);
                                                setSortOrder(so);
                                            }}
                                        >
                                            <option value="name-asc">Tên A → Z</option>
                                            <option value="name-desc">Tên Z → A</option>
                                            <option value="price-asc">Giá tăng dần</option>
                                            <option value="price-desc">Giá giảm dần</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Products grid */}
                            {products.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                    {products.map((product) => {
                                        const discount = getDiscountPercent(product);
                                        return (
                                            <div
                                                key={product.id}
                                                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:shadow-amber-100/30 dark:hover:shadow-amber-900/10 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-300 cursor-pointer flex flex-col"
                                                onClick={() => navigate(`/product/${product.slug || product.id}`)}
                                            >
                                                {/* Image */}
                                                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
                                                    <Image
                                                        src={getImageSrc(product)}
                                                        alt={product.name || ''}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        quality={75}
                                                    />
                                                    {discount > 0 && (
                                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            -{discount}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="p-3 flex-1 flex flex-col">
                                                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2 leading-snug">
                                                        {product.name}
                                                    </h3>
                                                    <div className="mt-auto">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{formatPrice(getPrice(product))}</span>
                                                            {getOriginalPrice(product) > getPrice(product) && (
                                                                <span className="text-gray-400 line-through text-xs">{formatPrice(getOriginalPrice(product))}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* No results */
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                        <i className='bx bx-search-alt text-4xl text-gray-300 dark:text-gray-600'></i>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Không tìm thấy kết quả</h2>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                                        Không có sản phẩm nào phù hợp với từ khóa <strong>"{keyword}"</strong>. Hãy thử tìm kiếm với từ khóa khác.
                                    </p>
                                    <button
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors duration-200 cursor-pointer"
                                        onClick={() => navigate('/')}
                                    >
                                        Về trang chủ
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default function TimKiemPage() {
    return (
        <Suspense fallback={
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <PageLoader height="60vh" />
                <Footer />
            </>
        }>
            <SearchResults />
        </Suspense>
    );
}
