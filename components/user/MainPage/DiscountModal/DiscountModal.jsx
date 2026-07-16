import React, { useState, useEffect } from 'react';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

export default function DiscountModal({ isOpen, onClose, totalAmount, onApply }) {
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);

    useEffect(() => {
        if (isOpen && discountCodes.length === 0) {
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
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <i className="bx bx-purchase-tag-alt text-primary-600"></i> Chọn Voucher
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer">
                        <i className="bx bx-x text-2xl leading-none"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {loadingDiscounts ? (
                        <div className='text-center py-8 text-gray-500'>
                            <i className='bx bx-loader-alt bx-spin text-2xl mb-2'></i>
                            <p>Đang tải mã giảm giá...</p>
                        </div>
                    ) : discountCodes.length > 0 ? (
                        <div className='flex flex-col gap-3'>
                            {discountCodes.map(code => {
                                const isEligible = totalAmount >= code.minOrderAmount;
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
                                                onClick={() => onApply(code)}
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
    );
}
