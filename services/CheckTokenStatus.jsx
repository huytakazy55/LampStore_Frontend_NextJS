"use client";

import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const checkTokenAndLogout = () => {
  const token = localStorage.getItem('token'); 

  if (!token) {
    return;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime) {
      // Token đã hết hạn
      localStorage.clear();
      toast.error('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
      
      // Dispatch event để cập nhật UI
      window.dispatchEvent(new Event('userLoginStatusChanged'));
      
      // Chuyển về trang chủ nếu đang ở admin
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/';
      }
      
      // Reload trang để reset state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    // Token không hợp lệ
    localStorage.clear();
    toast.error('Token không hợp lệ! Vui lòng đăng nhập lại.');
    
    // Dispatch event để cập nhật UI
    window.dispatchEvent(new Event('userLoginStatusChanged'));
    
    // Chuyển về trang chủ nếu đang ở admin
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    }
    
    // Reload trang để reset state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

const startTokenCheck = () => {
  // Kiểm tra mỗi phút
  setInterval(() => {
    checkTokenAndLogout();
  }, 60000);
};

startTokenCheck();
