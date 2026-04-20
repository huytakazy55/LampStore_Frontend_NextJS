"use client";

import React, { useState } from 'react';
import AuthService from '@/services/AuthService';
import { toast } from 'react-toastify';

const ForgotPassword = ({ visible, onCancel }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        toast.success(response.data.message || response.data.Message);
        setEmailOrUsername('');
        onCancel();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.Message ||
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" onClick={handleCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-[400px] animate-fadeIn">

        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">

          {/* Header */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-4 w-28 h-28 bg-white/10 rounded-full" />

            <button onClick={handleCancel}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all cursor-pointer">
              <i className='bx bx-x text-xl'></i>
            </button>

            <div className="absolute bottom-0 left-0 right-0 px-7 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className='bx bx-lock-open text-white text-lg'></i>
                </div>
                <h2 className="text-lg font-bold text-white">Quên mật khẩu</h2>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
              Nhập email hoặc tên đăng nhập. Chúng tôi sẽ gửi mật khẩu mới đến email đã đăng ký.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <div className={`relative flex items-center border-2 rounded-xl transition-all duration-200 ${error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 dark:border-gray-700 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20'} bg-gray-50/80 dark:bg-gray-800/50`}>
                  <span className="pl-4 text-gray-400"><i className='bx bx-user text-lg'></i></span>
                  <input
                    className="w-full px-3 py-3 bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none placeholder-gray-400"
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
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
                  Hủy
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-200/50 transition-all disabled:opacity-70 cursor-pointer">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Đang gửi...
                    </span>
                  ) : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Bạn sẽ nhận được email chứa mật khẩu mới trong vài phút
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;