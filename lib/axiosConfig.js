"use client";

import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || (typeof window !== 'undefined' ? window.location.origin : '');

// Tạo axios instance chính
const axiosInstance = axios.create({
    baseURL: API_ENDPOINT,
    withCredentials: true,
    timeout: 10000,
});

// Biến để tránh refresh token nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

// Hàm refresh access token
const refreshAccessToken = async () => {
    if (isRefreshing) {
        return new Promise((resolve) => {
            failedQueue.push(resolve);
        });
    }

    isRefreshing = true;

    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_ENDPOINT}/api/Account/Refresh`, {
            refreshToken: refreshToken
        });

        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('tokenExpiry', Date.now() + (response.data.expiresIn * 1000));

        failedQueue.forEach(resolve => resolve(true));
        failedQueue = [];

        return true;
    } catch (error) {
        failedQueue.forEach(resolve => resolve(false));
        failedQueue = [];

        handleTokenExpired();
        return false;
    } finally {
        isRefreshing = false;
    }
};

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        if (typeof window === 'undefined') return config;

        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime + 60) {
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
                    } else {
                        delete config.headers.Authorization;
                    }
                } else {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                handleTokenExpired();
                delete config.headers.Authorization;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const { response } = error;

        if (response) {
            const isUserAction = ['post', 'put', 'delete', 'patch'].includes(
                originalRequest?.method?.toLowerCase()
            );

            switch (response.status) {
                case 401:
                    // Skip 401 handling for auth endpoints — they return 401 for invalid credentials, not expired tokens
                    const requestUrl = originalRequest?.url || '';
                    const isAuthEndpoint = requestUrl.includes('/Account/SignIn') || requestUrl.includes('/Account/SignUp') || requestUrl.includes('/Account/GoogleSignIn');
                    if (isAuthEndpoint) {
                        // Let the error propagate to the caller (FormLogin) to show its own error message
                        break;
                    }
                    if (!originalRequest._retry && typeof window !== 'undefined' && localStorage.getItem('refreshToken')) {
                        originalRequest._retry = true;
                        const refreshed = await refreshAccessToken();
                        if (refreshed) {
                            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
                            return axiosInstance(originalRequest);
                        } else {
                            handleTokenExpired();
                        }
                    } else if (!isAuthEndpoint) {
                        handleTokenExpired();
                    }
                    break;
                case 403:
                    toast.error('Bạn không có quyền truy cập chức năng này!');
                    break;
                case 404:
                    if (isUserAction) {
                        toast.error('Không tìm thấy tài nguyên yêu cầu!');
                    }
                    break;
                case 500:
                    toast.error('Có lỗi xảy ra trên server!');
                    break;
                default:
                    if (isUserAction) {
                        if (response.data && response.data.message) {
                            toast.error(response.data.message);
                        } else {
                            toast.error('Có lỗi xảy ra!');
                        }
                    }
            }
        } else {
            const isUserAction = ['post', 'put', 'delete', 'patch'].includes(
                originalRequest?.method?.toLowerCase()
            );
            if (isUserAction) {
                toast.error('Không thể kết nối đến server!');
            }
        }

        return Promise.reject(error);
    }
);

// Hàm xử lý khi token hết hạn
const handleTokenExpired = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');

    toast.error('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');

    window.dispatchEvent(new Event('userLoginStatusChanged'));

    if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/';
    }

    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// Hàm kiểm tra token có hợp lệ không
export const isTokenValid = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch {
        return false;
    }
};

// Hàm lấy thời gian còn lại của token (tính bằng giây)
export const getTokenTimeRemaining = () => {
    if (typeof window === 'undefined') return 0;
    const token = localStorage.getItem('token');
    if (!token) return 0;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return Math.max(0, decoded.exp - currentTime);
    } catch {
        return 0;
    }
};

export { refreshAccessToken };

export default axiosInstance;
