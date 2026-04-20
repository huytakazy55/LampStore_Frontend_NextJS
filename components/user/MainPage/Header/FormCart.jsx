"use client";

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from '@/lib/router-compat';
const defaultImg = '/images/cameras-2.jpg';

const formatPrice = (price) =>
{
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const FormCart = ({ toggleCart, popupRef, setToggleCart }) =>
{
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleViewProduct = (productId) =>
    {
        setToggleCart(false);
        navigate(`/product/${productId}`);
    };

    return (
        <div
            ref={popupRef}
            onClick={(e) => e.stopPropagation()}
            className={`cart-modal w-[28rem] max-h-[32rem] absolute shadow-2xl -right-[4rem] top-14 z-[1000] border-t-4 bg-white dark:bg-gray-900 border-rose-600 rounded-b-lg flex flex-col transition-all duration-300 ease-out origin-top-right ${toggleCart ? 'visible opacity-100 scale-100 translate-y-0' : 'invisible opacity-0 scale-95 translate-y-2'
                }`}
            id='FormCart'
        >
            <div className='p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center'>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-100'>Giỏ hàng của bạn ({cartItems.length})</h3>
                {cartItems.length > 0 && (
                    <span className='text-sm text-rose-600 cursor-pointer hover:underline' onClick={() => navigate('/cart')}>Xem tất cả</span>
                )}
            </div>

            <div className='w-full overflow-y-auto custom-scrollbar flex-1 max-h-[22rem] p-4 flex flex-col gap-4'>
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <i className='bx bx-cart text-5xl mb-3'></i>
                        <p className="text-sm">Giỏ hàng trống</p>
                        <p className="text-xs mt-1">Hãy thêm sản phẩm yêu thích!</p>
                    </div>
                ) : (
                    cartItems.map((item) =>
                    {
                        const optionText = Object.entries(item.selectedOptions || {})
                            .map(([, opt]) => opt.value)
                            .join(', ');

                        return (
                            <div key={item.key} className='flex justify-between items-start w-full group'>
                                <div
                                    className='w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer'
                                    onClick={() => handleViewProduct(item.productId)}
                                >
                                    <img
                                        className='max-h-full max-w-full object-contain'
                                        src={item.image || defaultImg}
                                        alt={item.name}
                                        onError={(e) => { e.target.src = defaultImg; }}
                                    />
                                </div>
                                <div className='flex-1 ml-4'>
                                    <span
                                        onClick={() => handleViewProduct(item.productId)}
                                        className='leading-snug text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-rose-600 line-clamp-2 mb-1 transition-colors cursor-pointer block'
                                    >
                                        {item.name}
                                    </span>
                                    {optionText && (
                                        <div className='text-xs text-gray-500 dark:text-gray-400 mb-2'>Phân loại: {optionText}</div>
                                    )}
                                    <div className='flex justify-between items-center'>
                                        <div className='flex items-center gap-3'>
                                            <span className="font-semibold text-rose-600">{formatPrice(item.finalPrice)} ₫</span>
                                        </div>
                                        <div className='flex items-center border border-gray-200 dark:border-gray-700 rounded overflow-hidden'>
                                            <button
                                                onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                                className='w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs'
                                                disabled={item.quantity <= 1}
                                            >-</button>
                                            <span className='w-8 h-6 flex items-center justify-center text-xs border-x border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                                className='w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs'
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.key)}
                                    className='ml-2 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors p-1'
                                >
                                    <i className='bx bx-trash text-lg'></i>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {cartItems.length > 0 && (
                <div className='p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg'>
                    <div className='flex justify-between items-center mb-4'>
                        <span className='text-gray-500 dark:text-gray-400 font-medium'>Tổng tạm tính:</span>
                        <span className='text-xl font-bold text-rose-600'>{formatPrice(cartTotal)} ₫</span>
                    </div>
                    <div className='flex justify-between gap-3'>
                        <button
                            onClick={() => { setToggleCart(false); navigate('/checkout'); }}
                            className='flex-1 py-2.5 px-4 rounded-md text-sm font-medium border border-rose-600 text-rose-600 bg-white dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer'
                        >
                            Xem giỏ hàng
                        </button>
                        <button
                            onClick={() => { setToggleCart(false); navigate('/checkout'); }}
                            className='flex-1 py-2.5 px-4 rounded-md text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer'
                        >
                            Thanh toán
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormCart;