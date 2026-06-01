"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppBar from '../AppBar/AppBar';
import LeftBar from '../LeftBar/LeftBar';
import RightBody from '../RightBody/RightBody';
import 'react-toastify/dist/ReactToastify.css';
import NotificationService from '@/services/NotificationService';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const leftBar = useSelector((state) => state.leftbar.leftbar);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const shownNotifKeysRef = useRef(new Set());

  useEffect(() => {
    document.body.classList.add('admin-dashboard-active');
    return () => document.body.classList.remove('admin-dashboard-active');
  }, []);

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

  const handleInAppNotification = useCallback((event) => {
    const notification = event.detail;
    if (notification.type !== 'chat') return;

    const chatId = notification.chatId || notification.ChatId || '';
    const contentText = notification.content || notification.Content || notification.message || '';
    const dedupKey = `${chatId}_${contentText.substring(0, 40)}_${Math.floor(Date.now() / 5000)}`;
    if (shownNotifKeysRef.current.has(dedupKey)) return;

    shownNotifKeysRef.current.add(dedupKey);
    setTimeout(() => shownNotifKeysRef.current.delete(dedupKey), 5000);

    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      chatId,
      userName: notification.senderName || notification.SenderName || 'Khách hàng',
      content: contentText,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    };

    setRealtimeNotifications(prev => [entry, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setRealtimeNotifications(prev => prev.filter(item => item.id !== entry.id));
    }, 10000);
  }, []);

  useEffect(() => {
    window.addEventListener('inAppNotification', handleInAppNotification);
    return () => window.removeEventListener('inAppNotification', handleInAppNotification);
  }, [handleInAppNotification]);

  const closeRealtimeNotification = (notificationId) => {
    setRealtimeNotifications(prev => prev.filter(item => item.id !== notificationId));
  };

  return (
    <div className='h-screen overflow-hidden dark:bg-gray-900'>
      <style jsx>{`
        @keyframes adminNotificationSlideIn {
          from {
            opacity: 0;
            transform: translateX(28px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .admin-notification-slide-in {
          animation: adminNotificationSlideIn 0.25s ease-out;
        }
      `}</style>
      <AppBar />
      {realtimeNotifications.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[2000] flex max-w-[420px] flex-col gap-3">
          {realtimeNotifications.map((notification) => (
            <div
              key={notification.id}
              className="admin-notification-slide-in rounded-xl border-l-4 border-green-500 bg-white p-4 shadow-2xl"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-green-600">
                    Tin nhắn mới - {notification.timestamp}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {notification.userName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => closeRealtimeNotification(notification.id)}
                  className="text-slate-400 transition-colors hover:text-red-500"
                  aria-label="Đóng thông báo"
                >
                  <i className="bx bx-x text-lg" />
                </button>
              </div>
              <div className="rounded-lg border-l-2 border-green-500 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {notification.content.length > 120
                  ? `${notification.content.substring(0, 120)}...`
                  : notification.content}
              </div>
              <div className="mt-3 flex justify-end">
                <a
                  href="/admin/chat"
                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                >
                  Xem chat
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
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
