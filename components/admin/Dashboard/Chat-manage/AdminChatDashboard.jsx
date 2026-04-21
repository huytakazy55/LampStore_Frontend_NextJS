"use client";

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button, Table, Modal, Input, Breadcrumb, message } from 'antd';
import { MessageOutlined, UserOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ChatService from '@/services/ChatService';
import AdminChatWindow from './AdminChatWindow';
import { useDispatch, useSelector } from 'react-redux';
import { setChats } from '@/redux/slices/chatSlice';
import { ThemeContext } from '@/contexts/ThemeContext';
import NotificationService from '@/services/NotificationService';
import './AdminChatDashboard.css';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #818cf8)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
  'linear-gradient(135deg, #3b82f6, #60a5fa)',
  'linear-gradient(135deg, #f43f5e, #fb7185)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
];

const getAvatarGradient = (name) => {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const AdminChatDashboard = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { themeColors } = useContext(ThemeContext);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  const shownNotifKeysRef = React.useRef(new Set());

  const handleInAppNotification = useCallback((event) => {
    const notification = event.detail;
    if (notification.type !== 'chat') return;

    const dedupKey = `${notification.chatId}_${(notification.message || '').substring(0, 40)}_${Math.floor(Date.now() / 5000)}`;
    if (shownNotifKeysRef.current.has(dedupKey)) return;
    shownNotifKeysRef.current.add(dedupKey);
    setTimeout(() => shownNotifKeysRef.current.delete(dedupKey), 5000);

    message.info({
      content: `📨 ${notification.senderName || 'Khách hàng'}: ${(notification.message || '').substring(0, 80)}`,
      duration: 5,
      style: { marginTop: '60px' }
    });

    const entry = {
      id: Date.now(),
      chatId: notification.chatId,
      userName: notification.senderName || 'Khách hàng',
      content: notification.message || '',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      isNew: true
    };
    setRealtimeNotifications(prev => [entry, ...prev.slice(0, 4)]);
    setTimeout(() => loadDashboardData(), 1000);
    setTimeout(() => {
      setRealtimeNotifications(prev =>
        prev.map(n => n.id === entry.id ? { ...n, isNew: false } : n)
      );
    }, 30000);
  }, []);

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('inAppNotification', handleInAppNotification);
    return () => window.removeEventListener('inAppNotification', handleInAppNotification);
  }, [handleInAppNotification]);

  const clearNotification = (notificationId) => {
    setRealtimeNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const allChats = await ChatService.getAllChats();
      const chatList = allChats?.$values || allChats || [];
      dispatch(setChats(chatList));
    } catch (error) {
      console.error('Error loading chats:', error);
      dispatch(setChats([]));
    } finally {
      setLoading(false);
    }
  };

  const openChat = (chat) => {
    setSelectedChat(chat);
    setIsChatWindowOpen(true);
  };

  const closeChatWindow = () => {
    setIsChatWindowOpen(false);
    setSelectedChat(null);
    loadDashboardData();
  };

  const formatRelativeTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return { text: 'Vừa xong', isRecent: true };
    if (diffMin < 60) return { text: `${diffMin} phút trước`, isRecent: diffMin < 5 };
    if (diffHour < 24) return { text: `${diffHour} giờ trước`, isRecent: false };
    if (diffDay < 7) return { text: `${diffDay} ngày trước`, isRecent: false };
    return { text: d.toLocaleDateString('vi-VN'), isRecent: false };
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'userName'],
      key: 'userName',
      width: 220,
      render: (userName, record) => {
        const name = userName || 'Khách';
        const isActive = record.status === 1 || record.status === 2;
        return (
          <div className="chat-user-cell">
            <div
              className="chat-user-avatar"
              style={{ background: getAvatarGradient(name) }}
            >
              {name.charAt(0).toUpperCase()}
              {isActive && <span className="online-dot" />}
            </div>
            <span className="chat-user-name">{name}</span>
          </div>
        );
      }
    },
    {
      title: 'Tin nhắn gần nhất',
      key: 'lastMessage',
      render: (_, record) => {
        const lastMsg = record.lastMessage || record.messages?.[record.messages.length - 1];
        const content = lastMsg?.content || lastMsg?.Content || '';
        const isEmpty = !content;
        return (
          <div className="chat-message-preview">
            <span className={`chat-message-text ${isEmpty ? 'empty' : ''}`}>
              {isEmpty ? 'Chưa có tin nhắn' : (content.length > 70 ? content.substring(0, 70) + '…' : content)}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'lastMessageAt',
      key: 'lastMessageAt',
      width: 150,
      align: 'center',
      sorter: (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
      defaultSortOrder: 'ascend',
      render: (date) => {
        const time = formatRelativeTime(date);
        if (!time) return <span style={{ color: '#cbd5e1' }}>—</span>;
        return (
          <span className={`chat-time-badge ${time.isRecent ? 'recent' : 'normal'}`}>
            {time.isRecent && '● '}{time.text}
          </span>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <button
          className="chat-reply-btn"
          onClick={() => openChat(record)}
          style={{
            background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
          }}
        >
          💬 Trả lời
        </button>
      )
    }
  ];

  const filteredChats = chats.filter(chat => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      chat.user?.userName?.toLowerCase().includes(search) ||
      chat.id?.toString().includes(search)
    );
  });

  const totalChats = chats.length;
  const activeChats = chats.filter(c => c.status === 1 || c.status === 2).length;
  const resolvedChats = chats.filter(c => c.status === 3).length;
  const pendingChats = chats.filter(c => c.status === 1).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* Realtime Notifications */}
      {realtimeNotifications.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {realtimeNotifications.filter(n => n.isNew).map(notification => (
            <div key={notification.id} className="realtime-notification notification-slide-in">
              <div className="notification-header">📨 TIN NHẮN MỚI — {notification.timestamp}</div>
              <div className="notification-user">👤 {notification.userName}</div>
              <div className="notification-content">"{notification.content.substring(0, 100)}{notification.content.length > 100 ? '…' : ''}"</div>
              <div className="notification-actions">
                <Button size="small" type="primary" onClick={() => { const chat = chats.find(c => c.id === notification.chatId); if (chat) { openChat(chat); clearNotification(notification.id); } }}>Xem chat</Button>
                <Button size="small" onClick={() => clearNotification(notification.id)}>Đóng</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-table-card">
        {/* Title Bar */}
        <div className="admin-title-bar" style={{ padding: '24px 24px 16px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
            Tin nhắn
          </div>
          <Breadcrumb
            items={[{ title: 'Trang chủ' }, { title: 'Tin nhắn' }]}
            style={{ marginTop: 8 }}
          />
        </div>

        {/* Stats Cards */}
        <div className="chat-stats-grid">
          <div className="chat-stat-card">
            <div className="chat-stat-icon" style={{ background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})` }}>
              <MessageOutlined />
            </div>
            <div>
              <div className="chat-stat-value">{totalChats}</div>
              <div className="chat-stat-label">Tổng cuộc trò chuyện</div>
            </div>
          </div>
          <div className="chat-stat-card">
            <div className="chat-stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <UserOutlined />
            </div>
            <div>
              <div className="chat-stat-value">{activeChats}</div>
              <div className="chat-stat-label">Đang hoạt động</div>
            </div>
          </div>
          <div className="chat-stat-card">
            <div className="chat-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <ClockCircleOutlined />
            </div>
            <div>
              <div className="chat-stat-value">{pendingChats}</div>
              <div className="chat-stat-label">Chờ phản hồi</div>
            </div>
          </div>
          <div className="chat-stat-card">
            <div className="chat-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <CheckCircleOutlined />
            </div>
            <div>
              <div className="chat-stat-value">{resolvedChats}</div>
              <div className="chat-stat-label">Đã giải quyết</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="admin-filter-bar" style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên người dùng..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 320 }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>
            Làm mới
          </Button>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          <Table
            columns={columns}
            dataSource={filteredChats}
            rowKey="id"
            loading={loading}
            className="custom-table"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} cuộc trò chuyện`
            }}
          />
        </div>
      </div>

      {/* Chat Window Modal */}
      <Modal
        title={`💬 Chat với ${selectedChat?.user?.userName || 'Khách hàng'}`}
        open={isChatWindowOpen}
        onCancel={closeChatWindow}
        footer={null}
        width={800}
        centered
        destroyOnHidden
        styles={{ body: { padding: 0, height: 520 } }}
      >
        {selectedChat && (
          <AdminChatWindow
            chat={selectedChat}
            onClose={closeChatWindow}
            onUpdate={loadDashboardData}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminChatDashboard;