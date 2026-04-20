"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [], // danh sách thông báo
  unreadCount: 0, // số thông báo chưa đọc
  isDropdownOpen: false, // trạng thái dropdown thông báo
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification(state, action) {
      const newNotification = {
        id: action.payload.id || Date.now() + Math.random(),
        type: action.payload.type || 'chat', // 'chat', 'order', 'system'
        title: action.payload.title,
        message: action.payload.message,
        chatId: action.payload.chatId,
        userId: action.payload.userId,
        userRole: action.payload.userRole, // 'admin' hoặc 'user'
        isRead: false,
        createdAt: action.payload.createdAt || new Date().toISOString(),
        avatar: action.payload.avatar,
        priority: action.payload.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
      };
      
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
      
      // Giới hạn số thông báo (giữ 50 thông báo gần nhất)
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markAsRead(state, action) {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead(state) {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    
    removeNotification(state, action) {
      const notificationId = action.payload;
      const index = state.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    clearAllNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    setDropdownOpen(state, action) {
      state.isDropdownOpen = action.payload;
    },
    
    // Khởi tạo thông báo từ storage
    initNotifications(state, action) {
      state.notifications = action.payload.notifications || [];
      state.unreadCount = action.payload.unreadCount || 0;
    }
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearAllNotifications, 
  setDropdownOpen,
  initNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer; 