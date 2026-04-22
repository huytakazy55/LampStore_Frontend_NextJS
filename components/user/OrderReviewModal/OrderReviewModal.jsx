"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReviewService from '@/services/ReviewService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const getImgSrc = (path) =>
{
    if (!path) return '/images/placeholder.png';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

const StarRating = ({ rating, onRate, disabled }) =>
{
    const [hover, setHover] = useState(0);
    return (
        <div className='flex gap-0.5'>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type='button'
                    disabled={disabled}
                    className={`text-xl transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${(hover || rating) >= star ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                    onMouseEnter={() => !disabled && setHover(star)}
                    onMouseLeave={() => !disabled && setHover(0)}
                    onClick={() => !disabled && onRate(star)}
                >
                    <i className='bx bxs-star'></i>
                </button>
            ))}
        </div>
    );
};

const OrderReviewModal = ({ isOpen, onClose, order }) =>
{
    const [reviewStates, setReviewStates] = useState({});
    const [loading, setLoading] = useState(true);

    const items = order?.orderItems?.$values || order?.orderItems || [];

    // Fetch review status for each product when modal opens
    useEffect(() =>
    {
        if (!isOpen || !order) return;

        const fetchStatuses = async () =>
        {
            setLoading(true);
            const states = {};
            const uniqueProducts = [...new Map(items.map(item => [item.productId, item])).keys()];

            await Promise.all(uniqueProducts.map(async (productId) =>
            {
                try
                {
                    const res = await ReviewService.getReviewStatus(productId);
                    states[productId] = {
                        hasReviewed: res.data?.hasReviewed || false,
                        rating: 5,
                        comment: '',
                        submitting: false,
                    };
                } catch
                {
                    states[productId] = {
                        hasReviewed: false,
                        rating: 5,
                        comment: '',
                        submitting: false,
                    };
                }
            }));

            setReviewStates(states);
            setLoading(false);
        };

        fetchStatuses();
    }, [isOpen, order]);

    const handleSubmit = async (productId) =>
    {
        const state = reviewStates[productId];
        if (!state || state.hasReviewed || state.submitting) return;
        if (!state.comment.trim())
        {
            toast.warning('Vui lòng nhập nội dung đánh giá!');
            return;
        }

        setReviewStates(prev => ({ ...prev, [productId]: { ...prev[productId], submitting: true } }));

        try
        {
            await ReviewService.submitReview({
                productId,
                rating: state.rating,
                comment: state.comment.trim(),
            });

            setReviewStates(prev => ({
                ...prev,
                [productId]: { ...prev[productId], hasReviewed: true, submitting: false }
            }));

            toast.success('Cảm ơn bạn đã đánh giá! ⭐');
        } catch (e)
        {
            const msg = e.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            toast.error(msg);
            setReviewStates(prev => ({ ...prev, [productId]: { ...prev[productId], submitting: false } }));
        }
    };

    if (!isOpen || !order) return null;

    // Group items by productId (avoid duplicate review forms)
    const uniqueItems = [...new Map(items.map(item => [item.productId, item])).values()];

    const allReviewed = uniqueItems.every(item => reviewStates[item.productId]?.hasReviewed);

    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'
            onClick={onClose}
            onWheel={e => e.stopPropagation()}>
            <div className='bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden'
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-gray-800 dark:to-gray-800'>
                    <div>
                        <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                            <i className='bx bx-star text-amber-500'></i>
                            Đánh giá sản phẩm
                        </h2>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                            Đơn hàng #{order.id?.substring(0, 8).toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer'>
                        <i className='bx bx-x text-xl text-gray-500'></i>
                    </button>
                </div>

                {/* Body */}
                <div className='overflow-y-auto max-h-[calc(90vh-130px)] p-6 space-y-4'>
                    {loading ? (
                        <div className='flex flex-col items-center justify-center py-12'>
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-200 border-t-amber-500 mb-3"></div>
                            <p className='text-sm text-gray-400'>Đang tải...</p>
                        </div>
                    ) : (
                        uniqueItems.map((item) =>
                        {
                            const state = reviewStates[item.productId] || {};
                            const reviewed = state.hasReviewed;

                            return (
                                <div key={item.productId}
                                    className={`border rounded-xl p-4 transition-all ${reviewed
                                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}>
                                    {/* Product info */}
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                                            <img src={getImgSrc(item.productImage)} alt={item.productName}
                                                className='w-full h-full object-cover'
                                                onError={(e) => { e.target.src = '/images/placeholder.png'; }} />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2'>
                                                {item.productName}
                                            </p>
                                            <p className='text-xs text-gray-400 mt-0.5'>x{item.quantity}</p>
                                        </div>
                                        {reviewed && (
                                            <span className='flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full whitespace-nowrap'>
                                                <i className='bx bx-check-circle'></i>
                                                Đã đánh giá
                                            </span>
                                        )}
                                    </div>

                                    {/* Review form or reviewed state */}
                                    {!reviewed ? (
                                        <div className='space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800'>
                                            <div className='flex items-center gap-3'>
                                                <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Đánh giá:</span>
                                                <StarRating
                                                    rating={state.rating || 5}
                                                    onRate={(r) => setReviewStates(prev => ({
                                                        ...prev,
                                                        [item.productId]: { ...prev[item.productId], rating: r }
                                                    }))}
                                                    disabled={state.submitting}
                                                />
                                                <span className='text-xs text-amber-500 font-medium'>{state.rating || 5}/5</span>
                                            </div>
                                            <textarea
                                                className='w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 resize-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition placeholder:text-gray-400'
                                                rows={2}
                                                placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này...'
                                                value={state.comment || ''}
                                                onChange={(e) => setReviewStates(prev => ({
                                                    ...prev,
                                                    [item.productId]: { ...prev[item.productId], comment: e.target.value }
                                                }))}
                                                disabled={state.submitting}
                                            />
                                            <div className='flex justify-end'>
                                                <button
                                                    onClick={() => handleSubmit(item.productId)}
                                                    disabled={state.submitting}
                                                    className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5'
                                                >
                                                    {state.submitting
                                                        ? <><i className='bx bx-loader-alt animate-spin'></i> Đang gửi...</>
                                                        : <><i className='bx bx-send'></i> Gửi đánh giá</>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className='px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>
                        {allReviewed && !loading
                            ? <span className='text-emerald-600 dark:text-emerald-400 font-medium'><i className='bx bx-check-double mr-1'></i>Đã đánh giá tất cả sản phẩm</span>
                            : `${uniqueItems.length} sản phẩm cần đánh giá`
                        }
                    </span>
                    <button
                        onClick={onClose}
                        className='px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer'
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderReviewModal;
