"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import OrderService from '@/services/OrderService';
import GuestProfileService from '@/services/GuestProfileService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) =>
{
    if (!price) return '0';
    return Number(price).toLocaleString('vi-VN');
};

const formatDate = (dateStr) =>
{
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusMap = {
    'Pending': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: 'bx-time-five' },
    'Confirmed': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: 'bx-check' },
    'Shipping': { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700', icon: 'bx-package' },
    'Delivered': { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: 'bx-check-double' },
    'Cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: 'bx-x' },
};

const getImgSrc = (path) =>
{
    if (!path) return '/images/cameras-2.jpg';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

export default function GuestOrdersPage()
{
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const guestProfile = GuestProfileService.getGuestProfile();

    useEffect(() =>
    {
        // Redirect if user is logged in
        if (typeof window !== 'undefined' && localStorage.getItem('token'))
        {
            router.push('/my-orders');
            return;
        }

        const fetchGuestOrders = async () =>
        {
            try
            {
                const guestToken = GuestProfileService.getExistingGuestToken();
                if (!guestToken)
                {
                    setLoading(false);
                    return;
                }
                const data = await OrderService.getGuestOrders(guestToken);
                const orderList = data?.$values || data || [];
                setOrders(orderList);
            } catch (error)
            {
                console.error('Failed to fetch guest orders:', error);
            } finally
            {
                setLoading(false);
            }
        };
        fetchGuestOrders();
    }, [router]);

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div className='min-h-screen bg-gray-50 pt-6 pb-16'>
                <div className='max-w-4xl mx-auto px-4'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                                <i className='bx bx-package text-amber-500'></i>
                                Đơn hàng của tôi
                            </h1>
                            {guestProfile && (
                                <p className='text-sm text-gray-500 mt-1'>
                                    Mã khách: <span className='font-semibold text-amber-600'>{guestProfile.guestCode}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
                        >
                            <i className='bx bx-arrow-back mr-1'></i>
                            Về trang chủ
                        </button>
                    </div>

                    {/* Info banner */}
                    <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3'>
                        <i className='bx bx-info-circle text-xl text-amber-500 mt-0.5'></i>
                        <div>
                            <p className='text-sm text-amber-800 font-medium'>Bạn đang xem với tư cách khách vãng lai</p>
                            <p className='text-xs text-amber-600 mt-1'>
                                Đăng ký tài khoản để quản lý đơn hàng tốt hơn. Đơn hàng sẽ được tự động chuyển vào tài khoản mới.
                            </p>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className='flex items-center justify-center py-20'>
                            <i className='bx bx-loader-alt bx-spin text-4xl text-amber-500'></i>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && orders.length === 0 && (
                        <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                            <i className='bx bx-shopping-bag text-6xl text-gray-300 mb-4'></i>
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>Chưa có đơn hàng nào</h3>
                            <p className='text-sm text-gray-500 mb-6'>Hãy khám phá và đặt hàng tại CapyLumine!</p>
                            <button
                                onClick={() => router.push('/')}
                                className='px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors cursor-pointer'
                            >
                                Bắt đầu mua sắm
                            </button>
                        </div>
                    )}

                    {/* Order list */}
                    {!loading && orders.length > 0 && (
                        <div className='space-y-4'>
                            {orders.map((order) =>
                            {
                                const status = statusMap[order.status] || statusMap['Pending'];
                                const isExpanded = expandedOrder === order.id;
                                const items = order.orderItems?.$values || order.orderItems || [];
                                const orderTotal = order.totalAmount;
                                const shippingFee = order.shippingFee || 0;
                                const subtotal = orderTotal - shippingFee;

                                return (
                                    <div key={order.id} className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                                        {/* Order header */}
                                        <div
                                            className='p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors'
                                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                        >
                                            <div className='flex items-center gap-4'>
                                                <div>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <span className='font-semibold text-gray-800'>#{order.orderCode || order.id?.substring(0, 8).toUpperCase()}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                            <i className={`bx ${status.icon} mr-1`}></i>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className='text-xs text-gray-500'>{formatDate(order.orderDate)}</p>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <span className='font-bold text-amber-600'>{formatPrice(orderTotal)}₫</span>
                                                <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'} text-xl text-gray-400`}></i>
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className='border-t border-gray-100 px-4 pb-4'>
                                                {/* Items */}
                                                <div className='py-3 space-y-3'>
                                                    {items.map((item, idx) =>
                                                    {
                                                        const options = item.selectedOptions ? (() =>
                                                        {
                                                            try
                                                            {
                                                                const parsed = JSON.parse(item.selectedOptions);
                                                                return Object.values(parsed).map(o => o.value).join(', ');
                                                            } catch { return ''; }
                                                        })() : '';

                                                        return (
                                                            <div key={idx} className='flex gap-3'>
                                                                <div className='w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 overflow-hidden'>
                                                                    <img
                                                                        src={getImgSrc(item.productImage)}
                                                                        alt={item.productName}
                                                                        className='w-full h-full object-cover'
                                                                        onError={(e) => { e.target.src = '/images/cameras-2.jpg'; }}
                                                                    />
                                                                </div>
                                                                <div className='flex-1 min-w-0'>
                                                                    <p className='text-sm font-medium text-gray-800 line-clamp-1'>{item.productName}</p>
                                                                    {options && <p className='text-xs text-gray-400'>Phân loại: {options}</p>}
                                                                    <div className='flex justify-between items-center mt-1'>
                                                                        <span className='text-sm text-amber-600 font-medium'>{formatPrice(item.price)}₫</span>
                                                                        <span className='text-xs text-gray-400'>x{item.quantity}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Shipping info */}
                                                <div className='border-t border-gray-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                    <div>
                                                        <p className='text-xs text-gray-400 mb-1'>Người nhận</p>
                                                        <p className='text-sm font-medium text-gray-700'>{order.fullName}</p>
                                                        <p className='text-xs text-gray-500'>{order.phone}</p>
                                                        {order.email && <p className='text-xs text-gray-500'>{order.email}</p>}
                                                    </div>
                                                    <div>
                                                        <p className='text-xs text-gray-400 mb-1'>Địa chỉ giao hàng</p>
                                                        <p className='text-sm text-gray-700'>
                                                            {[order.address, order.ward, order.district, order.city].filter(Boolean).join(', ')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Price summary */}
                                                <div className='border-t border-gray-100 pt-3 mt-3 space-y-1.5'>
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-gray-500'>Tạm tính:</span>
                                                        <span>{formatPrice(subtotal)}₫</span>
                                                    </div>
                                                    <div className='flex justify-between text-sm'>
                                                        <span className='text-gray-500'>Phí vận chuyển:</span>
                                                        <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                                                            {shippingFee === 0 ? 'Miễn phí' : `${formatPrice(shippingFee)}₫`}
                                                        </span>
                                                    </div>
                                                    <div className='flex justify-between text-sm font-bold pt-1 border-t border-dashed border-gray-200'>
                                                        <span>Tổng cộng:</span>
                                                        <span className='text-amber-600'>{formatPrice(orderTotal)}₫</span>
                                                    </div>
                                                    <div className='flex justify-between text-xs text-gray-400'>
                                                        <span>Thanh toán:</span>
                                                        <span>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
