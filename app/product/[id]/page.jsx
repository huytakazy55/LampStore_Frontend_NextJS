"use client";


import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import BackToTop from '@/components/common/BackToTop';
import ProductManage from '@/services/ProductManage';
import ReviewService from '@/services/ReviewService';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import ImageLightbox from '@/components/common/ImageLightbox';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://capylumine.com';

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

const stripHtml = (html) => {
    if (!html) return '';
    const tmp = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (tmp) {
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    return html.replace(/<[^>]*>/g, '');
};

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [reviews, setReviews] = useState([]);
    const [canReview, setCanReview] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { relatedProducts } = useProducts(product?.categoryId, id);
    const isLoggedIn = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;

    // Fetch product data
    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await ProductManage.GetProductById(id);
                const data = response.data;

                // Normalize images
                const imgData = data.images?.$values || data.images || [];
                const images = Array.isArray(imgData) ? imgData : [];

                // Normalize options
                const optionTypes = data.optionTypes?.$values || data.optionTypes || [];
                const normalizedOptions = optionTypes.map(ot => ({
                    ...ot,
                    optionValues: ot.optionValues?.$values || ot.optionValues || []
                }));

                const productData = {
                    ...data,
                    images,
                    optionTypes: normalizedOptions,
                };

                setProduct(productData);

                if (images.length > 0) {
                    const firstPath = images[0].imagePath || images[0].ImagePath;
                    setSelectedImage(getImgSrc(firstPath));
                }

                // Set default options
                const defaults = {};
                normalizedOptions.forEach(ot => {
                    if (ot.optionValues.length > 0) {
                        defaults[ot.name] = {
                            value: ot.optionValues[0].value,
                            additionalPrice: ot.optionValues[0].additionalPrice || 0
                        };
                    }
                });
                setSelectedOptions(defaults);
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Không thể tải thông tin sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Fetch reviews
    useEffect(() => {
        if (!id) return;
        const fetchReviews = async () => {
            try {
                const response = await ReviewService.getReviews(id);
                setReviews(response.data?.$values || response.data || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReviews();
    }, [id]);

    // Check if user can review
    useEffect(() => {
        if (!id || !isLoggedIn) return;
        const fetchReviewStatus = async () => {
            try {
                const response = await ReviewService.canReview(id);
                setCanReview(response.data);
            } catch (error) {
                console.error('Error checking review status:', error);
            }
        };
        fetchReviewStatus();
    }, [id, isLoggedIn]);

    const handleSubmitReview = async () => {
        try {
            await ReviewService.submitReview(id, { rating: reviewRating, comment: reviewText });
            toast.success('Đánh giá đã được gửi!');
            setReviewText('');
            setReviewRating(5);
            setCanReview(false);
            // Reload reviews
            const response = await ReviewService.getReviews(id);
            setReviews(response.data?.$values || response.data || []);
        } catch (error) {
            toast.error('Có lỗi khi gửi đánh giá');
        }
    };

    const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));
    const handleIncrease = () => setQuantity(q => q + 1);

    const handleSelectOption = (typeName, val) => {
        setSelectedOptions(prev => ({
            ...prev,
            [typeName]: {
                value: val.value,
                additionalPrice: val.additionalPrice || 0
            }
        }));
    };

    const handleAddToCart = (e) => {
        if (!product) return;
        const variant = product.variant;
        const basePrice = variant?.discountPrice || variant?.price || 0;

        const imgs = product.images || [];
        let imgSrc = '';
        if (imgs.length > 0) {
            const path = imgs[0].imagePath || imgs[0].ImagePath;
            imgSrc = getImgSrc(path);
        }

        addToCart({
            productId: product.id,
            name: product.name,
            image: imgSrc,
            price: basePrice,
            quantity,
            selectedOptions,
        });

        toast.success('Đã thêm vào giỏ hàng!');
    };

    if (loading) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
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
                <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <i className='bx bx-error-circle text-6xl text-gray-300'></i>
                    <p className="text-lg text-gray-500">Không tìm thấy sản phẩm</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-amber-500 text-white rounded-lg">
                        Về trang chủ
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    const variant = product.variant;
    const price = variant?.discountPrice || variant?.price || 0;
    const originalPrice = variant?.price || 0;
    const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
    const images = product.images || [];
    const totalAdditional = Object.values(selectedOptions).reduce((s, o) => s + (o.additionalPrice || 0), 0);
    const finalPrice = price + totalAdditional;

    const imageUrls = images.map(img => getImgSrc(img.imagePath || img.ImagePath)).filter(Boolean);

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />
            <BackToTop />

            <div className="w-full bg-gray-50 min-h-screen">
                <div className="xl:max-w-[1440px] mx-auto px-4 xl:px-0 py-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <span className="hover:text-amber-600 cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="hover:text-amber-600 cursor-pointer" onClick={() => router.push('/categories')}>Sản phẩm</span>
                        <i className='bx bx-chevron-right text-xs'></i>
                        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>

                    {/* Product Detail */}
                    <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-lg p-6 border border-gray-100">
                        {/* Images */}
                        <div className="lg:w-1/2">
                            <div className="relative h-[400px] md:h-[500px] border border-gray-100 rounded-lg overflow-hidden cursor-zoom-in mb-4"
                                onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
                                {selectedImage && (
                                    <img src={selectedImage} alt={product.name} className="w-full h-full object-contain" />
                                )}
                                {hasDiscount && (
                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-400 text-white text-xs font-bold px-3 py-1 rounded-sm">
                                        -{Math.round((1 - variant.discountPrice / variant.price) * 100)}%
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => {
                                    const src = getImgSrc(img.imagePath || img.ImagePath);
                                    return (
                                        <div key={idx}
                                            className={`w-16 h-16 flex-shrink-0 border-2 rounded cursor-pointer overflow-hidden ${selectedImage === src ? 'border-amber-500' : 'border-gray-200'}`}
                                            onClick={() => setSelectedImage(src)}>
                                            <img src={src} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="lg:w-1/2">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

                            {/* Rating summary */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <i key={s} className={`bx bxs-star text-sm ${s <= (product.averageRating || 0) ? 'text-amber-400' : 'text-gray-300'}`}></i>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({reviews.length} đánh giá)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-2xl md:text-3xl font-bold text-amber-600">
                                    {formatPrice(finalPrice)}₫
                                </span>
                                {hasDiscount && (
                                    <span className="text-lg text-gray-400 line-through">{formatPrice(originalPrice)}₫</span>
                                )}
                            </div>

                            {/* Options */}
                            {(product.optionTypes || []).map(ot => (
                                <div key={ot.id} className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">{ot.name}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(ot.optionValues || []).map(val => (
                                            <button key={val.id}
                                                onClick={() => handleSelectOption(ot.name, val)}
                                                className={`px-4 py-2 text-sm border rounded-lg transition-all ${selectedOptions[ot.name]?.value === val.value
                                                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium'
                                                        : 'border-gray-200 text-gray-600 hover:border-amber-300'
                                                    }`}>
                                                {val.value}
                                                {val.additionalPrice > 0 && <span className="text-xs text-gray-400 ml-1">+{formatPrice(val.additionalPrice)}₫</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Quantity + Add to cart */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button onClick={handleDecrease} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                                        <i className='bx bx-minus'></i>
                                    </button>
                                    <span className="w-12 h-10 flex items-center justify-center text-sm font-medium border-x border-gray-200">{quantity}</span>
                                    <button onClick={handleIncrease} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                                        <i className='bx bx-plus'></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={handleAddToCart}
                                    className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all">
                                    <i className='bx bxs-cart-add text-xl'></i>
                                    Thêm vào giỏ hàng
                                </button>
                                <button onClick={() => toggleWishlist(product.id)}
                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300'
                                        }`}>
                                    <i className={`bx ${isInWishlist(product.id) ? 'bxs-heart' : 'bx-heart'} text-xl`}></i>
                                </button>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                                    <div className="text-sm text-gray-600 leading-relaxed prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: product.description }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="mt-8 bg-white rounded-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Đánh giá sản phẩm ({reviews.length})</h3>

                        {canReview && (
                            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-sm font-medium text-gray-700 mb-2">Viết đánh giá của bạn</p>
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <i key={s} onClick={() => setReviewRating(s)}
                                            className={`bx bxs-star text-xl cursor-pointer ${s <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}></i>
                                    ))}
                                </div>
                                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm của bạn..."
                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-24" />
                                <button onClick={handleSubmitReview}
                                    className="mt-2 px-6 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition">
                                    Gửi đánh giá
                                </button>
                            </div>
                        )}

                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="p-4 border border-gray-100 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-gray-800">{review.userName || 'Khách hàng'}</span>
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <i key={s} className={`bx bxs-star text-xs ${s <= review.rating ? 'text-amber-400' : 'text-gray-300'}`}></i>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">Chưa có đánh giá nào cho sản phẩm này</p>
                        )}
                    </div>

                    {/* Related products */}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm liên quan</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {relatedProducts.slice(0, 5).map(rp => {
                                    const rpImgs = rp.images?.$values || rp.images || [];
                                    const rpImg = rpImgs.length > 0 ? getImgSrc(rpImgs[0].imagePath || rpImgs[0].ImagePath) : '';
                                    const rpVariant = rp.variant;
                                    const rpPrice = rpVariant?.discountPrice || rpVariant?.price || 0;
                                    return (
                                        <div key={rp.id} className="cursor-pointer group" onClick={() => router.push(`/product/${rp.id}`)}>
                                            <div className="h-40 overflow-hidden rounded-lg border border-gray-100 mb-2">
                                                <img src={rpImg} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-amber-600">{rp.name}</p>
                                            <p className="text-sm font-bold text-amber-600 mt-1">{formatPrice(rpPrice)}₫</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {lightboxOpen && (
                <ImageLightbox
                    images={imageUrls}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNavigate={setLightboxIndex}
                />
            )}
        </>
    );
}
