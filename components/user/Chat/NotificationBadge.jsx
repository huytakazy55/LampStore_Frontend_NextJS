"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const NotificationBadge = () =>
{
  const { unreadCount } = useSelector(state => state.notification);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || unreadCount === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 z-10 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 px-1 text-[10px] font-bold text-white shadow-md shadow-secondary-500/30">
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
};

export default NotificationBadge; 
