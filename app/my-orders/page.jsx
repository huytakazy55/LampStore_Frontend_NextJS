"use client";


import dynamic from 'next/dynamic';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';

const OrderHistoryContent = dynamic(
    () => import('@/services/OrderService').then(() => {
        return { default: () => null };
    }),
    { ssr: false }
);

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import OrderService from '@/services/OrderService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const statusMap = {
    Pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    Confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    Shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
    Delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
    Cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function OrderHistoryPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
            toast.error('Vui lòng đăng nhập');
            router.push('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await OrderService.getMyOrders();
                const data = response.data?.$values || response.data || [];
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [router]);

    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div className="w-full bg-gray-50 min-h-screen">
                <div className="xl:max-w-[1440px] mx-auto px-4 xl:px-0 py-6 md:py-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h1>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg border">
                            <i className='bx bx-package text-6xl text-gray-300 mb-4 block'></i>
                            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                            <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg">Mua sắm ngay</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => {
                                const status = statusMap[order.status] || statusMap.Pending;
                                const items = order.orderItems?.$values || order.orderItems || [];
                                return (
                                    <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-500">Đơn #{order.id}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                                            </div>
                                            <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            {items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex gap-3 items-center">
                                                    <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                                                        <img src={item.productImage?.startsWith('http') ? item.productImage : `${API_ENDPOINT}${item.productImage}`}
                                                            alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-800 line-clamp-1">{item.productName}</p>
                                                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                                                    </div>
                                                    <span className="text-sm font-medium text-amber-600">{formatPrice(item.price * item.quantity)}₫</span>
                                                </div>
                                            ))}
                                            {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} sản phẩm khác</p>}
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                                            <span className="text-sm text-gray-500">Tổng: <span className="font-bold text-amber-600 text-base">{formatPrice(order.totalAmount)}₫</span></span>
                                        </div>
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
