"use client";

import React, { useState, useEffect } from 'react';
import AuthService from '@/services/AuthService';
import { toast } from 'react-toastify';

const ForgotPassword = ({ visible, onCancel }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setError('Vui lòng nhập email hoặc tên đăng nhập');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await AuthService.ForgotPassword(emailOrUsername);
      if (response.data.message || response.data.Message) {
        toast.success(response.data.message || response.data.Message || 'Yêu cầu đã được gửi thành công.');
        setEmailOrUsername('');
        onCancel();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.detail ||
        'Đã xảy ra lỗi. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmailOrUsername('');
    setError('');
    onCancel();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] transition-all duration-300">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm touch-none" />
      <div className="fixed inset-0 overflow-y-auto" onClick={handleCancel}>
        <div className="flex min-h-full items-start justify-center p-4">
          <div onClick={(e) => e.stopPropagation()}
            className="relative m-auto z-10 w-full max-w-[360px] animate-fadeIn">

        <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">

          {/* Header */}
          <div className="relative h-20 overflow-hidden bg-primary-600">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full" />

            <button onClick={handleCancel}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer">
              <i className='bx bx-x text-lg'></i>
            </button>

            <div className="absolute bottom-0 left-0 right-0 px-6 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className='bx bx-lock-open text-white text-base'></i>
                </div>
                <h2 className="text-base font-bold text-white">Quên mật khẩu</h2>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Nhập email hoặc tên đăng nhập. Chúng tôi sẽ gửi mật khẩu mới đến email đã đăng ký.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="relative">
                  <i className="bx bx-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                  <input
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 ${error ? 'bg-red-50/50 border border-red-300' : 'bg-primary-50/60 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-800/30 focus:border-primary-500 focus:bg-primary-50 dark:focus:bg-primary-950/40 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'} text-gray-800 dark:text-gray-200 placeholder-gray-400`}
                    type="text" value={emailOrUsername}
                    onChange={(e) => { setEmailOrUsername(e.target.value); setError(''); }}
                    placeholder="Email hoặc tên đăng nhập"
                    autoFocus autoComplete="off"
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><i className='bx bx-error-circle'></i>{error}</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer active:scale-[0.97]">
                  Hủy
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-lg shadow-primary-200/50 dark:shadow-primary-900/30 transition-all duration-300 disabled:opacity-70 cursor-pointer active:scale-[0.97] hover:-translate-y-0.5">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Đang gửi...
                    </span>
                  ) : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>

            <p className="text-center text-[11px] text-gray-400 mt-4">
              Bạn sẽ nhận được email chứa mật khẩu mới trong vài phút
            </p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;