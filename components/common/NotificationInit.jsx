"use client";

import { useEffect } from 'react';
import NotificationService from '@/services/NotificationService';

/**
 * NotificationInit — Client component nhỏ chỉ để init notifications.
 * Tách ra khỏi page.jsx để page có thể là Server Component.
 */
export default function NotificationInit()
{
    useEffect(() =>
    {
        const initializeNotifications = async () =>
        {
            try
            {
                await NotificationService.setupSignalRNotifications();
                NotificationService.requestNotificationPermission();
                NotificationService.cleanOldNotifications();
                console.log('📢 HomePage: Notification system initialized for user');
            } catch (error)
            {
                console.error('❌ HomePage: Failed to initialize notifications:', error);
            }
        };

        initializeNotifications();
    }, []);

    return null;
}
