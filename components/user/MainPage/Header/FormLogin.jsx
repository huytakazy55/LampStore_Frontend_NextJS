"use client";

import React, { useState, useEffect } from 'react'
import AuthService from '@/services/AuthService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '@/redux/slices/authSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from '@/lib/router-compat';
import GoogleSignIn from './GoogleSignIn';
import ForgotPassword from '../../ForgotPassword/ForgotPassword';
import { useCart } from '@/contexts/CartContext';

const FormLogin = ({ toggleLogin, setToggleLogin }) => {
    const dispatch = useDispatch();
    const { syncCartOnLogin } = useCart();
    const [stateSignin, setStateSignin] = useState({ username: '', password: '', rememberMe: false });
    const [stateSignup, setStateSignup] = useState({ username: '', email: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [changeForm, setChangeForm] = useState(false);
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);
    const [showPasswordSignup, setShowPasswordSignup] = useState(false);
    const [focusPasswordLogin, setFocusPasswordLogin] = useState(false);
    const [focusPasswordSignup, setFocusPasswordSignup] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isRememberedAccount, setIsRememberedAccount] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const role = useSelector((state) => state.auth.role);
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        if (type === 'success') toast.success(message);
        else if (type === 'error') toast.error(message);
    };

    useEffect(() => {
        if (role === 'Administrator') navigate('/admin');
    }, [role, navigate]);

    useEffect(() => {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        const isRemembered = localStorage.getItem('rememberMe') === 'true';
        if (rememberedUsername && isRemembered) {
            setStateSignin(prev => ({ ...prev, username: rememberedUsername, rememberMe: true }));
            setIsRememberedAccount(true);
        }
    }, []);

    const ChangeFormLogin = () => {
        setChangeForm(!changeForm);
        setFormErrors({});
        setShowPasswordLogin(false);
        setShowPasswordSignup(false);
    }

    const handleModalClose = () => {
        setToggleLogin(false);
        setChangeForm(false);
        setFormErrors({});
        setShowPasswordLogin(false);
        setShowPasswordSignup(false);
        setFocusPasswordLogin(false);
        setFocusPasswordSignup(false);
        setShowForgotPassword(false);

        const rememberedUsername = localStorage.getItem('rememberedUsername');
        const isRemembered = localStorage.getItem('rememberMe') === 'true';
        if (rememberedUsername && isRemembered) {
            setStateSignin(prev => ({ ...prev, username: rememberedUsername, rememberMe: true }));
            setIsRememberedAccount(true);
        } else {
            setStateSignin({ username: '', password: '', rememberMe: false });
            setIsRememberedAccount(false);
        }
        setStateSignup({ username: '', email: '', password: '' });
    }

    const handleGoogleLoginSuccess = async (googleUserData) => {
        try {
            const response = await AuthService.googleSignIn(googleUserData);
            const tokenResponse = response.data;
            showToast('Đăng nhập Google thành công!');
            window.dispatchEvent(new Event('userLoginStatusChanged'));
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberMe');
            handleModalClose();
            if (tokenResponse?.accessToken) {
                const decoded = jwtDecode(tokenResponse.accessToken);
                dispatch(loginAction({ token: tokenResponse.accessToken, role: decoded.role }));
                await syncCartOnLogin();
            }
        } catch (error) {
            console.error('Google login error:', error);
            showToast('Đăng nhập Google thất bại!', 'error');
        }
    };

    const handleGoogleLoginError = (error) => {
        console.error('Google login error:', error);
        showToast('Có lỗi xảy ra khi đăng nhập Google!', 'error');
    };

    const validateFormSignin = () => {
        let errors = {};
        if (!stateSignin.username) errors.username = 'Vui lòng nhập tên đăng nhập';
        if (!stateSignin.password) errors.password = 'Vui lòng nhập mật khẩu';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateFormSignup = () => {
        let errors = {};
        if (!stateSignup.username) errors.username = 'Tên đăng nhập là bắt buộc';
        if (!stateSignup.email) errors.email = 'Email là bắt buộc';
        else if (!/\S+@\S+\.\S+/.test(stateSignup.email)) errors.email = 'Email không hợp lệ';
        if (!stateSignup.password) errors.password = 'Mật khẩu là bắt buộc';
        else if (stateSignup.password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignin = async (e) => {
        e.preventDefault();
        if (!validateFormSignin()) return;
        setIsLoading(true);
        try {
            const res = await AuthService.signin(stateSignin.username, stateSignin.password, stateSignin.rememberMe);
            const tokenResponse = res.data;
            showToast('Đăng nhập thành công!');
            window.dispatchEvent(new Event('userLoginStatusChanged'));
            if (stateSignin.rememberMe) {
                localStorage.setItem('rememberedUsername', stateSignin.username);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedUsername');
                localStorage.removeItem('rememberMe');
            }
            handleModalClose();
            if (tokenResponse?.accessToken) {
                const decoded = jwtDecode(tokenResponse.accessToken);
                dispatch(loginAction({ token: tokenResponse.accessToken, role: decoded.role }));
                syncCartOnLogin();
            }
        } catch (err) {
            const errorMessage = err.response?.data || "Không thể kết nối tới máy chủ.";
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validateFormSignup()) return;
        setIsLoading(true);
        try {
            await AuthService.signup(stateSignup.username, stateSignup.email, stateSignup.password);
            showToast('Đăng ký thành công!');
            setStateSignup({ username: '', email: '', password: '' });
            setChangeForm(false);
        } catch (err) {
            const errorMessage = err.response?.data?.errors?.$values?.[0] || err.response?.data || "Có lỗi xảy ra khi đăng ký!";
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    }

    const HandleOnChangeStateSignin = (e) => {
        const { name, value, type, checked } = e.target;
        setStateSignin(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (name === 'rememberMe' && !checked) {
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberMe');
        }
        if (name === 'username' && isRememberedAccount) {
            const rememberedUsername = localStorage.getItem('rememberedUsername');
            if (value !== rememberedUsername) setIsRememberedAccount(false);
        }
        setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    const HandleOnChangeStateSignup = (e) => {
        const { name, value } = e.target;
        setStateSignup(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (!toggleLogin) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                onClick={handleModalClose}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal Container */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-[440px] animate-fadeIn"
                >
                    {/* Main Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">

                        {/* Decorative Header */}
                        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400">
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-12 -left-6 w-40 h-40 bg-white/10 rounded-full" />
                            <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full" />

                            {/* Close button */}
                            <button
                                onClick={handleModalClose}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer"
                            >
                                <i className='bx bx-x text-xl'></i>
                            </button>

                            {/* Header content */}
                            <div className="absolute bottom-0 left-0 right-0 px-8 pb-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <i className={`bx ${changeForm ? 'bx-user-plus' : 'bx-log-in'} text-white text-lg`}></i>
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        {changeForm ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
                                    </h2>
                                </div>
                                <p className="text-white/70 text-xs ml-10">
                                    {changeForm ? 'Đăng ký để trải nghiệm mua sắm tuyệt vời' : 'Đăng nhập vào tài khoản của bạn'}
                                </p>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="px-8 pt-7 pb-6 relative">

                            {/* ======= LOGIN FORM ======= */}
                            <div className={`transition-all duration-500 ease-in-out ${changeForm ? 'opacity-0 absolute inset-x-8 pointer-events-none -translate-x-6' : 'opacity-100 relative translate-x-0'}`}>
                                <form onSubmit={handleSignin} autoComplete="off">
                                    {/* Username */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Tên đăng nhập
                                        </label>
                                        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${formErrors.username ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20'} bg-gray-50/80 dark:bg-gray-800/50`}>
                                            <span className="pl-4 text-gray-400"><i className='bx bx-user text-lg'></i></span>
                                            <input
                                                className="w-full px-3 py-3 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
                                                type="text" autoFocus name="username"
                                                value={stateSignin.username} onChange={HandleOnChangeStateSignin}
                                                placeholder="Nhập tên đăng nhập"
                                                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                                            />
                                            {isRememberedAccount && stateSignin.username && (
                                                <span className="pr-3"><i className='bx bxs-check-circle text-emerald-500'></i></span>
                                            )}
                                        </div>
                                        {formErrors.username && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.username}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Mật khẩu
                                        </label>
                                        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${formErrors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20'} bg-gray-50/80 dark:bg-gray-800/50`}>
                                            <span className="pl-4 text-gray-400"><i className='bx bx-lock-alt text-lg'></i></span>
                                            <input
                                                className="w-full px-3 py-3 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
                                                type={showPasswordLogin ? "text" : "password"}
                                                name="password" value={stateSignin.password}
                                                onChange={HandleOnChangeStateSignin}
                                                onFocus={() => setFocusPasswordLogin(true)}
                                                onBlur={() => setFocusPasswordLogin(false)}
                                                placeholder="Nhập mật khẩu"
                                                autoComplete="off"
                                            />
                                            {(focusPasswordLogin || stateSignin.password.length > 0) && (
                                                <button type="button" onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                                                    className="pr-4 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer">
                                                    <i className={`bx ${showPasswordLogin ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                                </button>
                                            )}
                                        </div>
                                        {formErrors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.password}</p>}
                                    </div>

                                    {/* Remember & Forgot */}
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                                            <div className="relative">
                                                <input type="checkbox" name="rememberMe" checked={stateSignin.rememberMe}
                                                    onChange={HandleOnChangeStateSignin}
                                                    className="sr-only peer" />
                                                <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                                                    {stateSignin.rememberMe && <i className='bx bx-check text-white text-xs'></i>}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Ghi nhớ đăng nhập</span>
                                        </label>
                                        <button type="button" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}
                                            className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer">
                                            Quên mật khẩu?
                                        </button>
                                    </div>

                                    {/* Login Button */}
                                    <button type="submit" disabled={isLoading}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all duration-300 disabled:opacity-70 cursor-pointer active:scale-[0.98]">
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Đang xử lý...
                                            </span>
                                        ) : 'Đăng nhập'}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 my-5">
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                        <span className="text-xs text-gray-400 font-medium">hoặc tiếp tục với</span>
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                    </div>

                                    {/* Social */}
                                    <div className="flex gap-3 mb-6">
                                        <button type="button"
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer">
                                            <i className='bx bxl-facebook-circle text-blue-600 text-xl'></i>
                                            Facebook
                                        </button>
                                        <GoogleSignIn
                                            onGoogleLoginSuccess={handleGoogleLoginSuccess}
                                            onGoogleLoginError={handleGoogleLoginError}
                                        />
                                    </div>

                                    {/* Switch to Register */}
                                    <p className="text-center text-sm text-gray-500">
                                        Chưa có tài khoản?{' '}
                                        <button type="button" onClick={ChangeFormLogin}
                                            className="text-amber-600 hover:text-amber-700 font-semibold transition-colors cursor-pointer">
                                            Đăng ký ngay
                                        </button>
                                    </p>
                                </form>
                            </div>

                            {/* ======= REGISTER FORM ======= */}
                            <div className={`transition-all duration-500 ease-in-out ${!changeForm ? 'opacity-0 absolute inset-x-8 pointer-events-none translate-x-6' : 'opacity-100 relative translate-x-0'}`}>
                                <form onSubmit={handleSignup} autoComplete="off">
                                    {/* Username */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Tên đăng nhập
                                        </label>
                                        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${formErrors.username ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20'} bg-gray-50/80 dark:bg-gray-800/50`}>
                                            <span className="pl-4 text-gray-400"><i className='bx bx-user text-lg'></i></span>
                                            <input
                                                className="w-full px-3 py-3 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
                                                type="text" name="username" value={stateSignup.username}
                                                onChange={HandleOnChangeStateSignup}
                                                placeholder="Chọn tên đăng nhập" autoComplete="off"
                                            />
                                        </div>
                                        {formErrors.username && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.username}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Email
                                        </label>
                                        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${formErrors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20'} bg-gray-50/80 dark:bg-gray-800/50`}>
                                            <span className="pl-4 text-gray-400"><i className='bx bx-envelope text-lg'></i></span>
                                            <input
                                                className="w-full px-3 py-3 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
                                                type="email" name="email" value={stateSignup.email}
                                                onChange={HandleOnChangeStateSignup}
                                                placeholder="email@example.com" autoComplete="off"
                                            />
                                        </div>
                                        {formErrors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Mật khẩu
                                        </label>
                                        <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${formErrors.password ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20'} bg-gray-50/80 dark:bg-gray-800/50`}>
                                            <span className="pl-4 text-gray-400"><i className='bx bx-lock-alt text-lg'></i></span>
                                            <input
                                                className="w-full px-3 py-3 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
                                                type={showPasswordSignup ? "text" : "password"}
                                                name="password" value={stateSignup.password}
                                                onChange={HandleOnChangeStateSignup}
                                                onFocus={() => setFocusPasswordSignup(true)}
                                                onBlur={() => setFocusPasswordSignup(false)}
                                                placeholder="Tối thiểu 6 ký tự" autoComplete="off"
                                            />
                                            {(focusPasswordSignup || stateSignup.password.length > 0) && (
                                                <button type="button" onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                                                    className="pr-4 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer">
                                                    <i className={`bx ${showPasswordSignup ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                                </button>
                                            )}
                                        </div>
                                        {formErrors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.password}</p>}
                                    </div>

                                    {/* Terms */}
                                    <label className="flex items-start gap-2 mb-6 cursor-pointer select-none group">
                                        <div className="relative mt-0.5">
                                            <input type="checkbox" name="acceptTerms" className="sr-only peer" />
                                            <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center"></div>
                                        </div>
                                        <span className="text-xs text-gray-500 leading-relaxed">
                                            Tôi đồng ý với <a href="#" className="text-amber-600 hover:underline font-medium">Điều khoản sử dụng</a> và <a href="#" className="text-amber-600 hover:underline font-medium">Chính sách bảo mật</a>
                                        </span>
                                    </label>

                                    {/* Register Button */}
                                    <button type="submit" disabled={isLoading}
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all duration-300 disabled:opacity-70 cursor-pointer active:scale-[0.98]">
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Đang xử lý...
                                            </span>
                                        ) : 'Đăng ký tài khoản'}
                                    </button>

                                    {/* Switch to Login */}
                                    <p className="text-center text-sm text-gray-500 mt-5">
                                        Đã có tài khoản?{' '}
                                        <button type="button" onClick={ChangeFormLogin}
                                            className="text-amber-600 hover:text-amber-700 font-semibold transition-colors cursor-pointer">
                                            Đăng nhập ngay
                                        </button>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ForgotPassword
                visible={showForgotPassword}
                onCancel={() => setShowForgotPassword(false)}
            />
        </>
    )
}

export default FormLogin;