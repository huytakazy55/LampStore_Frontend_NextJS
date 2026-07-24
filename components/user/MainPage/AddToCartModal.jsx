"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
const defaultImg = '/images/cameras-2.jpg';
import ProductManage from '@/services/ProductManage';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from '@/lib/router-compat';
import { resolveImagePath } from '@/lib/imageUtils';

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) => {
    if (!path) return defaultImg;
    return resolveImagePath(path, defaultImg);
};

const AddToCartModal = ({ isOpen, onClose, product, mode }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [variant, setVariant] = useState(null);
    const [variantTypes, setVariantTypes] = useState([]);
    const [images, setImages] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [showError, setShowError] = useState(false);
    const [addedSuccess, setAddedSuccess] = useState(false);
    const [displayImage, setDisplayImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch full product data when product changes
    useEffect(() => {
        if (product?.id) {
            ProductManage.GetProductById(product.id)
                .then(res => {
                    const data = res.data;
                    if (data) {
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
                    }
                })
                .catch(() => {
                    setVariant(product.variant || null);
                    const imgData = product.images?.$values || product.images;
                    setImages(Array.isArray(imgData) ? imgData : []);
                });
        }
        setQuantity(1);
        setSelectedOptions({});
        setShowError(false);
        setAddedSuccess(false);
        setDisplayImage(null);
        setCurrentImageIndex(0);
    }, [product]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted || !isOpen || !product) return null;

    // Tính tổng additionalPrice từ các option đã chọn
    const totalAdditional = Object.values(selectedOptions)
        .reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);

    const basePrice = variant?.discountPrice || variant?.price || product.minPrice || 0;
    const price = basePrice + totalAdditional;
    const originalPrice = (variant?.price || product.maxPrice || 0) + totalAdditional;
    const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
    const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;
    const stock = variant?.stock || 0;

    const isVideo = (src) => src?.toLowerCase().endsWith('.mp4') || src?.toLowerCase().endsWith('.webm');

    const allImageSrcs = [];
    if (product?.videoPath) {
        allImageSrcs.push(getImgSrc(product.videoPath));
    }
    if (images.length > 0) {
        allImageSrcs.push(...images.map(img => getImgSrc(img?.imagePath || img?.ImagePath)));
    }
    if (allImageSrcs.length === 0) {
        allImageSrcs.push(defaultImg);
    }

    const mainImage = allImageSrcs[0] || defaultImg;

    // The currently displayed image: variant option image overrides, otherwise carousel index
    const currentCarouselImage = displayImage || allImageSrcs[currentImageIndex] || mainImage;

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setDisplayImage(null);
        setCurrentImageIndex(prev => (prev - 1 + allImageSrcs.length) % allImageSrcs.length);
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        setDisplayImage(null);
        setCurrentImageIndex(prev => (prev + 1) % allImageSrcs.length);
    };

    const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));
    const handleIncrease = () => setQuantity((prev) => Math.min(prev + 1, stock || 999));

    const handleSelectOption = (typeName, val) => {
        setSelectedOptions(prev => ({
            ...prev,
            [typeName]: { value: val.value, additionalPrice: val.additionalPrice || 0 }
        }));
        // Update main image when option has an image
        if (val.imageUrl) {
            setDisplayImage(getImgSrc(val.imageUrl));
        }
        setShowError(false);
    };

    // Kiểm tra đã chọn đủ phân loại chưa
    const allOptionsSelected = variantTypes.length === 0 ||
        variantTypes.every(vt => selectedOptions[vt.name]);

    const handleAddToCart = (e) => {
        if (!allOptionsSelected) {
            setShowError(true);
            return;
        }

        // --- FLYING ANIMATION ---
        const imgEl = document.getElementById('modal-main-image');
        const cartEl = document.getElementById('floating-cart-btn') || document.querySelector('[aria-label="Giỏ hàng"]');

        if (imgEl) {
            const imgRect = imgEl.getBoundingClientRect();
            let targetRect;
            if (cartEl) {
                targetRect = cartEl.getBoundingClientRect();
            } else {
                targetRect = { left: window.innerWidth - 60, top: window.innerHeight - 60, width: 60, height: 60 };
            }

            const flyingImg = document.createElement('img');
            flyingImg.src = imgEl.src;
            flyingImg.style.position = 'fixed';
            flyingImg.style.zIndex = '999999';
            flyingImg.style.left = `${imgRect.left}px`;
            flyingImg.style.top = `${imgRect.top}px`;
            flyingImg.style.width = `${imgRect.width}px`;
            flyingImg.style.height = `${imgRect.height}px`;
            flyingImg.style.objectFit = 'contain';
            flyingImg.style.borderRadius = '8px';
            const isMovingDown = targetRect.top > imgRect.top;
            const topBezier = isMovingDown 
                ? 'cubic-bezier(0.3, -0.5, 0.8, 1)' 
                : 'cubic-bezier(0.3, 0, 0.7, 1.4)';

            flyingImg.style.transition = `left 0.8s linear, top 0.8s ${topBezier}, width 0.8s linear, height 0.8s linear, opacity 0.8s ease-in, transform 0.8s ease-in`;
            flyingImg.style.pointerEvents = 'none';
            document.body.appendChild(flyingImg);

            // Force reflow
            void flyingImg.offsetWidth;

            // Set end position
            flyingImg.style.left = `${targetRect.left + targetRect.width / 2 - 20}px`;
            flyingImg.style.top = `${targetRect.top + targetRect.height / 2 - 20}px`;
            flyingImg.style.width = '40px';
            flyingImg.style.height = '40px';
            flyingImg.style.opacity = '0.2';
            flyingImg.style.transform = 'scale(0.2) rotate(360deg)';

            setTimeout(() => {
                if (document.body.contains(flyingImg)) {
                    document.body.removeChild(flyingImg);
                }
                // Thêm hiệu ứng đón hàng cho giỏ hàng
                if (cartEl) {
                    cartEl.style.transform = 'scale(1.15)';
                    cartEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    setTimeout(() => {
                        cartEl.style.transform = 'scale(1)';
                    }, 200);
                }
            }, 800);
        }
        // --- END FLYING ANIMATION ---

        addToCart({
            productId: product.id,
            name: product.name,
            image: currentCarouselImage,
            price: basePrice,
            quantity,
            selectedOptions,
            weight: variant?.weight || 0
        });

        setAddedSuccess(true);
        setTimeout(() => {
            setAddedSuccess(false);
        }, 2000);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] transition-opacity duration-300">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm touch-none"></div>
            
            {/* Global Success Toast */}
            {addedSuccess && (
                <div className="fixed top-6 sm:top-10 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-800 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700 animate-fadeIn pointer-events-none transition-all">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                        <i className="bx bx-check text-2xl"></i>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base pr-2 whitespace-nowrap">
                        Đã thêm vào giỏ hàng thành công
                    </span>
                </div>
            )}

            <div className="fixed inset-0 overflow-y-auto" onClick={onClose}>
                <div className="flex min-h-full items-start justify-center p-4 sm:p-4">
                    {/* Modal Box */}
                    <div
                        className="relative m-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90dvh] sm:max-h-[85vh] animate-fadeIn overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-1 overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-500 transition-colors z-10"
                >
                    <i className="bx bx-x text-2xl sm:text-3xl"></i>
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Left: Image Carousel */}
                    <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 md:border-r border-b md:border-b-0 border-gray-100 dark:border-gray-800 relative flex flex-col">
                        {/* Main Image Container */}
                        <div className="relative w-full aspect-square md:aspect-auto md:flex-1">
                            {allImageSrcs.length > 1 && (
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 shadow-md hover:bg-white dark:hover:bg-gray-600 transition-all text-gray-600 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500 cursor-pointer backdrop-blur-sm"
                                    aria-label="Previous image"
                                >
                                    <i className="bx bx-chevron-left text-xl"></i>
                                </button>
                            )}
                            {isVideo(currentCarouselImage) ? (
                                <video
                                    src={currentCarouselImage}
                                    className="absolute inset-0 w-full h-full p-2 sm:p-4 object-contain transition-all duration-300 bg-black/5 dark:bg-black/20"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    controls
                                />
                            ) : (
                                <img
                                    id="modal-main-image"
                                    src={currentCarouselImage}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full p-2 sm:p-4 object-contain transition-all duration-300"
                                    onError={(e) => { e.target.src = defaultImg; }}
                                />
                            )}
                            {allImageSrcs.length > 1 && (
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 shadow-md hover:bg-white dark:hover:bg-gray-600 transition-all text-gray-600 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500 cursor-pointer backdrop-blur-sm"
                                    aria-label="Next image"
                                >
                                    <i className="bx bx-chevron-right text-xl"></i>
                                </button>
                            )}

                            {/* Dot Indicators */}
                            {allImageSrcs.length > 1 && (
                                <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                                    {allImageSrcs.map((src, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDisplayImage(null);
                                                setCurrentImageIndex(idx);
                                            }}
                                            className={`relative flex items-center justify-center rounded-full transition-all cursor-pointer shadow-sm ${
                                                (!displayImage && currentImageIndex === idx)
                                                    ? 'w-2.5 h-2.5 bg-primary-600 scale-110'
                                                    : 'w-2 h-2 bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400'
                                            }`}
                                            aria-label={`View image ${idx + 1}`}
                                        >
                                            {isVideo(allImageSrcs[idx]) && (
                                                <i className={`bx bx-play absolute text-white ${(!displayImage && currentImageIndex === idx) ? 'text-[8px]' : 'text-[6px]'}`}></i>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="w-full md:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col bg-white dark:bg-gray-900">
                        <h2 className="text-base sm:text-xl font-medium text-gray-800 dark:text-gray-100 mb-1 sm:mb-2 leading-snug pr-6">
                            {product.name}
                        </h2>

                        {/* Price Area */}
                        <div className="flex items-end gap-3 mt-1 sm:mt-2 mb-3 sm:mb-5 bg-primary-50/50 dark:bg-primary-900/20 p-2.5 sm:p-4 rounded-md border border-primary-100/50 dark:border-primary-800/30">
                            <span className="text-xl sm:text-2xl font-bold text-primary-600">₫{formatPrice(price)}</span>
                            {hasDiscount && (
                                <>
                                    <span className="text-sm line-through text-gray-400 dark:text-gray-500 mb-1">
                                        ₫{formatPrice(originalPrice)}
                                    </span>
                                    <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded font-medium mb-1">
                                        -{discountPercent}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Variant Types — Selectable */}
                        {variantTypes.length > 0 && (
                            <div className="mb-2 sm:mb-4">
                                {variantTypes.map((vt) => {
                                    const values = Array.isArray(vt.values) ? vt.values : [];
                                    if (values.length === 0) return null;
                                    const isRequired = !selectedOptions[vt.name] && showError;
                                    const hasImages = values.some(v => v.imageUrl);
                                    return (
                                        <div key={vt.id} className="mb-3">
                                            <h3 className={`text-sm font-medium mb-2 ${isRequired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {vt.name}: {isRequired && <span className="text-xs font-normal">(Vui lòng chọn)</span>}
                                            </h3>
                                            <div className={`flex flex-wrap gap-2 ${hasImages ? 'gap-3' : ''}`}>
                                                {values.map((val) => {
                                                    const isSelected = selectedOptions[vt.name]?.value === val.value;
                                                    const optionImage = val.imageUrl ? getImgSrc(val.imageUrl) : null;
                                                    return (
                                                        <button
                                                            key={val.id}
                                                            onClick={() => handleSelectOption(vt.name, val)}
                                                            className={`flex items-center gap-2 py-1.5 px-3 cursor-pointer text-sm border rounded transition-all ${isSelected
                                                                ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/30 font-medium ring-1 ring-primary-500/20'
                                                                : isRequired
                                                                    ? 'border-red-300 hover:border-primary-300 text-gray-600 dark:text-gray-400'
                                                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            {optionImage && (
                                                                <img
                                                                    src={optionImage}
                                                                    alt={val.value}
                                                                    className={`w-8 h-8 rounded object-cover border ${isSelected ? 'border-primary-400' : 'border-gray-200 dark:border-gray-600'}`}
                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                />
                                                            )}
                                                            <span>
                                                                {val.value}
                                                                {val.additionalPrice > 0 && (
                                                                    <span className="ml-1 text-xs text-primary-600">+₫{formatPrice(val.additionalPrice)}</span>
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Variant Info */}
                        {variant && variant.materials && (
                            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>Chất liệu: {variant.materials}</span>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-3 sm:mb-6 flex items-center gap-3 sm:gap-6 flex-wrap">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng:</h3>
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden bg-white dark:bg-gray-800">
                                <button onClick={handleDecrease} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 transition font-medium text-lg">-</button>
                                <span aria-label="Số lượng sản phẩm" className="w-12 h-9 flex items-center justify-center text-sm border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 select-none">
                                    {quantity}
                                </span>
                                <button onClick={handleIncrease} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 transition font-medium text-lg">+</button>
                            </div>
                            <span className="text-sm text-gray-400 dark:text-gray-500">{stock} sản phẩm có sẵn</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex gap-3 sm:gap-4">
                                {(!mode || mode === 'add_to_cart') && (
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-primary-600 text-white py-2.5 sm:py-3 rounded-md font-medium hover:bg-primary-700 transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm sm:text-base"
                                    >
                                        <i className="bx bx-cart-add text-xl"></i>
                                        Thêm vào giỏ
                                    </button>
                                )}
                                {(!mode || mode === 'buy_now') && (
                                    <button
                                        onClick={() => {
                                            if (!allOptionsSelected) {
                                                setShowError(true);
                                                return;
                                            }
                                            // Tạo item checkout trực tiếp
                                            const totalAdditionalBuy = Object.values(selectedOptions)
                                                .reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);
                                            const buyItem = {
                                                key: `buynow_${product.id}_${Date.now()}`,
                                                productId: product.id,
                                                name: product.name,
                                                image: mainImage,
                                                basePrice: basePrice,
                                                finalPrice: basePrice + totalAdditionalBuy,
                                                quantity,
                                                selectedOptions,
                                                weight: variant?.weight || 0
                                            };
                                            onClose();
                                            sessionStorage.setItem('buyNowItems', JSON.stringify([buyItem]));
                                            navigate('/checkout');
                                        }}
                                        className="flex-1 bg-primary-600 text-white py-2.5 sm:py-3 rounded-md font-medium hover:bg-primary-700 transition-colors shadow-sm cursor-pointer text-sm sm:text-base flex justify-center items-center gap-2"
                                    >
                                        {mode === 'buy_now' ? <i className="bx bx-credit-card text-xl"></i> : null}
                                        Mua ngay
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>,
        document.body
    );
};

export default AddToCartModal;
