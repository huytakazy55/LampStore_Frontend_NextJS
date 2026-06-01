"use client";

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import AppBar from '../AppBar/AppBar';
import LeftBar from '../LeftBar/LeftBar';
import RightBody from '../RightBody/RightBody';
import 'react-toastify/dist/ReactToastify.css';
import NotificationService from '@/services/NotificationService';
import { useSelector } from 'react-redux';
import { ThemeContext } from '@/contexts/ThemeContext';

const AdminDashboard = () => {
  const leftBar = useSelector((state) => state.leftbar.leftbar);
  const { themeColors } = useContext(ThemeContext);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const shownNotifKeysRef = useRef(new Set());

  const getInitial = (name) => (name || 'K').trim().charAt(0).toUpperCase();

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
    <div
      className='h-screen overflow-hidden dark:bg-gray-900'
      style={{
        '--chat-toast-start': themeColors.StartColorLinear,
        '--chat-toast-end': themeColors.EndColorLinear,
      }}
    >
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

        .admin-chat-toast-stack {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 2000;
          display: flex;
          width: min(370px, calc(100vw - 32px));
          flex-direction: column;
          gap: 10px;
        }

        .admin-chat-toast {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18), 0 6px 18px rgba(15, 23, 42, 0.08);
        }

        .admin-chat-toast::before {
          content: '';
          position: absolute;
          inset: 0 auto 0 0;
          width: 5px;
          background: linear-gradient(180deg, var(--chat-toast-start) 0%, var(--chat-toast-end) 100%);
        }

        .admin-chat-toast-inner {
          padding: 12px 14px 12px 18px;
        }

        .admin-chat-toast-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-chat-toast-avatar {
          display: flex;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--chat-toast-start) 0%, var(--chat-toast-end) 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 8px 18px color-mix(in srgb, var(--chat-toast-start) 24%, transparent);
        }

        .admin-chat-toast-main {
          min-width: 0;
          flex: 1;
        }

        .admin-chat-toast-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--chat-toast-start) 14%, #ffffff);
          padding: 2px 8px;
          color: color-mix(in srgb, var(--chat-toast-start) 78%, #0f172a);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .admin-chat-toast-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--chat-toast-start);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--chat-toast-start) 18%, transparent);
        }

        .admin-chat-toast-name-row {
          margin-top: 5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .admin-chat-toast-name {
          overflow: hidden;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .admin-chat-toast-time {
          flex: 0 0 auto;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
        }

        .admin-chat-toast-close {
          display: flex;
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #94a3b8;
          transition: all 0.18s ease;
        }

        .admin-chat-toast-close:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .admin-chat-toast-message {
          margin: 9px 0 10px 46px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          padding: 8px 10px;
          color: #475569;
          font-size: 13px;
          line-height: 1.38;
        }

        .admin-chat-toast-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .admin-chat-toast-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--chat-toast-start) 0%, var(--chat-toast-end) 100%);
          padding: 7px 12px;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 8px 16px color-mix(in srgb, var(--chat-toast-start) 20%, transparent);
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .admin-chat-toast-link:hover {
          color: #fff;
          filter: brightness(1.03);
          transform: translateY(-1px);
          box-shadow: 0 10px 20px color-mix(in srgb, var(--chat-toast-end) 26%, transparent);
        }

        @media (max-width: 640px) {
          .admin-chat-toast-stack {
            right: 16px;
            bottom: 16px;
          }

          .admin-chat-toast-message {
            margin-left: 0;
          }
        }
      `}</style>
      <AppBar />
      {realtimeNotifications.length > 0 && (
        <div className="admin-chat-toast-stack">
          {realtimeNotifications.map((notification) => (
            <div
              key={notification.id}
              className="admin-chat-toast admin-notification-slide-in"
            >
              <div className="admin-chat-toast-inner">
                <div className="admin-chat-toast-top">
                  <div className="admin-chat-toast-avatar">
                    {getInitial(notification.userName)}
                  </div>
                  <div className="admin-chat-toast-main">
                    <div className="admin-chat-toast-label">
                      <span className="admin-chat-toast-dot" />
                      Tin nhắn mới
                    </div>
                    <div className="admin-chat-toast-name-row">
                      <div className="admin-chat-toast-name">{notification.userName}</div>
                      <div className="admin-chat-toast-time">{notification.timestamp}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => closeRealtimeNotification(notification.id)}
                    className="admin-chat-toast-close"
                    aria-label="Đóng thông báo"
                  >
                    <i className="bx bx-x text-lg" />
                  </button>
                </div>

                <div className="admin-chat-toast-message">
                  {notification.content.length > 120
                    ? `${notification.content.substring(0, 120)}...`
                    : notification.content}
                </div>

                <div className="admin-chat-toast-footer">
                  <a href="/admin/chat" className="admin-chat-toast-link">
                    <i className="bx bx-message-rounded-dots" />
                    Xem chat
                  </a>
                </div>
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
