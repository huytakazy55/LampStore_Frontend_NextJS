"use client";


import dynamic from 'next/dynamic';

// Import CheckoutPage from the original CRA pages — it's client-only
const CheckoutPageContent = dynamic(
    () => import('@/components/user/MainPage/Header/Header').then(() => {
        // Return a wrapper component
        return ({ default: () => null });
    }),
    { ssr: false }
);

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useCart } from '@/contexts/CartContext';
import OrderService from '@/services/OrderService';
import ProfileService from '@/services/ProfileService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [profile, setProfile] = useState({});
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        note: '',
        paymentMethod: 'COD',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
            toast.error('Vui lòng đăng nhập để thanh toán');
            router.push('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await ProfileService.getProfile();
                const data = response.data;
                setProfile(data);
                setFormData(prev => ({
                    ...prev,
                    fullName: data.fullName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                }));
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, [router]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }

        if (!formData.fullName || !formData.phoneNumber || !formData.address) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                ...formData,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.finalPrice,
                    selectedOptions: JSON.stringify(item.selectedOptions),
                })),
            };

            await OrderService.createOrder(orderData);
            clearCart();
            toast.success('Đặt hàng thành công! 🎉');
            router.push('/my-orders');
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error('Có lỗi xảy ra khi đặt hàng');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                    <i className='bx bx-cart text-6xl text-gray-300'></i>
                    <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-amber-500 text-white rounded-lg">Tiếp tục mua sắm</button>
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
            <BackToTop />

            <div className="w-full bg-gray-50 min-h-screen">
                <div className="xl:max-w-[1440px] mx-auto px-4 xl:px-0 py-6 md:py-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h1>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Form */}
                        <div className="flex-1">
                            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
                                <h2 className="text-lg font-semibold mb-4">Thông tin nhận hàng</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Họ tên *</label>
                                        <input name="fullName" value={formData.fullName} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Số điện thoại *</label>
                                        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Địa chỉ *</label>
                                        <input name="address" value={formData.address} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Ghi chú</label>
                                        <textarea name="note" value={formData.note} onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm h-24 resize-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">Hình thức thanh toán</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} />
                                                <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="radio" name="paymentMethod" value="BankTransfer" checked={formData.paymentMethod === 'BankTransfer'} onChange={handleChange} />
                                                <span className="text-sm">Chuyển khoản ngân hàng</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full mt-6 h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
                                    {loading ? 'Đang xử lý...' : `Đặt hàng (${formatPrice(cartTotal)}₫)`}
                                </button>
                            </form>
                        </div>

                        {/* Order summary */}
                        <div className="lg:w-[400px]">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-4">
                                <h2 className="text-lg font-semibold mb-4">Đơn hàng ({cartItems.length} sản phẩm)</h2>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {cartItems.map(item => (
                                        <div key={item.key} className="flex gap-3">
                                            <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-400">x{item.quantity}</p>
                                                <p className="text-sm font-bold text-amber-600">{formatPrice(item.finalPrice * item.quantity)}₫</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                                    <span className="text-xl font-bold text-amber-600">{formatPrice(cartTotal)}₫</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
