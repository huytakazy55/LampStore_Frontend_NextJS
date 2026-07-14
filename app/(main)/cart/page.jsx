"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) => {
    if (!path) return '/images/cameras-2.jpg';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

export default function CartPage() {
    const router = useRouter();
    const { cartItems, updateQuantity, removeFromCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, itemKey: null, isBulk: false });

    // Voucher states
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState(null);

    // Fetch vouchers when modal opens
    useEffect(() => {
        if (isVoucherModalOpen && discountCodes.length === 0) {
            setLoadingDiscounts(true);
            const token = localStorage.getItem('token');
            if (token) {
                fetch(`${API_ENDPOINT}/api/DiscountCode/my-codes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        const codes = data?.$values || data || [];
                        setDiscountCodes(codes);
                    })
                    .catch(err => console.error("Lỗi khi tải mã giảm giá", err))
                    .finally(() => setLoadingDiscounts(false));
            } else {
                setLoadingDiscounts(false);
            }
        }
    }, [isVoucherModalOpen]);

    // Auto cleanup selected items if they are removed from cart externally
    useEffect(() => {
        setSelectedItems(prev => {
            const next = new Set();
            prev.forEach(key => {
                if (cartItems.some(item => item.key === key)) {
                    next.add(key);
                }
            });
            return next;
        });
    }, [cartItems]);

    // Calculations
    const selectedCartItems = useMemo(() => cartItems.filter(item => selectedItems.has(item.key)), [cartItems, selectedItems]);
    const totalSelectedPrice = selectedCartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const totalSelectedCount = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

    // Auto remove applied voucher if total falls below min order
    useEffect(() => {
        if (appliedVoucher && totalSelectedPrice < appliedVoucher.minOrderAmount) {
            setAppliedVoucher(null);
            toast.info('Đã gỡ mã giảm giá do tổng thanh toán không đủ điều kiện');
        }
    }, [totalSelectedPrice, appliedVoucher]);

    const discountAmount = useMemo(() => {
        if (!appliedVoucher) return 0;
        if (totalSelectedPrice < appliedVoucher.minOrderAmount) return 0;

        if (appliedVoucher.discountType === 'Percentage') {
            let amount = (totalSelectedPrice * appliedVoucher.discountPercentage) / 100;
            if (appliedVoucher.maxDiscountAmount > 0 && amount > appliedVoucher.maxDiscountAmount) {
                amount = appliedVoucher.maxDiscountAmount;
            }
            return amount;
        }
        return appliedVoucher.discountAmount;
    }, [appliedVoucher, totalSelectedPrice]);

    const finalTotal = Math.max(0, totalSelectedPrice - discountAmount);

    // Handle single item selection
    const handleSelect = (key) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cartItems.map(item => item.key)));
        }
    };

    // Actions
    const handleBulkDeleteClick = () => {
        if (selectedItems.size === 0) {
            toast.warn('Vui lòng chọn sản phẩm để xóa');
            return;
        }
        setDeleteConfirm({ isOpen: true, itemKey: null, isBulk: true });
    };

    const handleSingleDeleteClick = (key) => {
        setDeleteConfirm({ isOpen: true, itemKey: key, isBulk: false });
    };

    const executeDelete = () => {
        if (deleteConfirm.isBulk) {
            selectedItems.forEach(key => removeFromCart(key));
            setSelectedItems(new Set());
        } else if (deleteConfirm.itemKey) {
            removeFromCart(deleteConfirm.itemKey);
        }
        setDeleteConfirm({ isOpen: false, itemKey: null, isBulk: false });
    };



    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            toast.warn('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
            return;
        }
        sessionStorage.setItem('buyNowItems', JSON.stringify(selectedCartItems));
        if (appliedVoucher) {
            sessionStorage.setItem('selectedVoucher', appliedVoucher.code);
        } else {
            sessionStorage.removeItem('selectedVoucher');
        }
        router.push('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className="min-h-[60vh] bg-gray-50 flex flex-col items-center justify-center gap-4 py-10">
                    <i className='bx bx-cart text-6xl text-gray-300'></i>
                    <p className="text-gray-500 text-lg">Giỏ hàng của bạn còn trống</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
                        MUA NGAY
                    </button>
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
            <div className="bg-gray-50 min-h-[60vh] pb-16 pt-6">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Breadcrumb */}
                    <div className='flex items-center gap-2 text-sm text-gray-500 mb-6'>
                        <span className='cursor-pointer hover:text-primary-600 transition-colors' onClick={() => router.push('/')}>Trang chủ</span>
                        <i className='bx bx-chevron-right'></i>
                        <span className='text-gray-800 font-medium'>Giỏ hàng</span>
                    </div>
                    {/* Header Row (Desktop) */}
                    <div className="bg-white rounded shadow-sm mb-3 px-5 py-4 hidden md:flex items-center text-sm text-gray-500 font-medium">
                        <div className="flex items-center w-[45%] lg:w-[45%]">
                            <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer accent-primary-600 mr-4"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                            <span>Sản Phẩm</span>
                        </div>
                        <div className="w-[15%] text-center">Đơn Giá</div>
                        <div className="w-[15%] text-center">Số Lượng</div>
                        <div className="w-[15%] text-center">Số Tiền</div>
                        <div className="w-[10%] lg:w-[10%] text-center">Thao Tác</div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded shadow-sm mb-4">
                        {cartItems.map(item => {
                            const optionText = Object.entries(item.selectedOptions || {})
                                .map(([, opt]) => opt.value)
                                .join(', ');
                            const isLiked = isInWishlist(item.productId);

                            return (
                                <div key={item.key} className="flex flex-col md:flex-row items-start md:items-center p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    {/* Product Info */}
                                    <div className="flex items-start md:items-center w-full md:w-[45%] lg:w-[45%] mb-4 md:mb-0">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 cursor-pointer accent-primary-600 mr-4 mt-2 md:mt-0 shrink-0"
                                            checked={selectedItems.has(item.key)}
                                            onChange={() => handleSelect(item.key)}
                                        />
                                        <Link href={`/product/${item.productSlug || item.productId}`} className="shrink-0 block">
                                            <div className="w-20 h-20 bg-gray-50 flex items-center justify-center border border-gray-200 rounded p-1 overflow-hidden">
                                                <img src={getImgSrc(item.image)} alt={item.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                        </Link>
                                        <div className="ml-4 flex-1">
                                            {isLiked && <span className="inline-block text-[10px] bg-primary-100 text-primary-600 px-1 py-0.5 rounded font-medium border border-primary-200 mb-1">Yêu thích</span>}
                                            <Link href={`/product/${item.productSlug || item.productId}`} className="block">
                                                <span className="text-sm text-gray-800 line-clamp-2 hover:text-primary-600 transition-colors">{item.name}</span>
                                            </Link>
                                            {optionText && (
                                                <div className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-primary-600 inline-block">
                                                    Phân loại hàng: ▾<br />{optionText}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop / Mobile Grid */}
                                    <div className="flex items-center justify-between w-full md:w-[55%] lg:w-[55%]">
                                        {/* Price */}
                                        <div className="w-[30%] md:w-[27%] text-center">
                                            {item.basePrice < item.finalPrice && (
                                                <span className="text-sm text-gray-400 line-through mr-1 block lg:inline">{formatPrice(item.basePrice)}₫</span>
                                            )}
                                            <span className="text-sm text-gray-800">{formatPrice(item.finalPrice)}₫</span>
                                        </div>

                                        {/* Quantity */}
                                        <div className="w-[30%] md:w-[27%] flex justify-center">
                                            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >−</button>
                                                <input
                                                    type="text"
                                                    className="w-10 h-7 text-center text-sm border-x border-gray-300 outline-none bg-white"
                                                    value={item.quantity}
                                                    readOnly
                                                />
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                                                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                                >+</button>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="w-[30%] md:w-[27%] text-center text-sm text-primary-600 font-medium">
                                            {formatPrice(item.finalPrice * item.quantity)}₫
                                        </div>

                                        <div className="w-[10%] md:w-[19%] flex flex-col items-center gap-1.5">
                                            <button onClick={() => handleSingleDeleteClick(item.key)} className="text-sm text-gray-800 hover:text-primary-600 transition-colors">
                                                Xóa
                                            </button>
                                            <button onClick={() => toggleWishlist(item.productId)} className="text-[11px] text-primary-600 hover:underline">
                                                {isLiked ? 'Bỏ thích' : 'Lưu yêu thích'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Voucher Row */}
                    <div className="bg-white rounded shadow-sm mb-4 px-5 py-4 flex items-center justify-between md:justify-end border border-gray-100">
                        <span className="text-gray-800 flex items-center text-sm font-medium">
                            <i className='bx bxs-coupon text-primary-500 mr-2 text-xl'></i>
                            CapyLumine Voucher
                        </span>

                        <div className="ml-8 flex items-center gap-3">
                            {appliedVoucher && (
                                <div className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200">
                                    Mã: {appliedVoucher.code} (-{formatPrice(discountAmount)}₫)
                                </div>
                            )}
                            <button className="text-blue-600 hover:underline text-sm cursor-pointer" onClick={() => setIsVoucherModalOpen(true)}>
                                Chọn hoặc nhập mã
                            </button>
                        </div>
                    </div>

                    {/* Footer Sticky Bar */}
                    <div className="fixed md:sticky bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto bg-white border-t border-gray-200 md:border md:border-t-2 md:border-t-primary-500 md:rounded shadow-[0_-4px_10px_rgba(0,0,0,0.05)] px-4 py-3 md:px-5 md:py-4 z-50 flex flex-col md:flex-row items-center justify-between gap-3 max-w-6xl mx-auto md:w-full">

                        {/* Left Actions */}
                        <div className="flex items-center justify-between md:justify-start gap-4 text-sm w-full md:w-auto">
                            <label className="flex items-center cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer accent-primary-600 mr-2"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                                Chọn Tất Cả ({cartItems.length})
                            </label>
                            <div className="flex items-center gap-4">
                                <button onClick={handleBulkDeleteClick} className="hover:text-primary-600 hover:underline">Xóa</button>
                            </div>
                        </div>

                        {/* Right Info & Checkout */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto">
                            {/* Total & Checkout */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <div className="text-right">
                                    <div className="text-sm">
                                        Tổng thanh toán ({totalSelectedCount} SP): <span className="text-xl text-primary-600 font-medium leading-none">{formatPrice(finalTotal)}₫</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">Tiết kiệm {formatPrice(discountAmount)}₫</div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className={`px-6 md:px-8 py-2 md:py-3 text-white rounded cursor-pointer transition-colors whitespace-nowrap ${selectedItems.size > 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                >
                                    Mua Hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Bạn có chắc chắn muốn bỏ {deleteConfirm.isBulk ? 'các sản phẩm đã chọn' : 'sản phẩm này'} khỏi giỏ hàng?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, itemKey: null, isBulk: false })}
                                className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                            >
                                Trở lại
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded transition-colors shadow-sm"
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Voucher Selection Modal */}
            {isVoucherModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">Chọn Voucher</h3>
                            <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                                <i className="bx bx-x text-2xl leading-none"></i>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                            {loadingDiscounts ? (
                                <div className='text-center py-8 text-gray-500'>Đang tải mã giảm giá...</div>
                            ) : discountCodes.length > 0 ? (
                                <div className='flex flex-col gap-3'>
                                    {discountCodes.map(code => {
                                        const isEligible = totalSelectedPrice >= code.minOrderAmount;
                                        return (
                                            <div key={code.code} className={`border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm transition-all ${isEligible ? 'border-primary-200 hover:border-primary-400' : 'border-gray-200 opacity-60'}`}>
                                                <div className="flex-1">
                                                    <div className='font-bold text-base text-primary-600'>{code.code}</div>
                                                    <div className='text-sm text-gray-700 mt-0.5 font-medium'>
                                                        Giảm {code.discountType === 'Percentage'
                                                            ? `${code.discountPercentage}% ${code.maxDiscountAmount > 0 ? `(Tối đa ${formatPrice(code.maxDiscountAmount)}₫)` : ''}`
                                                            : `${formatPrice(code.discountAmount)}₫`
                                                        }
                                                    </div>
                                                    <div className='text-xs text-gray-500 mt-1'>Đơn tối thiểu: {formatPrice(code.minOrderAmount)}₫</div>
                                                    <div className='text-xs text-gray-500 mt-0.5'>HSD: {new Date(code.expiryDate).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                                <div className="ml-4">
                                                    <button
                                                        type='button'
                                                        disabled={!isEligible}
                                                        onClick={() => {
                                                            setAppliedVoucher(code);
                                                            setIsVoucherModalOpen(false);
                                                            toast.success('Đã áp dụng mã giảm giá!');
                                                        }}
                                                        className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${isEligible
                                                            ? 'bg-primary-50 text-primary-600 border border-primary-500 hover:bg-primary-600 hover:text-white cursor-pointer'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        Sử dụng
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center py-10 text-center'>
                                    <i className='bx bx-purchase-tag text-4xl text-gray-300 mb-3'></i>
                                    <p className='text-gray-500 text-sm'>Bạn chưa có mã giảm giá nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
