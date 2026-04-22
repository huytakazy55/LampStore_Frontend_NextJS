"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import ProductManage from '@/services/ProductManage';
import ReviewService from '@/services/ReviewService';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import ImageLightbox from '@/components/common/ImageLightbox';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) => {
    if (!path) return '/images/cameras-2.jpg';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

const stripHtml = (html) => {
    if (!html) return '';
    if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug;
    const router = useRouter();
    const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

    const [product, setProduct] = useState(null);
    const [variant, setVariant] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [variantTypes, setVariantTypes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [showError, setShowError] = useState(false);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Review states
    const [reviews, setReviews] = useState([]);
    const [reviewStatus, setReviewStatus] = useState({ hasPurchased: false, hasReviewed: false });
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewHover, setReviewHover] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);

    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { data: allProducts = [] } = useProducts();

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await ProductManage.GetProductBySlug(slug);
                const data = res.data;

                if (data) {
                    setProduct(data);
                    setVariant(data.variant || null);

                    const imgData = data.images?.$values || data.images;
                    setImages(Array.isArray(imgData) ? imgData : []);

                    const vtData = data.variantTypes?.$values || data.variantTypes;
                    const vts = Array.isArray(vtData) ? vtData.map(vt => ({
                        ...vt,
                        values: (vt.values?.$values || vt.values || []).map(v => ({
                            ...v,
                            additionalPrice: v.additionalPrice || 0
                        }))
                    })) : [];
                    setVariantTypes(vts);

                    // Fetch reviews using the actual product ID
                    fetchReviews(data.id);
                    if (isAuthenticated) fetchReviewStatus(data.id);
                }
            } catch (e) {
                console.error('Error fetching product:', e);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProduct();
        }
    }, [slug, isAuthenticated]);

    const fetchReviews = async (productId) => {
        try {
            const res = await ReviewService.getProductReviews(productId);
            const data = res.data?.$values || res.data || [];
            setReviews(data);
        } catch (e) { console.error('Error fetching reviews:', e); }
    };

    const fetchReviewStatus = async (productId) => {
        try {
            const res = await ReviewService.getReviewStatus(productId);
            setReviewStatus(res.data);
        } catch (e) { console.error('Error fetching review status:', e); }
    };

    const handleSubmitReview = async () => {
        if (!isAuthenticated) { toast.info('Vui lòng đăng nhập để đánh giá!'); return; }
        if (!reviewComment.trim()) { toast.warning('Vui lòng nhập nội dung đánh giá!'); return; }
        try {
            setSubmittingReview(true);
            const res = await ReviewService.submitReview({
                productId: product.id,
                rating: reviewRating,
                comment: reviewComment.trim()
            });
            const newReview = res.data;
            setReviews(prev => [newReview, ...prev]);
            setReviewStatus(prev => ({ ...prev, hasReviewed: true }));
            setReviewComment('');
            setReviewRating(5);
            toast.success('Cảm ơn bạn đã đánh giá! ⭐');
        } catch (e) {
            const msg = e.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            toast.error(msg);
        } finally { setSubmittingReview(false); }
    };

    const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));
    const handleIncrease = () => setQuantity((prev) => Math.min(prev + 1, variant?.stock || 999));

    const handleSelectOption = (typeName, val) => {
        setSelectedOptions(prev => ({
            ...prev,
            [typeName]: { value: val.value, additionalPrice: val.additionalPrice || 0 }
        }));
        setShowError(false);
    };

    const allOptionsSelected = variantTypes.length === 0 ||
        variantTypes.every(vt => selectedOptions[vt.name]);

    const handleAddToCart = (e) => {
        if (!allOptionsSelected) {
            setShowError(true);
            return;
        }

        const mainImg = images.length > 0
            ? getImgSrc(images[0]?.imagePath)
            : '/images/cameras-2.jpg';

        addToCart({
            productId: product.id,
            name: product.name,
            image: mainImg,
            price: basePrice,
            quantity,
            selectedOptions
        });

        // Dispatch fly-to-cart animation event
        const rect = e.currentTarget.getBoundingClientRect();
        window.dispatchEvent(new CustomEvent('flyToCart', {
            detail: {
                x: rect.left + rect.width / 2,
                y: rect.top,
                image: mainImg
            }
        }));

        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2000);
    };

    // Computed values
    const totalAdditional = Object.values(selectedOptions)
        .reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);
    const currentVariant = variant;
    const basePrice = currentVariant?.discountPrice || currentVariant?.price || product?.minPrice || 0;
    const price = basePrice + totalAdditional;
    const originalPrice = (currentVariant?.price || product?.maxPrice || 0) + totalAdditional;
    const hasDiscount = currentVariant?.discountPrice && currentVariant.discountPrice < currentVariant.price;
    const discountPercent = hasDiscount ? Math.round((1 - currentVariant.discountPrice / currentVariant.price) * 100) : 0;
    const stock = currentVariant?.stock || 0;
    const mainImage = images.length > 0 ? getImgSrc(images[selectedImage]?.imagePath) : '/images/cameras-2.jpg';

    // Related products
    const relatedProducts = useMemo(() => {
        if (!product || !allProducts.length) return [];
        return allProducts
            .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
            .slice(0, 5);
    }, [product, allProducts]);

    // --- RENDER ---
    if (loading) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className='w-full h-[60vh] flex justify-center items-center'>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Đang tải sản phẩm...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className='w-full h-[60vh] flex justify-center items-center px-4'>
                    <div className="text-center text-gray-500">
                        <i className='bx bx-error-circle text-5xl mb-2'></i>
                        <p className="text-lg">Không tìm thấy sản phẩm</p>
                        <button onClick={() => router.push('/')} className="text-rose-600 hover:underline mt-2 inline-block cursor-pointer">← Về trang chủ</button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <main className='w-full mb-2 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0'>
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className='flex items-center py-3 text-xs md:text-sm'>
                    <a href="/" className='font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 transition'>Trang chủ</a>
                    <i className='bx bx-chevron-right text-base md:text-lg px-1 text-gray-400 dark:text-gray-600'></i>
                    <span className='text-gray-500 dark:text-gray-400 line-clamp-1'>{product.name}</span>
                </nav>

                {/* Product Info Section */}
                <section className='w-full py-4 md:py-6 bg-white dark:bg-gray-900 flex flex-col md:flex-row justify-between gap-4 md:gap-[3%] mb-4 rounded-lg shadow-sm'>
                    {/* Images */}
                    <div className='w-full md:w-[37%] px-4'>
                        <div
                            className='w-full h-[280px] sm:h-[350px] md:h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer group relative'
                            onClick={() => setLightboxOpen(true)}
                        >
                            <img
                                className='max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300'
                                src={mainImage}
                                alt={product.name}
                                onError={(e) => { e.target.src = '/images/cameras-2.jpg'; }}
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center'>
                                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2'>
                                    <i className='bx bx-search-alt text-lg'></i>
                                    Xem ảnh
                                </div>
                            </div>
                        </div>
                        <div className='flex gap-2 mt-3 overflow-x-auto pb-2'>
                            {images.map((img, i) => (
                                <img
                                    key={img.id || i}
                                    className={`w-14 h-14 md:w-16 md:h-16 border-2 rounded cursor-pointer object-cover transition flex-shrink-0 ${selectedImage === i ? 'border-rose-600' : 'border-gray-200 dark:border-gray-700 hover:border-rose-300'}`}
                                    src={getImgSrc(img.imagePath)}
                                    alt={`${product.name} - Ảnh ${i + 1}`}
                                    onClick={() => setSelectedImage(i)}
                                    onError={(e) => { e.target.src = '/images/cameras-2.jpg'; }}
                                />
                            ))}
                        </div>
                        <div
                            className={`flex justify-end items-center text-xs md:text-sm h-8 mt-2 cursor-pointer transition-colors ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400 hover:text-rose-600'}`}
                            onClick={() => toggleWishlist(product.id)}
                        >
                            <i className={`bx ${isInWishlist(product.id) ? 'bxs-heart' : 'bx-heart'} text-base md:text-lg mr-1`}></i>
                            {isInWishlist(product.id) ? 'Đã yêu thích' : 'Yêu thích'} ({product.favorites || 0})
                        </div>
                    </div>

                    {/* Details */}
                    <div className='w-full md:w-[60%] px-4 md:px-0 md:pr-6'>
                        <h1 className='text-base md:text-xl font-medium leading-relaxed mb-2 dark:text-gray-100'>{product.name}</h1>
                        <div className='flex flex-wrap justify-start items-center text-xs md:text-sm gap-2 md:gap-3 py-1 text-gray-500 dark:text-gray-400'>
                            <div className='flex items-center gap-1'>
                                <span className='text-rose-600 font-medium'>4.8</span>
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className='bx bxs-star text-orange-400 text-xs'></i>
                                ))}
                            </div>
                            <span className='text-gray-300 dark:text-gray-600'>|</span>
                            <div>{product.reviewCount || 0} Đánh giá</div>
                            <span className='text-gray-300 dark:text-gray-600'>|</span>
                            <div>{product.sellCount || 0} Đã bán</div>
                        </div>

                        {/* Price */}
                        <div className='flex flex-wrap items-center bg-gradient-to-r from-rose-50 to-slate-50 dark:from-rose-900/20 dark:to-gray-800 gap-2 md:gap-3 py-3 md:py-4 px-4 md:px-6 my-3 md:my-4 rounded-lg'>
                            <div className='text-xl md:text-2xl font-bold text-rose-600'>₫{formatPrice(price)}</div>
                            {hasDiscount && (
                                <>
                                    <div className='text-xs md:text-sm text-gray-400 dark:text-gray-500 line-through'>₫{formatPrice(originalPrice)}</div>
                                    <div className='bg-rose-600 text-white text-xs px-2 py-0.5 rounded font-medium'>-{discountPercent}%</div>
                                </>
                            )}
                        </div>

                        {/* Variant Types — Selectable */}
                        {variantTypes.length > 0 && (
                            <div className='mb-4 md:mb-6'>
                                {variantTypes.map((vt) => {
                                    const values = Array.isArray(vt.values) ? vt.values : [];
                                    if (values.length === 0) return null;
                                    const isRequired = !selectedOptions[vt.name] && showError;
                                    return (
                                        <div key={vt.id} className='flex flex-col sm:flex-row items-start w-full gap-2 md:gap-8 mb-3'>
                                            <div className={`w-full sm:w-[10%] font-medium text-sm pt-1 ${isRequired ? 'text-red-500' : 'dark:text-gray-300'}`}>
                                                {vt.name} {isRequired && <span className='text-xs font-normal'>(Chọn)</span>}
                                            </div>
                                            <div className='w-full sm:w-[90%] flex flex-wrap gap-2'>
                                                {values.map((val) => {
                                                    const isSelected = selectedOptions[vt.name]?.value === val.value;
                                                    return (
                                                        <div
                                                            key={val.id}
                                                            onClick={() => handleSelectOption(vt.name, val)}
                                                            className={`py-1.5 px-3 md:px-4 cursor-pointer text-xs md:text-sm border rounded transition ${isSelected
                                                                ? 'border-rose-600 text-rose-600 bg-rose-50 dark:bg-rose-900/30 font-medium'
                                                                : isRequired
                                                                    ? 'border-red-300 hover:border-rose-300 dark:text-gray-400'
                                                                    : 'border-gray-300 dark:border-gray-600 hover:border-rose-300 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            {val.value}
                                                            {val.additionalPrice > 0 && (
                                                                <span className='ml-1 text-xs text-rose-500'>+₫{formatPrice(val.additionalPrice)}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className='flex flex-col sm:flex-row items-start sm:items-center w-full gap-2 md:gap-8 mb-4 md:mb-6'>
                            <div className='w-full sm:w-[10%] font-medium text-sm dark:text-gray-300'>Số lượng</div>
                            <div className='flex items-center gap-3'>
                                <div className='flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden'>
                                    <button onClick={handleDecrease} aria-label="Giảm số lượng" className='w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-600 hover:text-white active:scale-95 transition text-lg font-medium cursor-pointer'>-</button>
                                    <input type="number" value={quantity} min="1" max="999" readOnly aria-label="Số lượng sản phẩm" className="w-12 md:w-14 h-9 text-center text-sm outline-none border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
                                    <button onClick={handleIncrease} aria-label="Tăng số lượng" className='w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-600 hover:text-white active:scale-95 transition text-lg font-medium cursor-pointer'>+</button>
                                </div>
                                <div className='text-xs md:text-sm text-gray-400 dark:text-gray-500'>{stock} sản phẩm có sẵn</div>
                            </div>
                        </div>

                        {/* Success Message */}
                        {addedSuccess && (
                            <div className='mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2'>
                                <i className='bx bx-check-circle text-lg'></i>
                                Đã thêm vào giỏ hàng thành công!
                            </div>
                        )}

                        {/* Actions */}
                        <div className='flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6'>
                            <button onClick={handleAddToCart} className='flex items-center justify-center gap-2 border border-rose-600 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 py-2.5 px-4 md:px-6 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 transition text-sm md:text-base w-full sm:w-auto cursor-pointer'>
                                <i className='bx bxs-cart-add text-lg md:text-xl'></i> Thêm vào giỏ hàng
                            </button>
                            <button onClick={handleAddToCart} className='bg-rose-600 text-white py-2.5 px-6 md:px-8 rounded hover:bg-rose-700 transition font-medium text-sm md:text-base w-full sm:w-auto cursor-pointer'>
                                Mua ngay
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className='flex flex-col sm:flex-row gap-3 md:gap-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs md:text-sm text-gray-600 dark:text-gray-400'>
                            <div className='flex items-center gap-1.5'>
                                <i className='bx bxs-analyse text-base md:text-lg text-rose-600'></i>
                                Đổi ý miễn phí 15 ngày
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <i className='bx bxs-check-shield text-base md:text-lg text-rose-600'></i>
                                Hàng chính hãng 100%
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <i className='bx bxs-truck text-base md:text-lg text-rose-600'></i>
                                Miễn phí vận chuyển
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Details & Description */}
                <section className='w-full py-4 md:py-6 bg-white dark:bg-gray-900 mb-4 rounded-lg shadow-sm px-4 md:px-6'>
                    <div className='mb-6 md:mb-8'>
                        <h2 className='text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 py-2.5 px-4 border-l-4 border-amber-500 bg-gradient-to-r from-amber-100 to-transparent dark:from-amber-900/20 dark:to-transparent rounded-r-md flex items-center gap-2'><i className='bx bx-list-ul text-amber-500'></i> Chi tiết sản phẩm</h2>
                        <div className='grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-y-2 gap-x-3 md:gap-x-4 mt-4 text-xs md:text-sm dark:text-gray-300'>
                            <span className='font-medium text-gray-600 dark:text-gray-400'>Tên sản phẩm</span>
                            <span>{product.name}</span>
                            {currentVariant?.materials && (
                                <>
                                    <span className='font-medium text-gray-600 dark:text-gray-400'>Chất liệu</span>
                                    <span>{currentVariant.materials}</span>
                                </>
                            )}
                            {currentVariant?.weight && (
                                <>
                                    <span className='font-medium text-gray-600 dark:text-gray-400'>Trọng lượng</span>
                                    <span>{currentVariant.weight} gram</span>
                                </>
                            )}
                            {product.tags && (
                                <>
                                    <span className='font-medium text-gray-600 dark:text-gray-400'>Tags</span>
                                    <span>{product.tags}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className='mb-6 md:mb-8'>
                        <h2 className='text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 py-2.5 px-4 border-l-4 border-amber-500 bg-gradient-to-r from-amber-100 to-transparent dark:from-amber-900/20 dark:to-transparent rounded-r-md flex items-center gap-2'><i className='bx bx-detail text-amber-500'></i> Mô tả sản phẩm</h2>
                        <div
                            className='py-4 text-xs md:text-sm leading-relaxed text-gray-700 dark:text-gray-300 overflow-x-auto'
                            dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả' }}
                        />
                    </div>

                    {/* Reviews Section */}
                    <div>
                        <h2 className='text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 py-2.5 px-4 border-l-4 border-amber-500 bg-gradient-to-r from-amber-100 to-transparent dark:from-amber-900/20 dark:to-transparent rounded-r-md flex items-center gap-2'><i className='bx bx-star text-amber-500'></i> Đánh giá sản phẩm ({reviews.length})</h2>

                        {/* Review Summary */}
                        {reviews.length > 0 && (() => {
                            const avg = (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1);
                            const dist = [5, 4, 3, 2, 1].map(star => ({
                                star,
                                count: reviews.filter(r => Math.round(Number(r.rating)) === star).length,
                                pct: Math.round((reviews.filter(r => Math.round(Number(r.rating)) === star).length / reviews.length) * 100)
                            }));
                            return (
                                <div className='flex flex-col sm:flex-row gap-6 py-5 px-4 border-b border-gray-100 dark:border-gray-700'>
                                    <div className='flex flex-col items-center justify-center min-w-[120px]'>
                                        <div className='text-4xl font-bold text-amber-500'>{avg}</div>
                                        <div className='flex items-center gap-0.5 mt-1'>
                                            {[1, 2, 3, 4, 5].map(s => <i key={s} className={`bx bxs-star text-sm ${s <= Math.round(avg) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}></i>)}
                                        </div>
                                        <div className='text-xs text-gray-400 mt-1'>{reviews.length} đánh giá</div>
                                    </div>
                                    <div className='flex-1 flex flex-col gap-1.5'>
                                        {dist.map(d => (
                                            <div key={d.star} className='flex items-center gap-2 text-xs'>
                                                <span className='w-4 text-gray-500 dark:text-gray-400 text-right'>{d.star}</span>
                                                <i className='bx bxs-star text-amber-400 text-xs'></i>
                                                <div className='flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'>
                                                    <div className='h-full bg-amber-400 rounded-full transition-all duration-500' style={{ width: `${d.pct}%` }}></div>
                                                </div>
                                                <span className='w-7 text-gray-400 text-right'>{d.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Review Form */}
                        {isAuthenticated && reviewStatus.hasPurchased && !reviewStatus.hasReviewed && (
                            <div className='py-5 px-4 border-b border-gray-100 dark:border-gray-700'>
                                <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3'>Viết đánh giá của bạn</h3>
                                <div className='flex items-center gap-1 mb-3'>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <i key={s}
                                            className={`bx bxs-star text-2xl cursor-pointer transition-colors ${s <= (reviewHover || reviewRating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                                            onMouseEnter={() => setReviewHover(s)}
                                            onMouseLeave={() => setReviewHover(0)}
                                            onClick={() => setReviewRating(s)}
                                        ></i>
                                    ))}
                                    <span className='ml-2 text-sm text-gray-500 dark:text-gray-400'>{reviewRating}/5</span>
                                </div>
                                <textarea
                                    className='w-full border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-800 resize-none focus:outline-none focus:border-amber-400 transition-colors'
                                    rows={3}
                                    placeholder='Chia sẻ cảm nhận của bạn về sản phẩm...'
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                    maxLength={500}
                                />
                                <div className='flex justify-between items-center mt-2'>
                                    <span className='text-xs text-gray-400'>{reviewComment.length}/500</span>
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview}
                                        className='bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5'
                                    >
                                        {submittingReview ? <><i className='bx bx-loader-alt animate-spin'></i> Đang gửi...</> : <><i className='bx bx-send'></i> Gửi đánh giá</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isAuthenticated && reviewStatus.hasReviewed && (
                            <div className='py-3 px-4 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2'>
                                <i className='bx bx-check-circle text-lg'></i> Bạn đã đánh giá sản phẩm này
                            </div>
                        )}

                        {isAuthenticated && !reviewStatus.hasPurchased && !reviewStatus.hasReviewed && (
                            <div className='py-3 px-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2'>
                                <i className='bx bx-shopping-bag text-lg'></i> Bạn cần mua sản phẩm này để có thể đánh giá
                            </div>
                        )}

                        {!isAuthenticated && (
                            <div className='py-3 px-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2'>
                                <i className='bx bx-info-circle text-lg'></i> Đăng nhập để đánh giá sản phẩm
                            </div>
                        )}

                        {/* Review List */}
                        <div className='py-4'>
                            {reviews.length === 0 ? (
                                <div className='py-8 text-center text-gray-400 dark:text-gray-500 text-sm'>
                                    <i className='bx bx-message-square-dots text-4xl mb-2 block text-gray-300'></i>
                                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                                </div>
                            ) : (
                                <div className='space-y-0'>
                                    {reviews.map((rv, idx) => (
                                        <div key={rv.id || idx} className='flex gap-3 py-4 px-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors'>
                                            <div className='w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold text-sm'>
                                                {(rv.userName || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-2 mb-1'>
                                                    <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>{rv.userName || 'Ẩn danh'}</span>
                                                    <div className='flex items-center gap-0.5'>
                                                        {[1, 2, 3, 4, 5].map(s => <i key={s} className={`bx bxs-star text-xs ${s <= Math.round(Number(rv.rating)) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}></i>)}
                                                    </div>
                                                </div>
                                                <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>{rv.comment}</p>
                                                <p className='text-[10px] text-gray-400 mt-1.5'>{new Date(rv.createAt || rv.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className='w-full py-4 md:py-6 bg-white dark:bg-gray-900 mb-4 rounded-lg shadow-sm px-4 md:px-6'>
                        <h2 className='text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 py-2.5 px-4 border-l-4 border-amber-500 bg-gradient-to-r from-amber-100 to-transparent dark:from-amber-900/20 dark:to-transparent rounded-r-md flex items-center gap-2 mb-5'><i className='bx bx-bulb text-amber-500'></i> Sản phẩm gợi ý</h2>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4'>
                            {relatedProducts.map((rp) => {
                                const rpVariant = rp.variant;
                                const rpPrice = rpVariant?.discountPrice || rpVariant?.price || rp.minPrice || 0;
                                const rpOriginal = rpVariant?.price || rp.maxPrice || 0;
                                const rpHasDiscount = rpVariant?.discountPrice && rpVariant.discountPrice < rpVariant.price;
                                const rpDiscountPercent = rpHasDiscount ? Math.round((1 - rpVariant.discountPrice / rpVariant.price) * 100) : 0;
                                const rpImgs = rp.images?.$values || rp.images || [];
                                const rpImgPath = rpImgs.length > 0 ? (rpImgs[0].imagePath || rpImgs[0].ImagePath) : null;
                                return (
                                    <div
                                        key={rp.id}
                                        className='group cursor-pointer bg-white dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
                                        onClick={() => router.push(`/product/${rp.slug || rp.id}`)}
                                    >
                                        <div className='relative h-36 sm:h-44 md:h-48 overflow-hidden bg-gray-50 dark:bg-gray-700'>
                                            <img
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                                src={getImgSrc(rpImgPath)}
                                                alt={rp.name}
                                                loading='lazy'
                                                onError={(e) => { e.target.src = '/images/cameras-2.jpg'; }}
                                            />
                                            {rpHasDiscount && (
                                                <div className='absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow'>-{rpDiscountPercent}%</div>
                                            )}
                                        </div>
                                        <div className='p-3'>
                                            <p className='text-[10px] text-gray-400 uppercase tracking-wider mb-1'>{rp.category?.name || ''}</p>
                                            <h3 className='text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug min-h-[2.4em] group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors'>{rp.name}</h3>
                                            <div className='flex items-center gap-2 mt-2'>
                                                <span className='text-sm font-bold text-amber-600'>₫{formatPrice(rpPrice)}</span>
                                                {rpHasDiscount && (
                                                    <span className='text-[10px] text-gray-400 line-through'>₫{formatPrice(rpOriginal)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Image Lightbox */}
                <ImageLightbox
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    images={images.map(img => getImgSrc(img.imagePath))}
                    initialIndex={selectedImage}
                />
            </main>
            <Footer />
        </>
    );
}
