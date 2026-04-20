"use client";

import React from 'react';
import { useSelector } from 'react-redux';

const NotificationBadge = () => {
  const { unreadCount } = useSelector(state => state.notification);

  if (unreadCount === 0) return null;

  return (
    <div 
      className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse"
      style={{
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
        fontSize: '10px',
        zIndex: 10
      }}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
};

export default NotificationBadge; 