"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
const defaultImg = '/images/cameras-2.jpg';
import ProductManage from '@/services/ProductManage';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from '@/lib/router-compat';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) =>
{
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) =>
{
    if (!path) return defaultImg;
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

const AddToCartModal = ({ isOpen, onClose, product }) =>
{
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [variant, setVariant] = useState(null);
    const [variantTypes, setVariantTypes] = useState([]);
    const [images, setImages] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [showError, setShowError] = useState(false);
    const [addedSuccess, setAddedSuccess] = useState(false);

    // Fetch full product data when product changes
    useEffect(() =>
    {
        if (product?.id)
        {
            ProductManage.GetProductById(product.id)
                .then(res =>
                {
                    const data = res.data;
                    if (data)
                    {
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
                .catch(() =>
                {
                    setVariant(product.variant || null);
                    const imgData = product.images?.$values || product.images;
                    setImages(Array.isArray(imgData) ? imgData : []);
                });
        }
        setQuantity(1);
        setSelectedOptions({});
        setShowError(false);
        setAddedSuccess(false);
    }, [product]);

    useEffect(() =>
    {
        if (isOpen)
        {
            document.body.style.overflow = 'hidden';
        } else
        {
            document.body.style.overflow = 'unset';
        }
        return () =>
        {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    // Tính tổng additionalPrice từ các option đã chọn
    const totalAdditional = Object.values(selectedOptions)
        .reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);

    const basePrice = variant?.discountPrice || variant?.price || product.minPrice || 0;
    const price = basePrice + totalAdditional;
    const originalPrice = (variant?.price || product.maxPrice || 0) + totalAdditional;
    const hasDiscount = variant?.discountPrice && variant.discountPrice < variant.price;
    const discountPercent = hasDiscount ? Math.round((1 - variant.discountPrice / variant.price) * 100) : 0;
    const stock = variant?.stock || 0;

    const mainImage = images.length > 0
        ? getImgSrc(images[0]?.imagePath || images[0]?.ImagePath)
        : defaultImg;

    const handleDecrease = () => setQuantity((prev) => Math.max(prev - 1, 1));
    const handleIncrease = () => setQuantity((prev) => Math.min(prev + 1, stock || 999));

    const handleSelectOption = (typeName, val) =>
    {
        setSelectedOptions(prev => ({
            ...prev,
            [typeName]: { value: val.value, additionalPrice: val.additionalPrice || 0 }
        }));
        setShowError(false);
    };

    // Kiểm tra đã chọn đủ phân loại chưa
    const allOptionsSelected = variantTypes.length === 0 ||
        variantTypes.every(vt => selectedOptions[vt.name]);

    const handleAddToCart = (e) =>
    {
        if (!allOptionsSelected)
        {
            setShowError(true);
            return;
        }

        addToCart({
            productId: product.id,
            name: product.name,
            image: mainImage,
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
                image: mainImage
            }
        }));

        setAddedSuccess(true);
        setTimeout(() =>
        {
            setAddedSuccess(false);
        }, 2000);
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 transition-opacity"
            onClick={onClose}
        >
            {/* Modal Box */}
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl overflow-hidden relative animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors z-10"
                >
                    <i className="bx bx-x text-3xl"></i>
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left: Image */}
                    <div className="w-full md:w-2/5 bg-gray-50 dark:bg-gray-800 p-6 flex justify-center items-center border-r border-gray-100 dark:border-gray-700">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="max-h-80 w-auto object-contain drop-shadow-md rounded"
                            onError={(e) => { e.target.src = defaultImg; }}
                        />
                    </div>

                    {/* Right: Details */}
                    <div className="w-full md:w-3/5 p-6 flex flex-col max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-2 leading-snug pr-6">
                            {product.name}
                        </h2>

                        {/* Price Area */}
                        <div className="flex items-end gap-3 mt-2 mb-5 bg-rose-50/50 dark:bg-rose-900/20 p-4 rounded-md border border-rose-100/50 dark:border-rose-800/30">
                            <span className="text-2xl font-bold text-rose-600">₫{formatPrice(price)}</span>
                            {hasDiscount && (
                                <>
                                    <span className="text-sm line-through text-gray-400 dark:text-gray-500 mb-1">
                                        ₫{formatPrice(originalPrice)}
                                    </span>
                                    <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded font-medium mb-1">
                                        -{discountPercent}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Variant Types — Selectable */}
                        {variantTypes.length > 0 && (
                            <div className="mb-4">
                                {variantTypes.map((vt) =>
                                {
                                    const values = Array.isArray(vt.values) ? vt.values : [];
                                    if (values.length === 0) return null;
                                    const isRequired = !selectedOptions[vt.name] && showError;
                                    return (
                                        <div key={vt.id} className="mb-3">
                                            <h3 className={`text-sm font-medium mb-2 ${isRequired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {vt.name}: {isRequired && <span className="text-xs font-normal">(Vui lòng chọn)</span>}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {values.map((val) =>
                                                {
                                                    const isSelected = selectedOptions[vt.name]?.value === val.value;
                                                    return (
                                                        <button
                                                            key={val.id}
                                                            onClick={() => handleSelectOption(vt.name, val)}
                                                            className={`py-1.5 px-4 cursor-pointer text-sm border rounded transition-all ${isSelected
                                                                ? 'border-rose-600 text-rose-600 bg-rose-50 dark:bg-rose-900/30 font-medium ring-1 ring-rose-600/20'
                                                                : isRequired
                                                                    ? 'border-red-300 hover:border-rose-300 text-gray-600 dark:text-gray-400'
                                                                    : 'border-gray-300 dark:border-gray-600 hover:border-rose-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            {val.value}
                                                            {val.additionalPrice > 0 && (
                                                                <span className="ml-1 text-xs text-rose-500">+₫{formatPrice(val.additionalPrice)}</span>
                                                            )}
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
                        <div className="mb-6 flex items-center gap-6">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng:</h3>
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden bg-white dark:bg-gray-800">
                                <button onClick={handleDecrease} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-rose-600 transition font-medium text-lg">-</button>
                                <input type="number" value={quantity} readOnly className="w-12 h-9 text-center text-sm outline-none border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200" />
                                <button onClick={handleIncrease} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-rose-600 transition font-medium text-lg">+</button>
                            </div>
                            <span className="text-sm text-gray-400 dark:text-gray-500">{stock} sản phẩm có sẵn</span>
                        </div>

                        {/* Success Message */}
                        {addedSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2 animate-fadeIn">
                                <i className="bx bx-check-circle text-lg"></i>
                                Đã thêm vào giỏ hàng thành công!
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-auto flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-rose-50 dark:bg-rose-900/30 border border-rose-600 text-rose-600 dark:text-rose-400 py-3 rounded-md font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex justify-center items-center gap-2 cursor-pointer"
                            >
                                <i className="bx bx-cart-add text-xl"></i>
                                Thêm vào giỏ
                            </button>
                            <button
                                onClick={() =>
                                {
                                    if (!allOptionsSelected)
                                    {
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
                                        selectedOptions
                                    };
                                    onClose();
                                    navigate('/checkout', { state: { buyNowItems: [buyItem] } });
                                }}
                                className="flex-1 bg-rose-600 text-white py-3 rounded-md font-medium hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                            >
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddToCartModal;
