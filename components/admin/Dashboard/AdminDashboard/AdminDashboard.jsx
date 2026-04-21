"use client";

import React from 'react';
import { useEffect } from 'react';
import AppBar from '../AppBar/AppBar';
import LeftBar from '../LeftBar/LeftBar';
import RightBody from '../RightBody/RightBody';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationService from '@/services/NotificationService';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const leftBar = useSelector((state) => state.leftbar.leftbar);

  useEffect(() => {
    // Khởi tạo thông báo real-time cho admin
    const initializeNotifications = async () => {
      try {
        await NotificationService.setupSignalRNotifications();
        NotificationService.requestNotificationPermission();
        NotificationService.cleanOldNotifications();


      } catch (error) {
        console.error('❌ Admin Dashboard: Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <div className='h-screen overflow-hidden'>
      <AppBar />
      <div className='h-[calc(100vh-4rem)] flex justify-between items-stretch relative'>
        {/* Mobile overlay when sidebar is open */}
        <div className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300 ${!leftBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
        <LeftBar />
        <RightBody />
      </div>
    </div>
  );
};

export default AdminDashboard;
