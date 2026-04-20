"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTokenTimeRemaining } from '@/services/axiosConfig';

const TokenExpiryWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const remaining = getTokenTimeRemaining();
      
      if (remaining > 0 && remaining <= 300) { // 5 phút trước khi hết hạn
        setTimeRemaining(remaining);
        setShowWarning(true);
        
        // Hiển thị toast cảnh báo
        if (remaining <= 60) { // 1 phút cuối
          toast.warning(`Phiên đăng nhập sẽ hết hạn trong ${Math.ceil(remaining)} giây!`, {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
          });
        } else {
          toast.warning(`Phiên đăng nhập sẽ hết hạn trong ${Math.ceil(remaining / 60)} phút!`, {
            autoClose: 5000,
          });
        }
      } else {
        setShowWarning(false);
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenExpiry();

    // Kiểm tra mỗi 30 giây
    const interval = setInterval(checkTokenExpiry, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <i className="bx bx-time text-xl"></i>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            Phiên đăng nhập sẽ hết hạn trong: {formatTime(timeRemaining)}
          </p>
          <p className="text-xs mt-1">
            Vui lòng lưu công việc và đăng nhập lại
          </p>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="ml-4 text-yellow-500 hover:text-yellow-700"
        >
          <i className="bx bx-x text-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default TokenExpiryWarning; 