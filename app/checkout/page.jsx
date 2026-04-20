"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Header from '@/components/user/MainPage/Header/Header';
import NavbarPrimary from '@/components/user/MainPage/NavbarPrimary/NavbarPrimary';
import TopBar from '@/components/user/MainPage/TopBar/TopBar';
import Footer from '@/components/user/MainPage/Footer/Footer';
import { useCart } from '@/contexts/CartContext';
import OrderService from '@/services/OrderService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
const PROVINCE_API = 'https://provinces.open-api.vn/api';

const formatPrice = (price) =>
{
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
};

const getImgSrc = (path) =>
{
    if (!path) return '/images/cameras-2.jpg';
    return path.startsWith('http') ? path : `${API_ENDPOINT}${path}`;
};

export default function CheckoutPage()
{
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        cityName: '',
        district: '',
        districtName: '',
        ward: '',
        wardName: '',
        note: '',
        paymentMethod: 'cod',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Province data states
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingProvinces, setLoadingProvinces] = useState(true);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Fetch provinces on mount
    useEffect(() =>
    {
        const fetchProvinces = async () =>
        {
            try
            {
                const res = await fetch(`${PROVINCE_API}/p/`);
                const data = await res.json();
                setProvinces(data);
            } catch (error)
            {
                console.error('Error fetching provinces:', error);
            } finally
            {
                setLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() =>
    {
        if (!formData.city)
        {
            setDistricts([]);
            return;
        }
        const fetchDistricts = async () =>
        {
            setLoadingDistricts(true);
            try
            {
                const res = await fetch(`${PROVINCE_API}/p/${formData.city}?depth=2`);
                const data = await res.json();
                setDistricts(data.districts || []);
            } catch (error)
            {
                console.error('Error fetching districts:', error);
            } finally
            {
                setLoadingDistricts(false);
            }
        };
        fetchDistricts();
    }, [formData.city]);

    // Fetch wards when district changes
    useEffect(() =>
    {
        if (!formData.district)
        {
            setWards([]);
            return;
        }
        const fetchWards = async () =>
        {
            setLoadingWards(true);
            try
            {
                const res = await fetch(`${PROVINCE_API}/d/${formData.district}?depth=2`);
                const data = await res.json();
                setWards(data.wards || []);
            } catch (error)
            {
                console.error('Error fetching wards:', error);
            } finally
            {
                setLoadingWards(false);
            }
        };
        fetchWards();
    }, [formData.district]);

    // Pre-fill user info if logged in
    useEffect(() =>
    {
        if (typeof window !== 'undefined')
        {
            const savedName = localStorage.getItem('userName');
            const savedEmail = localStorage.getItem('userEmail');
            if (savedName) setFormData(prev => ({ ...prev, fullName: savedName }));
            if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail }));
        }
    }, []);

    const checkoutItems = cartItems;
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const handleChange = (e) =>
    {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name])
        {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleProvinceChange = (e) =>
    {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex]?.text || '';
        setFormData(prev => ({
            ...prev,
            city: code,
            cityName: code ? name : '',
            district: '',
            districtName: '',
            ward: '',
            wardName: ''
        }));
        setWards([]);
        if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
    };

    const handleDistrictChange = (e) =>
    {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex]?.text || '';
        setFormData(prev => ({
            ...prev,
            district: code,
            districtName: code ? name : '',
            ward: '',
            wardName: ''
        }));
        if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
    };

    const handleWardChange = (e) =>
    {
        const code = e.target.value;
        const name = e.target.options[e.target.selectedIndex]?.text || '';
        setFormData(prev => ({
            ...prev,
            ward: code,
            wardName: code ? name : ''
        }));
    };

    const validate = () =>
    {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone.trim())) newErrors.phone = 'Số điện thoại không hợp lệ';
        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try
        {
            const orderData = {
                userId: typeof window !== 'undefined' ? localStorage.getItem('userId') || null : null,
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                city: formData.cityName,
                district: formData.districtName,
                ward: formData.wardName,
                note: formData.note,
                paymentMethod: formData.paymentMethod,
                totalAmount: total,
                shippingFee: shippingFee,
                orderItems: checkoutItems.map(item => ({
                    productId: item.id || item.productId,
                    productName: item.name,
                    productImage: item.image || '',
                    quantity: item.quantity,
                    price: item.finalPrice,
                    selectedOptions: item.selectedOptions ? JSON.stringify(item.selectedOptions) : null,
                })),
            };

            const created = await OrderService.createOrder(orderData);
            setOrderId(created.id ? created.id.substring(0, 8).toUpperCase() : 'LS-' + Date.now().toString(36).toUpperCase());
            setOrderSuccess(true);
            clearCart();
        } catch (error)
        {
            console.error('Order error:', error);
            toast.error('Đặt hàng thất bại. Vui lòng thử lại!');
        } finally
        {
            setIsSubmitting(false);
        }
    };

    const selectClassName = (hasError) =>
        `w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors appearance-none bg-white cursor-pointer ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-rose-400'
        }`;

    // ── Order Success View ──
    if (orderSuccess)
    {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className='min-h-screen bg-gray-50 pt-8 pb-16'>
                    <div className='max-w-2xl mx-auto px-4'>
                        <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
                            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                                <i className='bx bx-check text-4xl text-green-600'></i>
                            </div>
                            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Đặt hàng thành công!</h2>
                            <p className='text-gray-500 mb-6'>Cảm ơn bạn đã mua hàng tại CapyLumine</p>

                            <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
                                <div className='flex justify-between items-center mb-2'>
                                    <span className='text-sm text-gray-500'>Mã đơn hàng:</span>
                                    <span className='font-semibold text-rose-600'>{orderId}</span>
                                </div>
                                <div className='flex justify-between items-center mb-2'>
                                    <span className='text-sm text-gray-500'>Tổng thanh toán:</span>
                                    <span className='font-bold text-lg'>{formatPrice(total)}₫</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='text-sm text-gray-500'>Phương thức thanh toán:</span>
                                    <span className='text-sm'>
                                        {formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
                                    </span>
                                </div>
                            </div>

                            <div className='flex gap-3'>
                                <button
                                    onClick={() => router.push('/')}
                                    className='flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer'
                                >
                                    Tiếp tục mua sắm
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className='flex-1 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors cursor-pointer'
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // ── Empty Cart ──
    if (cartItems.length === 0)
    {
        return (
            <>
                <TopBar />
                <Header />
                <NavbarPrimary />
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                    <i className='bx bx-cart text-6xl text-gray-300'></i>
                    <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-amber-500 text-white rounded-lg cursor-pointer hover:bg-amber-600 transition-colors">Tiếp tục mua sắm</button>
                </div>
                <Footer />
            </>
        );
    }

    // ── Checkout Form ──
    return (
        <>
            <TopBar />
            <Header />
            <NavbarPrimary />

            <div className='min-h-screen bg-gray-50 pt-6 pb-16'>
                <div className='max-w-6xl mx-auto px-4'>
                    {/* Breadcrumb */}
                    <div className='flex items-center gap-2 text-sm text-gray-500 mb-6'>
                        <span className='cursor-pointer hover:text-rose-600 transition-colors' onClick={() => router.push('/')}>Trang chủ</span>
                        <i className='bx bx-chevron-right'></i>
                        <span className='cursor-pointer hover:text-rose-600 transition-colors' onClick={() => router.back()}>Giỏ hàng</span>
                        <i className='bx bx-chevron-right'></i>
                        <span className='text-gray-800 font-medium'>Thanh toán</span>
                    </div>

                    <h1 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
                        <i className='bx bx-receipt text-rose-500'></i>
                        Thanh toán đơn hàng
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                            {/* Left: Thông tin giao hàng */}
                            <div className='lg:col-span-2 space-y-6'>
                                {/* Thông tin người nhận */}
                                <div className='bg-white rounded-lg shadow-sm p-6'>
                                    <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                                        <i className='bx bx-user text-rose-500'></i>
                                        Thông tin người nhận
                                    </h2>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Họ và tên <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type='text'
                                                name='fullName'
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder='Nguyễn Văn A'
                                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-rose-400'}`}
                                            />
                                            {errors.fullName && <p className='text-xs text-red-500 mt-1'>{errors.fullName}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Số điện thoại <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type='tel'
                                                name='phone'
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder='0912 345 678'
                                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-rose-400'}`}
                                            />
                                            {errors.phone && <p className='text-xs text-red-500 mt-1'>{errors.phone}</p>}
                                        </div>
                                        <div className='md:col-span-2'>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Email
                                            </label>
                                            <input
                                                type='email'
                                                name='email'
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder='email@example.com'
                                                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-rose-400 transition-colors'
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Địa chỉ giao hàng */}
                                <div className='bg-white rounded-lg shadow-sm p-6'>
                                    <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                                        <i className='bx bx-map text-rose-500'></i>
                                        Địa chỉ giao hàng
                                    </h2>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        {/* Tỉnh / Thành phố */}
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Tỉnh / Thành phố <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <select
                                                    value={formData.city}
                                                    onChange={handleProvinceChange}
                                                    className={selectClassName(errors.city)}
                                                    disabled={loadingProvinces}
                                                >
                                                    <option value="">
                                                        {loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}
                                                    </option>
                                                    {provinces.map(p => (
                                                        <option key={p.code} value={p.code}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <i className='bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'></i>
                                            </div>
                                            {errors.city && <p className='text-xs text-red-500 mt-1'>{errors.city}</p>}
                                        </div>

                                        {/* Quận / Huyện */}
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Quận / Huyện <span className='text-red-500'>*</span>
                                            </label>
                                            <div className='relative'>
                                                <select
                                                    value={formData.district}
                                                    onChange={handleDistrictChange}
                                                    className={selectClassName(errors.district)}
                                                    disabled={!formData.city || loadingDistricts}
                                                >
                                                    <option value="">
                                                        {loadingDistricts ? 'Đang tải...' : !formData.city ? 'Chọn tỉnh trước' : '-- Chọn Quận/Huyện --'}
                                                    </option>
                                                    {districts.map(d => (
                                                        <option key={d.code} value={d.code}>{d.name}</option>
                                                    ))}
                                                </select>
                                                <i className='bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'></i>
                                            </div>
                                            {errors.district && <p className='text-xs text-red-500 mt-1'>{errors.district}</p>}
                                        </div>

                                        {/* Phường / Xã */}
                                        <div>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Phường / Xã
                                            </label>
                                            <div className='relative'>
                                                <select
                                                    value={formData.ward}
                                                    onChange={handleWardChange}
                                                    className={selectClassName(false)}
                                                    disabled={!formData.district || loadingWards}
                                                >
                                                    <option value="">
                                                        {loadingWards ? 'Đang tải...' : !formData.district ? 'Chọn quận/huyện trước' : '-- Chọn Phường/Xã --'}
                                                    </option>
                                                    {wards.map(w => (
                                                        <option key={w.code} value={w.code}>{w.name}</option>
                                                    ))}
                                                </select>
                                                <i className='bx bx-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'></i>
                                            </div>
                                        </div>

                                        {/* Địa chỉ cụ thể */}
                                        <div className='md:col-span-2'>
                                            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                                                Địa chỉ cụ thể <span className='text-red-500'>*</span>
                                            </label>
                                            <input
                                                type='text'
                                                name='address'
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder='Số nhà, tên đường...'
                                                className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-rose-400'}`}
                                            />
                                            {errors.address && <p className='text-xs text-red-500 mt-1'>{errors.address}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Phương thức thanh toán */}
                                <div className='bg-white rounded-lg shadow-sm p-6'>
                                    <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                                        <i className='bx bx-credit-card text-rose-500'></i>
                                        Phương thức thanh toán
                                    </h2>
                                    <div className='space-y-3'>
                                        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type='radio'
                                                name='paymentMethod'
                                                value='cod'
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleChange}
                                                className='accent-rose-600'
                                            />
                                            <i className='bx bx-money text-2xl text-green-600'></i>
                                            <div>
                                                <p className='font-medium text-sm text-gray-800'>Thanh toán khi nhận hàng (COD)</p>
                                                <p className='text-xs text-gray-500'>Thanh toán bằng tiền mặt khi nhận hàng</p>
                                            </div>
                                        </label>
                                        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-rose-400 bg-rose-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type='radio'
                                                name='paymentMethod'
                                                value='bank'
                                                checked={formData.paymentMethod === 'bank'}
                                                onChange={handleChange}
                                                className='accent-rose-600'
                                            />
                                            <i className='bx bx-building-house text-2xl text-blue-600'></i>
                                            <div>
                                                <p className='font-medium text-sm text-gray-800'>Chuyển khoản ngân hàng</p>
                                                <p className='text-xs text-gray-500'>Chuyển khoản qua tài khoản ngân hàng</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className='bg-white rounded-lg shadow-sm p-6'>
                                    <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                                        <i className='bx bx-notepad text-rose-500'></i>
                                        Ghi chú đơn hàng
                                    </h2>
                                    <textarea
                                        name='note'
                                        value={formData.note}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder='Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn giao hàng...'
                                        className='w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-rose-400 transition-colors resize-none'
                                    />
                                </div>
                            </div>

                            {/* Right: Tóm tắt đơn hàng */}
                            <div className='lg:col-span-1'>
                                <div className='bg-white rounded-lg shadow-sm p-6 sticky top-6'>
                                    <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                                        <i className='bx bx-cart text-rose-500'></i>
                                        Đơn hàng ({checkoutItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
                                    </h2>

                                    {/* Product list */}
                                    <div className='space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-1'>
                                        {checkoutItems.map((item) =>
                                        {
                                            const optionText = Object.entries(item.selectedOptions || {})
                                                .map(([, opt]) => opt.value)
                                                .join(', ');
                                            return (
                                                <div key={item.key} className='flex gap-3'>
                                                    <div className='w-16 h-16 bg-gray-50 rounded border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden'>
                                                        <img
                                                            src={item.image || '/images/cameras-2.jpg'}
                                                            alt={item.name}
                                                            className='max-w-full max-h-full object-contain'
                                                            onError={(e) => { e.target.src = '/images/cameras-2.jpg'; }}
                                                        />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-sm font-medium text-gray-800 line-clamp-2 leading-snug'>{item.name}</p>
                                                        {optionText && (
                                                            <p className='text-xs text-gray-400 mt-0.5'>Phân loại: {optionText}</p>
                                                        )}
                                                        <div className='flex justify-between items-center mt-1'>
                                                            <span className='text-sm font-semibold text-rose-600'>{formatPrice(item.finalPrice)}₫</span>
                                                            <span className='text-xs text-gray-400'>x{item.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Price summary */}
                                    <div className='border-t border-gray-100 pt-4 space-y-2.5'>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-gray-500'>Tạm tính:</span>
                                            <span className='font-medium'>{formatPrice(subtotal)}₫</span>
                                        </div>
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-gray-500'>Phí vận chuyển:</span>
                                            <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                                                {shippingFee === 0 ? 'Miễn phí' : `${formatPrice(shippingFee)}₫`}
                                            </span>
                                        </div>
                                        {shippingFee > 0 && (
                                            <p className='text-xs text-gray-400'>
                                                <i className='bx bx-info-circle mr-1'></i>
                                                Miễn phí vận chuyển cho đơn từ 500.000₫
                                            </p>
                                        )}
                                        <div className='border-t border-gray-100 pt-3 flex justify-between items-center'>
                                            <span className='font-semibold text-gray-800'>Tổng cộng:</span>
                                            <span className='text-xl font-bold text-rose-600'>{formatPrice(total)}₫</span>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-full mt-6 py-3.5 bg-rose-600 text-white rounded-lg font-semibold text-base hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <i className='bx bx-loader-alt bx-spin'></i>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className='bx bx-check-shield text-lg'></i>
                                                Đặt hàng
                                            </>
                                        )}
                                    </button>

                                    <p className='text-xs text-center text-gray-400 mt-3'>
                                        Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của CapyLumine
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}
