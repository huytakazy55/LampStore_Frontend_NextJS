"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import OrderService from '@/services/OrderService';
import OrderReviewModal from '@/components/user/OrderReviewModal/OrderReviewModal';
import PageLoader from '@/components/common/PageLoader';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) =>
{
    if (!price && price !== 0) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) =>
{
    if (!path) return '/images/placeholder.png';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

const STATUS_CONFIG = {
    Pending: { label: 'Chờ xử lý', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bx-time-five', dot: 'bg-amber-400' },
    Confirmed: { label: 'Đã xác nhận', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bx-check-circle', dot: 'bg-blue-400' },
    Shipping: { label: 'Đang giao hàng', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'bx-package', dot: 'bg-indigo-400' },
    Completed: { label: 'Hoàn thành', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bx-check-double', dot: 'bg-emerald-400' },
    Cancelled: { label: 'Đã huỷ', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bx-x-circle', dot: 'bg-red-400' },
};

export default function OrderHistoryPage()
{
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [reviewOrder, setReviewOrder] = useState(null);

    useEffect(() =>
    {
        if (typeof window !== 'undefined' && !localStorage.getItem('token'))
        {
            toast.error('Vui lòng đăng nhập');
            router.push('/');
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () =>
    {
        try
        {
            setLoading(true);
            const data = await OrderService.getMyOrders();
            const list = data?.$values || data || [];
            setOrders(Array.isArray(list) ? list : []);
        } catch (e)
        {
            console.error('Error fetching orders:', e);
            setOrders([]);
        } finally
        {
            setLoading(false);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const getStatus = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

    const filterTabs = [
        { key: 'all', label: 'Tất cả', icon: 'bx-list-ul' },
        { key: 'Pending', label: 'Chờ xử lý', icon: 'bx-time-five' },
        { key: 'Confirmed', label: 'Đã xác nhận', icon: 'bx-check-circle' },
        { key: 'Shipping', label: 'Đang giao', icon: 'bx-package' },
        { key: 'Completed', label: 'Hoàn thành', icon: 'bx-check-double' },
        { key: 'Cancelled', label: 'Đã huỷ', icon: 'bx-x-circle' },
    ];

    // --- ORDER DETAIL MODAL ---
    const renderOrderDetail = () =>
    {
        if (!selectedOrder) return null;
        const order = selectedOrder;
        const statusInfo = getStatus(order.status);
        const items = order.orderItems?.$values || order.orderItems || [];
        const orderDate = new Date(order.orderDate).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        return (
            <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'
                onClick={() => setSelectedOrder(null)}>
                <div className='bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden'
                    onClick={e => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-gray-800 dark:to-gray-800'>
                        <div>
                            <h2 className='text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                                Chi tiết đơn hàng
                                <span className='text-xs font-mono bg-gray-800 text-amber-400 px-2 py-0.5 rounded'>
                                    #{order.id?.substring(0, 8).toUpperCase()}
                                </span>
                            </h2>
                        </div>
                        <button onClick={() => setSelectedOrder(null)}
                            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer'>
                            <i className='bx bx-x text-xl text-gray-500'></i>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className='overflow-y-auto max-h-[calc(90vh-70px)] p-6 space-y-5'>
                        {/* Status Badge */}
                        <div className='flex items-center gap-3'>
                            <span className='text-sm text-gray-500 dark:text-gray-400'>Trạng thái:</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text}`}>
                                <i className={`bx ${statusInfo.icon}`}></i>
                                {statusInfo.label}
                            </span>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2'>
                                <i className='bx bx-user text-rose-500'></i>
                                Thông tin khách hàng
                            </h3>
                            <div className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm'>
                                <div className='grid grid-cols-[120px_1fr_120px_1fr] divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700'>
                                    <div className='px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>Họ tên</div>
                                    <div className='px-3 py-2.5 text-gray-800 dark:text-gray-200'>{order.fullName}</div>
                                    <div className='px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>Số điện thoại</div>
                                    <div className='px-3 py-2.5 text-gray-800 dark:text-gray-200'>{order.phone}</div>
                                </div>
                                <div className='grid grid-cols-[120px_1fr_120px_1fr] divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700'>
                                    <div className='px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>Email</div>
                                    <div className='px-3 py-2.5 text-gray-800 dark:text-gray-200'>{order.email || '—'}</div>
                                    <div className='px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>Ngày đặt</div>
                                    <div className='px-3 py-2.5 text-gray-800 dark:text-gray-200'>{orderDate}</div>
                                </div>
                                <div className='grid grid-cols-[120px_1fr] divide-x divide-gray-200 dark:divide-gray-700'>
                                    <div className='px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>Địa chỉ</div>
                                    <div className='px-3 py-2.5 text-gray-800 dark:text-gray-200'>
                                        {[order.address, order.ward, order.district, order.city].filter(Boolean).join(', ')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2'>
                                <i className='bx bx-cart text-rose-500'></i>
                                Danh sách sản phẩm ({items.length})
                            </h3>
                            <div className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
                                <div className='grid grid-cols-[1fr_100px_60px_100px] bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700'>
                                    <div className='px-3 py-2.5'>Sản phẩm</div>
                                    <div className='px-3 py-2.5 text-center'>Đơn giá</div>
                                    <div className='px-3 py-2.5 text-center'>SL</div>
                                    <div className='px-3 py-2.5 text-right'>Thành tiền</div>
                                </div>
                                {items.map((item, idx) =>
                                {
                                    let options = null;
                                    try { if (item.selectedOptions) options = JSON.parse(item.selectedOptions); } catch { }
                                    const optionText = options
                                        ? Object.entries(options).map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`).join(', ')
                                        : null;

                                    return (
                                        <div key={item.id || idx}
                                            className='grid grid-cols-[1fr_100px_60px_100px] items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors'>
                                            <div className='px-3 py-3 flex items-center gap-3'>
                                                <div className='w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-100 dark:border-gray-700'>
                                                    <img src={getImgSrc(item.productImage)} alt={item.productName}
                                                        className='w-full h-full object-cover'
                                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/placeholder.png'; }} />
                                                </div>
                                                <div className='min-w-0'>
                                                    <p className='text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1 cursor-pointer hover:text-rose-600 transition-colors'
                                                        onClick={() => { setSelectedOrder(null); if (item.productId) router.push(`/product/${item.productId}`); }}>
                                                        {item.productName}
                                                    </p>
                                                    {optionText && (
                                                        <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>
                                                            Phân loại: {optionText}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='px-3 py-3 text-center text-sm text-rose-600 font-medium'>
                                                {formatPrice(item.price)}đ
                                            </div>
                                            <div className='px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-300'>
                                                {item.quantity}
                                            </div>
                                            <div className='px-3 py-3 text-right text-sm font-semibold text-gray-800 dark:text-gray-100'>
                                                {formatPrice(item.price * item.quantity)}đ
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-3 space-y-2 text-sm'>
                            <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                                <span>Tạm tính:</span>
                                <span>{formatPrice(order.totalAmount - (order.shippingFee || 0))}đ</span>
                            </div>
                            <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                                <span>Phí vận chuyển:</span>
                                <span className={order.shippingFee > 0 ? '' : 'text-emerald-600 font-medium'}>
                                    {order.shippingFee > 0 ? `${formatPrice(order.shippingFee)}đ` : 'Miễn phí'}
                                </span>
                            </div>
                            <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                                <span>Phương thức thanh toán:</span>
                                <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded text-amber-700 dark:text-amber-400 text-xs font-medium'>
                                    {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : order.paymentMethod}
                                </span>
                            </div>
                            <div className='flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700'>
                                <span className='font-bold text-gray-800 dark:text-gray-100'>Tổng cộng:</span>
                                <span className='text-lg font-bold text-rose-600'>
                                    {formatPrice(order.totalAmount)}đ
                                </span>
                            </div>
                        </div>

                        {/* Note */}
                        {order.note && (
                            <div className='flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg px-4 py-3'>
                                <i className='bx bx-note text-amber-500 mt-0.5'></i>
                                <span><strong>Ghi chú:</strong> {order.note}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <main className='w-full mb-8 xl:mx-auto xl:max-w-[1440px] px-4 xl:px-0 min-h-[60vh]'>
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className='flex items-center py-3 text-xs md:text-sm'>
                    <a href="/" className='font-medium text-gray-600 dark:text-gray-400 hover:text-rose-600 transition'>Trang chủ</a>
                    <i className='bx bx-chevron-right text-base md:text-lg px-1 text-gray-400 dark:text-gray-600'></i>
                    <span className='text-gray-500 dark:text-gray-400'>Đơn hàng của tôi</span>
                </nav>

                {/* Page Header */}
                <div className='bg-gradient-to-r from-rose-600 to-amber-500 rounded-xl p-5 md:p-6 mb-6 text-white relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2'></div>
                    <div className='absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2'></div>
                    <div className='relative z-10'>
                        <h1 className='text-xl md:text-2xl font-bold flex items-center gap-2 mb-1'>
                            <i className='bx bx-package'></i>
                            Đơn hàng của tôi
                        </h1>
                        <p className='text-sm text-white/80'>
                            Theo dõi và quản lý tất cả đơn hàng • {orders.length} đơn hàng
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className='flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-hide'>
                    {filterTabs.map(tab =>
                    {
                        const count = tab.key === 'all' ? orders.length : orders.filter(o => o.status === tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilterStatus(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border ${filterStatus === tab.key
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200 dark:shadow-rose-900/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-rose-300 hover:text-rose-600'
                                    }`}
                            >
                                <i className={`bx ${tab.icon}`}></i>
                                {tab.label}
                                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${filterStatus === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Loading */}
                {loading && (
                    <PageLoader height="40vh" />
                )}

                {/* Empty State */}
                {!loading && filteredOrders.length === 0 && (
                    <div className='flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800'>
                        <div className='w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
                            <i className='bx bx-package text-4xl text-gray-300 dark:text-gray-600'></i>
                        </div>
                        <p className='text-gray-500 dark:text-gray-400 text-base font-medium mb-1'>
                            {filterStatus === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng ở trạng thái này'}
                        </p>
                        <p className='text-gray-400 dark:text-gray-500 text-sm mb-5'>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi</p>
                        <button
                            onClick={() => router.push('/')}
                            className='px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm font-medium cursor-pointer flex items-center gap-2'
                        >
                            <i className='bx bx-shopping-bag'></i> Mua sắm ngay
                        </button>
                    </div>
                )}

                {/* Order Cards */}
                {!loading && filteredOrders.length > 0 && (
                    <div className='space-y-3'>
                        {filteredOrders.map((order) =>
                        {
                            const statusInfo = getStatus(order.status);
                            const items = order.orderItems?.$values || order.orderItems || [];
                            const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric'
                            });

                            return (
                                <div key={order.id}
                                    className='bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer group'
                                    onClick={() => setSelectedOrder(order)}>
                                    {/* Card Header */}
                                    <div className='flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-50 dark:border-gray-800'>
                                        <div className='flex items-center gap-3'>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text}`}>
                                                <i className={`bx ${statusInfo.icon} text-xs`}></i>
                                                {statusInfo.label}
                                            </span>
                                            <span className='text-xs text-gray-400 dark:text-gray-500 font-mono'>
                                                #{order.id?.substring(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-2 text-xs text-gray-400'>
                                            <i className='bx bx-calendar text-sm'></i>
                                            {orderDate}
                                        </div>
                                    </div>

                                    {/* Product Preview */}
                                    <div className='px-4 md:px-5 py-3'>
                                        {items.slice(0, 2).map((item, idx) =>
                                        {
                                            let options = null;
                                            try { if (item.selectedOptions) options = JSON.parse(item.selectedOptions); } catch { }
                                            const optionText = options
                                                ? Object.entries(options).map(([k, v]) => `${typeof v === 'object' ? v.value : v}`).join(', ')
                                                : null;

                                            return (
                                                <div key={item.id || idx} className={`flex items-center gap-3 py-2 ${idx > 0 ? 'border-t border-gray-50 dark:border-gray-800' : ''}`}>
                                                    <div className='w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                                                        <img src={getImgSrc(item.productImage)} alt={item.productName}
                                                            className='w-full h-full object-cover'
                                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/placeholder.png'; }} />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-sm text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-rose-600 transition-colors'>{item.productName}</p>
                                                        {optionText && <p className='text-[11px] text-gray-400 mt-0.5'>Phân loại: {optionText}</p>}
                                                    </div>
                                                    <div className='text-right flex-shrink-0'>
                                                        <p className='text-sm font-medium text-rose-600'>{formatPrice(item.price)}đ</p>
                                                        <p className='text-[11px] text-gray-400'>x{item.quantity}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {items.length > 2 && (
                                            <div className='text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-50 dark:border-gray-800'>
                                                và {items.length - 2} sản phẩm khác...
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className='flex items-center justify-between px-4 md:px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800'>
                                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                                            {items.length} sản phẩm • {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank' ? 'Chuyển khoản' : order.paymentMethod}
                                        </span>
                                        <div className='flex items-center gap-3'>
                                            {order.status === 'Completed' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setReviewOrder(order); }}
                                                    className='flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer'
                                                >
                                                    <i className='bx bx-star'></i>
                                                    Đánh giá
                                                </button>
                                            )}
                                            <div className='text-right'>
                                                <span className='text-[10px] text-gray-400 block leading-tight'>Tổng cộng</span>
                                                <span className='text-base font-bold text-rose-600'>
                                                    {formatPrice(order.totalAmount)}đ
                                                </span>
                                            </div>
                                            <i className='bx bx-chevron-right text-gray-300 group-hover:text-rose-400 transition-colors text-lg'></i>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Order Detail Modal */}
            {renderOrderDetail()}

            {/* Review Modal */}
            <OrderReviewModal
                isOpen={!!reviewOrder}
                onClose={() => setReviewOrder(null)}
                order={reviewOrder}
            />

            <Footer />
        </>
    );
}
