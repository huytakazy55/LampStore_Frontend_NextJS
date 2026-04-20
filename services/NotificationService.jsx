"use client";

import store from '@/redux/store';
import { addNotification, initNotifications, markAsRead } from '@/redux/slices/notificationSlice';
import AudioService from './AudioService';
import ChatService from './ChatService';

/**
 * NotificationService — quản lý thông báo real-time (viết lại đơn giản)
 *
 * Nguyên tắc:
 *  1. setup() gọi 1 lần sau login, an toàn nếu gọi nhiều lần
 *  2. Khi admin nhận AdminChatNotification từ SignalR → hiện 1 popup + sound
 *  3. Dedup đơn giản: Set các key (chatId + 5 giây), tự expire
 *  4. Không có _fetchMissedNotifications (nguồn gốc của duplicate)
 */
class NotificationService
{
  constructor()
  {
    this.storageKey = 'chat_notifications';
    this._isSetup = false;        // đã setup listeners chưa
    this._isConnecting = false;   // đang kết nối chưa
    this._dedupKeys = new Set();  // dedup: chatId_bucket → expire sau 5s

    // load thông báo cũ từ localStorage vào Redux (only in browser)
    if (typeof window !== 'undefined') this._loadFromStorage();
  }

  // ─── Load/save localStorage ───────────────────────────────────────────────
  _loadFromStorage()
  {
    if (typeof window === 'undefined') return;
    try
    {
      const saved = localStorage.getItem(this.storageKey);
      if (saved)
      {
        store.dispatch(initNotifications(JSON.parse(saved)));
      }
    } catch (e)
    {
      console.warn('NotificationService: load error', e);
    }
  }

  _saveToStorage()
  {
    try
    {
      const { notifications, unreadCount } = store.getState().notification;
      localStorage.setItem(this.storageKey, JSON.stringify({ notifications, unreadCount }));
    } catch (e)
    {
      console.warn('NotificationService: save error', e);
    }
  }

  // ─── Lấy thông tin user từ JWT ────────────────────────────────────────────
  _getUser()
  {
    try
    {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const p = JSON.parse(atob(token.split('.')[1]));
      const role = p.role
        || p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || '';
      const id = p.nameid || p.sub
        || p['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || '';
      return { id, role, name: p.unique_name || p.name || '' };
    } catch
    {
      return null;
    }
  }

  _isAdmin(user)
  {
    return user?.role === 'Administrator' || user?.role === 'Admin';
  }

  // ─── Dedup ────────────────────────────────────────────────────────────────
  // Trả về true nếu đây là duplicate (đã thấy key này trong 5 giây gần đây)
  _isDuplicate(chatId, content)
  {
    const bucket = Math.floor(Date.now() / 5000); // window 5 giây
    const key = `${chatId}_${(content || '').substring(0, 40)}_${bucket}`;
    if (this._dedupKeys.has(key)) return true;
    this._dedupKeys.add(key);
    setTimeout(() => this._dedupKeys.delete(key), 5000);
    return false;
  }

  // ─── Setup (gọi 1 lần sau login) ─────────────────────────────────────────
  async setup()
  {
    if (this._isSetup || this._isConnecting) return;
    this._isConnecting = true;

    try
    {
      const user = this._getUser();
      if (!user) return;

      // Kết nối SignalR
      const connected = await ChatService.initializeConnection();
      if (!connected)
      {
        console.warn('NotificationService: SignalR không kết nối được');
        return;
      }

      // Nếu là admin thì join group "admins"
      if (this._isAdmin(user))
      {
        await ChatService.joinAdminsGroupIfAdmin();
      }

      // Đăng ký listener 1 lần duy nhất
      this._adminHandler = (e) => this._handleAdminNotification(e.detail);
      window.addEventListener('adminChatNotification', this._adminHandler);

      this._isSetup = true;
      console.log('✅ NotificationService: setup xong');
    } catch (e)
    {
      console.error('NotificationService: setup lỗi', e);
    } finally
    {
      this._isConnecting = false;
    }
  }

  // ─── Xử lý AdminChatNotification từ SignalR ───────────────────────────────
  _handleAdminNotification(data)
  {
    const user = this._getUser();
    if (!user || !this._isAdmin(user)) return;

    const chatId = data.ChatId || data.chatId || '';
    const content = data.Content || data.content || '';
    const senderName = data.UserName || data.SenderName || 'Khách hàng';
    const subject = data.ChatSubject || data.chatSubject || '';
    const senderId = data.SenderId || data.senderId || '';

    // Dedup: bỏ qua nếu đã xử lý notification này trong 5 giây
    if (this._isDuplicate(chatId, content))
    {
      console.log('🔇 Notification deduplicated, skipping');
      return;
    }

    const notification = {
      type: 'chat',
      title: 'Tin nhắn mới',
      message: `${senderName}: ${content.substring(0, 100)}`,
      chatId,
      senderId,
      senderName,
      subject,
      priority: this._mapPriority(data.Priority || data.priority),
      createdAt: new Date().toISOString(),
    };

    // 1. Lưu vào Redux (badge số lượng + dropdown)
    store.dispatch(addNotification(notification));
    this._saveToStorage();

    // 2. Phát âm thanh
    try { AudioService.playNotificationSound('chat_received'); } catch { }

    // 3. Hiện popup trong dashboard
    window.dispatchEvent(new CustomEvent('inAppNotification', { detail: notification }));

    // 4. Browser notification (nếu được phép)
    if ('Notification' in window && Notification.permission === 'granted')
    {
      try
      {
        const n = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: `chat-${chatId}`,
        });
        setTimeout(() => n.close(), 5000);
      } catch { }
    }

