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
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [changeForm, setChangeForm] = useState(false);
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);
    const [showPasswordSignup, setShowPasswordSignup] = useState(false);
    const [focusPasswordLogin, setFocusPasswordLogin] = useState(false);
    const [focusPasswordSignup, setFocusPasswordSignup] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isRememberedAccount, setIsRememberedAccount] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
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
        if (isAnimating) return;
        setIsAnimating(true);
        setChangeForm(!changeForm);
        setFormErrors({});
        setShowPasswordLogin(false);
        setShowPasswordSignup(false);
        setTimeout(() => setIsAnimating(false), 700);
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
        setAcceptTerms(false);
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
        if (!acceptTerms) errors.acceptTerms = 'Bạn cần đồng ý với điều khoản và chính sách';
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
            setAcceptTerms(false);
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

    const inputCls = "w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:border-amber-500 focus:bg-amber-50 dark:focus:bg-amber-950/40 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]";
    const inputErrCls = "w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none bg-red-50/50 border border-red-300 text-gray-800 placeholder-gray-400";
    const iconCls = "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg";

    return (
        <>
            <style>{`
                @keyframes fl-open{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
            `}</style>
            <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={handleModalClose}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                <div onClick={e => e.stopPropagation()} className="relative z-10 w-full max-w-[820px]" style={{ animation: 'fl-open .3s ease' }}>
                    <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:min-h-[480px]">

                        {/* OVERLAY PANEL - slides left/right */}
                        <div className={`absolute top-0 bottom-0 w-1/2 z-20 transition-all duration-700 ease-in-out hidden sm:block ${changeForm ? 'left-0 rounded-r-[60px]' : 'left-1/2 rounded-l-[60px]'}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 overflow-hidden">
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
                                <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-white/5 rounded-full" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 border border-white/20">
                                    <i className='bx bxs-store-alt text-white text-2xl'></i>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">{changeForm ? 'Chào mừng trở lại!' : 'Xin chào!'}</h2>
                                <p className="text-white/80 text-sm mb-6 max-w-[220px] leading-relaxed">
                                    {changeForm ? 'Đăng nhập để tiếp tục mua sắm cùng chúng tôi' : 'Đăng ký tài khoản để trải nghiệm mua sắm tuyệt vời'}
                                </p>
                                <button type="button" onClick={ChangeFormLogin}
                                    className="px-8 py-2.5 rounded-full border-2 border-white/70 text-white text-sm font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 cursor-pointer tracking-wide">
                                    {changeForm ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
                                </button>
                            </div>
                        </div>

                        {/* Mobile header */}
                        <div className="sm:hidden relative h-36 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-12 -left-6 w-40 h-40 bg-white/5 rounded-full" />
                            <button onClick={handleModalClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer">
                                <i className='bx bx-x text-xl'></i>
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center"><i className='bx bxs-store-alt text-white text-lg'></i></div>
                                    <h2 className="text-xl font-bold text-white">{changeForm ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h2>
                                </div>
                                <p className="text-white/70 text-xs ml-12">{changeForm ? 'Đăng ký để trải nghiệm mua sắm' : 'Đăng nhập vào tài khoản của bạn'}</p>
                            </div>
                        </div>

                        {/* Close btn desktop */}
                        <button onClick={handleModalClose} className="hidden sm:flex absolute top-4 right-4 z-30 w-8 h-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
                            <i className='bx bx-x text-xl'></i>
                        </button>

                {/* FORMS CONTAINER */}
                        <div className="relative w-full sm:min-h-[480px]">

                            {/* LOGIN - left side on desktop */}
                            <div className={`w-full sm:w-1/2 sm:absolute sm:top-0 sm:bottom-0 sm:left-0 transition-opacity duration-500 ${changeForm ? 'hidden sm:block sm:opacity-0 sm:pointer-events-none' : 'block sm:opacity-100'}`}>
                                <div className="px-6 sm:px-10 py-6 sm:py-10 flex flex-col justify-center h-full">
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">Đăng nhập</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm">Đăng nhập vào tài khoản của bạn</p>
                                    </div>
                                    <form onSubmit={handleSignin} autoComplete="nope">
                                        <div className="mb-3 sm:mb-4">
                                            <div className="relative">
                                                <i className={`bx bx-user ${iconCls}`}></i>
                                                <input className={formErrors.username ? inputErrCls : inputCls} type="text" autoFocus name="username" value={stateSignin.username} onChange={HandleOnChangeStateSignin} placeholder="Tên đăng nhập" autoComplete="one-time-code" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
                                                {isRememberedAccount && stateSignin.username && <span className="absolute right-3 top-1/2 -translate-y-1/2"><i className='bx bxs-check-circle text-amber-500'></i></span>}
                                            </div>
                                            {formErrors.username && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.username}</p>}
                                        </div>
                                        <div className="mb-3 sm:mb-4">
                                            <div className="relative">
                                                <i className={`bx bx-lock-alt ${iconCls}`}></i>
                                                <input className={formErrors.password ? inputErrCls : inputCls} type={showPasswordLogin ? "text" : "password"} name="password" value={stateSignin.password} onChange={HandleOnChangeStateSignin} onFocus={() => setFocusPasswordLogin(true)} onBlur={() => setFocusPasswordLogin(false)} placeholder="Mật khẩu" autoComplete="new-password" />
                                                {(focusPasswordLogin || stateSignin.password.length > 0) && (
                                                    <button type="button" onClick={() => setShowPasswordLogin(!showPasswordLogin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer">
                                                        <i className={`bx ${showPasswordLogin ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                                    </button>
                                                )}
                                            </div>
                                            {formErrors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.password}</p>}
                                        </div>
                                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" name="rememberMe" checked={stateSignin.rememberMe} onChange={HandleOnChangeStateSignin} className="sr-only peer" />
                                                <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                                                    {stateSignin.rememberMe && <i className='bx bx-check text-white text-xs'></i>}
                                                </div>
                                                <span className="text-xs text-gray-500">Ghi nhớ đăng nhập</span>
                                            </label>
                                            <button type="button" onClick={e => { e.preventDefault(); setShowForgotPassword(true); }} className="text-xs text-amber-600 hover:text-amber-700 font-medium cursor-pointer">Quên mật khẩu?</button>
                                        </div>
                                        <button type="submit" disabled={isLoading} className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all duration-300 disabled:opacity-70 cursor-pointer active:scale-[0.97] hover:-translate-y-0.5">
                                            {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Đang xử lý...</span> : 'ĐĂNG NHẬP'}
                                        </button>
                                        <div className="flex items-center gap-3 my-4 sm:my-5">
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                                            <span className="text-xs text-gray-400">hoặc</span>
                                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                                        </div>
                                        <div className="flex gap-3 mb-4 sm:mb-5">
                                            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer">
                                                <i className='bx bxl-facebook-circle text-blue-600 text-xl'></i>Facebook
                                            </button>
                                            <GoogleSignIn onGoogleLoginSuccess={handleGoogleLoginSuccess} onGoogleLoginError={handleGoogleLoginError} />
                                        </div>
                                        <p className="text-center text-sm text-gray-500 sm:hidden">Chưa có tài khoản?{' '}<button type="button" onClick={ChangeFormLogin} className="text-amber-600 font-semibold cursor-pointer">Đăng ký ngay</button></p>
                                    </form>
                                </div>
                            </div>

                            {/* SIGNUP - right side on desktop */}
                            <div className={`w-full sm:w-1/2 sm:absolute sm:top-0 sm:bottom-0 sm:right-0 transition-opacity duration-500 ${!changeForm ? 'hidden sm:block sm:opacity-0 sm:pointer-events-none' : 'block sm:opacity-100'}`}>
                                <div className="px-6 sm:px-10 py-6 sm:py-10 flex flex-col justify-center h-full">
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">Tạo tài khoản</h3>
                                        <p className="text-gray-400 text-xs sm:text-sm">Đăng ký để bắt đầu mua sắm</p>
                                    </div>
                                    <form onSubmit={handleSignup} autoComplete="nope">
                                        <div className="mb-3 sm:mb-4">
                                            <div className="relative">
                                                <i className={`bx bx-user ${iconCls}`}></i>
                                                <input className={formErrors.username ? inputErrCls : inputCls} type="text" name="username" value={stateSignup.username} onChange={HandleOnChangeStateSignup} placeholder="Tên đăng nhập" autoComplete="one-time-code" />
                                            </div>
                                            {formErrors.username && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.username}</p>}
                                        </div>
                                        <div className="mb-3 sm:mb-4">
                                            <div className="relative">
                                                <i className={`bx bx-envelope ${iconCls}`}></i>
                                                <input className={formErrors.email ? inputErrCls : inputCls} type="email" name="email" value={stateSignup.email} onChange={HandleOnChangeStateSignup} placeholder="email@example.com" autoComplete="one-time-code" />
                                            </div>
                                            {formErrors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.email}</p>}
                                        </div>
                                        <div className="mb-3 sm:mb-4">
                                            <div className="relative">
                                                <i className={`bx bx-lock-alt ${iconCls}`}></i>
                                                <input className={formErrors.password ? inputErrCls : inputCls} type={showPasswordSignup ? "text" : "password"} name="password" value={stateSignup.password} onChange={HandleOnChangeStateSignup} onFocus={() => setFocusPasswordSignup(true)} onBlur={() => setFocusPasswordSignup(false)} placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" />
                                                {(focusPasswordSignup || stateSignup.password.length > 0) && (
                                                    <button type="button" onClick={() => setShowPasswordSignup(!showPasswordSignup)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer">
                                                        <i className={`bx ${showPasswordSignup ? 'bx-hide' : 'bx-show'} text-lg`}></i>
                                                    </button>
                                                )}
                                            </div>
                                            {formErrors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.password}</p>}
                                        </div>
                                        <div className="mb-4 sm:mb-6">
                                            <label className="flex items-start gap-2 cursor-pointer select-none">
                                                <div className="relative mt-0.5">
                                                    <input type="checkbox" name="acceptTerms" checked={acceptTerms} onChange={(e) => { setAcceptTerms(e.target.checked); setFormErrors(prev => ({ ...prev, acceptTerms: '' })); }} className="sr-only peer" />
                                                    <div className={`w-4 h-4 border-2 rounded transition-all flex items-center justify-center ${formErrors.acceptTerms ? 'border-red-400 bg-red-50' : 'border-gray-300 peer-checked:bg-amber-500 peer-checked:border-amber-500'}`}>
                                                        {acceptTerms && <i className='bx bx-check text-white text-xs'></i>}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 leading-relaxed">Tôi đồng ý với <a href="/ho-tro/dieu-khoan-su-dung" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium" onClick={e => e.stopPropagation()}>Điều khoản sử dụng</a> và <a href="/ho-tro/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium" onClick={e => e.stopPropagation()}>Chính sách bảo mật</a></span>
                                            </label>
                                            {formErrors.acceptTerms && <p className="mt-1 ml-6 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{formErrors.acceptTerms}</p>}
                                        </div>
                                        <button type="submit" disabled={isLoading || !acceptTerms} className={`w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 transition-all duration-300 ${isLoading || !acceptTerms ? 'opacity-50 cursor-not-allowed' : 'hover:from-amber-600 hover:to-orange-600 cursor-pointer active:scale-[0.97] hover:-translate-y-0.5'}`}>
                                            {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Đang xử lý...</span> : 'ĐĂNG KÝ TÀI KHOẢN'}
                                        </button>
                                        <p className="text-center text-sm text-gray-500 mt-4 sm:mt-5 sm:hidden">Đã có tài khoản?{' '}<button type="button" onClick={ChangeFormLogin} className="text-amber-600 font-semibold cursor-pointer">Đăng nhập</button></p>
                                    </form>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <ForgotPassword visible={showForgotPassword} onCancel={() => setShowForgotPassword(false)} />
        </>
    )
}

export default FormLogin;