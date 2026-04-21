"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  markAsRead,
  markAllAsRead,
  setDropdownOpen,
  removeNotification
} from '@/redux/slices/notificationSlice';

const NotificationDropdown = ({ themeColors }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isDropdownOpen } = useSelector(state => state.notification);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        dispatch(setDropdownOpen(false));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dispatch]);

  const toggleDropdown = () => {
    dispatch(setDropdownOpen(!isDropdownOpen));
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = (event) => {
    event.stopPropagation(); // Ngăn event bubbling
    dispatch(markAllAsRead());
    // Không đóng dropdown, chỉ đánh dấu đã đọc
  };

  const handleRemoveNotification = (notificationId) => {
    dispatch(removeNotification(notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return '💬';
      case 'order':
        return '📦';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'normal':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return time.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative">
      {/* Bell Icon với Badge */}
      <div
        ref={buttonRef}
        onClick={toggleDropdown}
        className="appbar-icon-btn"
        style={{
          cursor: 'pointer',
          position: 'relative',
          filter: isDropdownOpen ? 'drop-shadow(0 0 8px rgba(59,130,246,0.4))' : 'none'
        }}
      >
        <i className="bx bx-bell" style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)' }}></i>

        {/* Badge số lượng thông báo */}
        {unreadCount > 0 && (
          <div
            className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-10 right-0 w-80 max-h-96 bg-white rounded-xl shadow-2xl z-[1000] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            animation: 'slideInDown 0.3s ease-out'
          }}
        >
          <style jsx>{`
            @keyframes slideInDown {
              0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div
            className="p-4 border-b"
            style={{
              background: `linear-gradient(135deg, ${themeColors.StartColorLinear} 0%, ${themeColors.EndColorLinear} 100%)`,
              color: 'white'
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Thông báo ({unreadCount})</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                >
                  Đánh dấu tất cả
                </button>
              )}
            </div>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <i className="bx bx-bell-off text-4xl mb-2"></i>
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: getPriorityColor(notification.priority) + '20' }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <i className="bx bx-x text-sm"></i>
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>

                        {!notification.isRead && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getPriorityColor(notification.priority) }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <button
                className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                style={{ color: themeColors.StartColorLinear }}
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 