    console.log(`📢 Notification hiện cho admin: [${senderName}] ${content.substring(0, 50)}`);
  }

  // ─── Reset (khi logout) ───────────────────────────────────────────────────
  reset()
  {
    if (this._adminHandler)
    {
      window.removeEventListener('adminChatNotification', this._adminHandler);
      this._adminHandler = null;
    }
    this._isSetup = false;
    this._isConnecting = false;
    this._dedupKeys.clear();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  _mapPriority(p)
  {
    const map = { 1: 'low', 2: 'normal', 3: 'high', 4: 'urgent' };
    return typeof p === 'number' ? (map[p] || 'normal') : (p || 'normal');
  }

  markChatNotificationsAsRead(chatId)
  {
    const { notifications } = store.getState().notification;
    notifications
      .filter(n => n.type === 'chat' && (!chatId || n.chatId === chatId) && !n.isRead)
      .forEach(n => store.dispatch(markAsRead(n.id)));
    this._saveToStorage();
  }

  // ─── Yêu cầu quyền browser notification ──────────────────────────────────
  async requestPermission()
  {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  }

  // ─── Compatibility aliases (để không phá code cũ còn gọi) ────────────────
  async setupSignalRNotifications() { return this.setup(); }
  async requestNotificationPermission() { return this.requestPermission(); }
  cleanOldNotifications() { /* no-op, kept for compatibility */ }
  resetSetupState() { this.reset(); }
  async forceReconnect()
  {
    this.reset();
    await ChatService.disconnect();
    return this.setup();
  }
  async forceReconnectAndSetup() { return this.forceReconnect(); }
  isSignalRConnected() { return ChatService.isConnected; }
  debugConnection()
  {
    return {
      user: this._getUser(),
      chatServiceConnected: ChatService.isConnected,
      connectionState: ChatService.connection?.state,
      isSetup: this._isSetup,
    };
  }
  setAudioEnabled(v) { AudioService.setEnabled(v); }
  setAudioVolume(v) { AudioService.setVolume(v); }
  getAudioSettings() { return AudioService.getSettings(); }

  // Test notification
  addTestNotification()
  {
    this._handleAdminNotification({
      ChatId: 'test-' + Date.now(),
      Content: 'Đây là thông báo test',
      SenderName: 'Test User',
      ChatSubject: 'Test',
      Priority: 2,
    });
  }
}

// Singleton (lazy on client)
let _nsInstance = null;
const notificationService = typeof window !== 'undefined'
  ? (() => { _nsInstance = _nsInstance || new NotificationService(); return _nsInstance; })()
  : { setup: async () => { }, reset: () => { }, setupSignalRNotifications: async () => { }, requestNotificationPermission: async () => false, requestPermission: async () => false, cleanOldNotifications: () => { }, resetSetupState: () => { }, markChatNotificationsAsRead: () => { }, forceReconnect: async () => { }, isSignalRConnected: () => false, debugConnection: () => ({}), setAudioEnabled: () => { }, setAudioVolume: () => { }, getAudioSettings: () => ({}) };

if (typeof window !== 'undefined')
{
  window.NotificationService = notificationService;
  window.testNotification = () => notificationService.addTestNotification();
}

export default notificationService;