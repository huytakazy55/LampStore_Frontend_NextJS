"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import Header from '../MainPage/Header/Header';
import TopBar from '../MainPage/TopBar/TopBar';
import Footer from '../MainPage/Footer/Footer';
import WishlistService from '@/services/WishlistService';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
const defaultImg = '/images/cameras-2.jpg';
import AddToCartModal from '../MainPage/AddToCartModal';
import { resolveImagePath } from '@/lib/imageUtils';

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) => {
    if (!path) return defaultImg;
    return resolveImagePath(path, defaultImg);
};

const WishlistPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { toggleWishlist } = useWishlist();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartModalProduct, setCartModalProduct] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await WishlistService.getWishlist();
            const items = response.data?.$values || response.data || [];
            setWishlistItems(items);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        await toggleWishlist(productId);
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleAddToCart = (item) => {
        // Mở modal AddToCart với thông tin sản phẩm
        setCartModalProduct({
            id: item.productId,
            name: item.productName,
            images: item.productImage ? [{ imagePath: item.productImage }] : [],
            minPrice: item.discountPrice || item.price,
            maxPrice: item.price,
        });
    };

    if (!isAuthenticated) {
        return (
            <>
                <Helmet><title>Danh sách yêu thích | CapyLumine</title></Helmet>
                <TopBar />
                <Header />
                <div className='w-full py-20 flex flex-col items-center justify-center'>
                    <i className='bx bx-lock-alt text-6xl text-gray-300 mb-4'></i>
                    <h2 className='text-lg font-medium text-gray-600 mb-2'>Vui lòng đăng nhập</h2>
                    <p className='text-sm text-gray-400 mb-6'>Bạn cần đăng nhập để xem danh sách yêu thích</p>
                    <button
                        onClick={() => navigate('/')}
                        className='bg-rose-600 text-white px-6 py-2.5 rounded-sm hover:bg-rose-700 transition font-medium cursor-pointer'
                    >
                        <i className='bx bx-home mr-1'></i> Về trang chủ
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Helmet><title>Danh sách yêu thích | CapyLumine</title></Helmet>
                <TopBar />
                <Header />
                <div className='w-full h-[60vh] flex justify-center items-center'>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Đang tải danh sách yêu thích...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>{`Danh sách yêu thích (${wishlistItems.length}) | CapyLumine`}</title>
                <meta name="description" content="Xem danh sách sản phẩm yêu thích của bạn tại CapyLumine" />
            </Helmet>
            <TopBar />
            <Header />
            <main className='w-full mb-8 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
                {/* Breadcrumb */}
                <nav className='flex items-center py-3 text-xs md:text-sm'>
                    <a href="/" className='font-medium text-gray-600 hover:text-rose-600 transition'>Trang chủ</a>
                    <i className='bx bx-chevron-right text-base md:text-lg px-1 text-gray-400'></i>
                    <span className='text-gray-500'>Danh sách yêu thích</span>
                </nav>

                {/* Title */}
                <div className='flex items-center gap-3 mb-6'>
                    <h1 className='text-xl md:text-2xl font-medium text-gray-800'>
                        <i className='bx bxs-heart text-rose-500 mr-2'></i>
                        Danh sách yêu thích
                    </h1>
                    <span className='bg-rose-100 text-rose-600 text-sm px-3 py-0.5 rounded-sm font-medium'>
                        {wishlistItems.length} sản phẩm
                    </span>
                </div>

                {wishlistItems.length === 0 ? (
                    /* Empty State */
                    <div className='w-full py-16 flex flex-col items-center justify-center bg-white rounded-sm shadow-sm'>
                        <i className='bx bx-heart text-7xl text-gray-300 mb-4'></i>
                        <h2 className='text-lg font-medium text-gray-600 mb-2'>Chưa có sản phẩm yêu thích</h2>
                        <p className='text-sm text-gray-400 mb-6'>Hãy khám phá và thêm sản phẩm bạn yêu thích!</p>
                        <button
                            onClick={() => navigate('/')}
                            className='bg-rose-600 text-white px-6 py-2.5 rounded-sm hover:bg-rose-700 transition font-medium cursor-pointer'
                        >
                            <i className='bx bx-store mr-1'></i> Khám phá sản phẩm
                        </button>
                    </div>
                ) : (
                    /* Product Grid */
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {wishlistItems.map((item) => {
                            const displayPrice = item.discountPrice && item.discountPrice < item.price
                                ? item.discountPrice
                                : item.price;
                            const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                            const discountPercent = hasDiscount
                                ? Math.round((1 - item.discountPrice / item.price) * 100)
                                : 0;

                            return (
                                <div key={item.id} className='bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow'>
                                    {/* Image */}
                                    <div
                                        className='relative h-48 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden'
                                        onClick={() => navigate(`/product/${item.productSlug || item.productId}`)}
                                    >
                                        <img
                                            src={getImgSrc(item.productImage)}
                                            alt={item.productName}
                                            className='max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300'
                                            onError={(e) => { e.target.src = defaultImg; }}
                                        />
                                        {hasDiscount && (
                                            <div className='absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded font-medium'>
                                                -{discountPercent}%
                                            </div>
                                        )}
                                        {/* Remove button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(item.productId);
                                            }}
                                            className='absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-rose-50 rounded-sm flex items-center justify-center shadow-sm transition-colors cursor-pointer'
                                            title="Xóa khỏi yêu thích"
                                        >
                                            <i className='bx bxs-heart text-rose-500 text-lg'></i>
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className='p-4'>
                                        {item.categoryName && (
                                            <p className='text-xs text-gray-400 mb-1'>{item.categoryName}</p>
                                        )}
                                        <h3
                                            className='text-sm font-medium text-gray-800 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug h-10'
                                            onClick={() => navigate(`/product/${item.productSlug || item.productId}`)}
                                        >
                                            {item.productName}
                                        </h3>

                                        {/* Price */}
                                        <div className='flex items-center gap-2 mb-3'>
                                            <span className='text-base font-bold text-rose-600'>
                                                {formatPrice(displayPrice)}₫
                                            </span>
                                            {hasDiscount && (
                                                <span className='text-xs text-gray-400 line-through'>
                                                    {formatPrice(item.price)}₫
                                                </span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className='flex items-center text-xs text-gray-400 mb-3'>
                                            <i className='bx bx-purchase-tag text-yellow-500 mr-1'></i>
                                            Đã bán {item.sellCount || 0}
                                        </div>

                                        {/* Actions */}
                                        <div className='flex gap-2'>
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className='flex-1 flex items-center justify-center gap-1 bg-rose-50 border border-rose-600 text-rose-600 py-2 rounded-sm hover:bg-rose-100 transition-colors text-sm font-medium cursor-pointer'
                                            >
                                                <i className='bx bx-cart-add text-lg'></i>
                                                Thêm vào giỏ
                                            </button>
                                            <button
                                                onClick={() => navigate(`/product/${item.productSlug || item.productId}`)}
                                                className='flex-1 bg-rose-600 text-white py-2 rounded-sm hover:bg-rose-700 transition-colors text-sm font-medium cursor-pointer'
                                            >
                                                Mua ngay
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* AddToCart Modal */}
            <AddToCartModal
                isOpen={!!cartModalProduct}
                onClose={() => setCartModalProduct(null)}
                product={cartModalProduct}
            />

            <Footer />
        </>
    );
};

export default WishlistPage;
