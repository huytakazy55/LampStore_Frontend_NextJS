"use client";

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Button, Table, Tag, Space, Modal, Input, message } from 'antd';
import { MessageOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import ChatService from '@/services/ChatService';
import AdminChatWindow from './AdminChatWindow';
import { useDispatch, useSelector } from 'react-redux';
import { setChats } from '@/redux/slices/chatSlice';
import { ThemeContext } from '@/contexts/ThemeContext';
import NotificationService from '@/services/NotificationService';
import './AdminChatDashboard.css';

const AdminChatDashboard = () =>
{
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { themeColors } = useContext(ThemeContext);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  const shownNotifKeysRef = React.useRef(new Set());

  const handleInAppNotification = useCallback((event) =>
  {
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
    setTimeout(() =>
    {
      setRealtimeNotifications(prev =>
        prev.map(n => n.id === entry.id ? { ...n, isNew: false } : n)
      );
    }, 30000);
  }, []);

  useEffect(() =>
  {
    loadDashboardData();
    window.addEventListener('inAppNotification', handleInAppNotification);
    return () => window.removeEventListener('inAppNotification', handleInAppNotification);
  }, [handleInAppNotification]);

  const clearNotification = (notificationId) =>
  {
    setRealtimeNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const loadDashboardData = async () =>
  {
    try
    {
      setLoading(true);
      const allChats = await ChatService.getAllChats();
      const chatList = allChats?.$values || allChats || [];
      dispatch(setChats(chatList));
    } catch (error)
    {
      console.error('Error loading chats:', error);
      dispatch(setChats([]));
    } finally
    {
      setLoading(false);
    }
  };

  const openChat = (chat) =>
  {
    setSelectedChat(chat);
    setIsChatWindowOpen(true);
  };

  const closeChatWindow = () =>
  {
    setIsChatWindowOpen(false);
    setSelectedChat(null);
    loadDashboardData();
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: ['user', 'userName'],
      key: 'userName',
      width: 160,
      render: (userName) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: 600,
          }}>
            {(userName || 'U').charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500 }}>{userName || 'Khách'}</span>
        </div>
      )
    },
    {
      title: 'Tin nhắn gần nhất',
      key: 'lastMessage',
      render: (_, record) =>
      {
        const lastMsg = record.lastMessage || record.messages?.[record.messages.length - 1];
        const content = lastMsg?.content || lastMsg?.Content || 'Chưa có tin nhắn';
        return (
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {content.length > 60 ? content.substring(0, 60) + '...' : content}
          </span>
        );
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'lastMessageAt',
      key: 'lastMessageAt',
      width: 140,
      align: 'center',
      sorter: (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
      defaultSortOrder: 'ascend',
      render: (date) =>
      {
        if (!date) return '-';
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        let text;
        if (diffMin < 1) text = 'Vừa xong';
        else if (diffMin < 60) text = `${diffMin} phút trước`;
        else if (diffHour < 24) text = `${diffHour} giờ trước`;
        else if (diffDay < 7) text = `${diffDay} ngày trước`;
        else text = d.toLocaleDateString('vi-VN');

        return <span style={{ color: diffMin < 5 ? '#10b981' : '#9ca3af', fontSize: '0.85rem' }}>{text}</span>;
      }
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => openChat(record)}
          style={{
            background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
            border: 'none',
            borderRadius: 8,
          }}
        >
          💬 Trả lời
        </Button>
      )
    }
  ];

  // Simple search filter
  const filteredChats = chats.filter(chat =>
  {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      chat.user?.userName?.toLowerCase().includes(search) ||
      chat.id?.toString().includes(search)
    );
  });

  const totalChats = chats.length;
  const activeChats = chats.filter(c => c.status === 1 || c.status === 2).length;

  return (
    <div style={{ padding: '24px' }}>
      {/* Title Bar */}
      <div className="admin-title-bar" style={{ background: '#f6f8fc', padding: '24px 24px 16px', marginBottom: 0 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
          Tin nhắn
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: '#888' }}>Trang chủ</span>
          <span style={{ margin: '0 8px', color: '#bbb' }}>/</span>
          <span style={{ color: themeColors.StartColorLinear }}>Tin nhắn</span>
        </div>
      </div>

      {/* Real-time Notifications */}
      {realtimeNotifications.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, maxWidth: 450, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {realtimeNotifications.filter(n => n.isNew).map(notification => (
            <div key={notification.id} className="realtime-notification notification-slide-in">
              <div className="notification-header">📨 TIN NHẮN MỚI - {notification.timestamp}</div>
              <div className="notification-user">👤 {notification.userName}</div>
              <div className="notification-content">"{notification.content.substring(0, 100)}{notification.content.length > 100 ? '...' : ''}"</div>
              <div className="notification-actions">
                <Button size="small" type="primary" onClick={() => { const chat = chats.find(c => c.id === notification.chatId); if (chat) { openChat(chat); clearNotification(notification.id); } }}>Xem chat</Button>
                <Button size="small" onClick={() => clearNotification(notification.id)}>Đóng</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, margin: '16px 24px' }}>
        <div style={{ flex: 1, background: 'white', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 20,
          }}>
            <MessageOutlined />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.1 }}>{totalChats}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>Tổng cuộc trò chuyện</div>
          </div>
        </div>
        <div style={{ flex: 1, background: 'white', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 20,
          }}>
            <UserOutlined />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.1 }}>{activeChats}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>Đang hoạt động</div>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="admin-table-card" style={{ margin: '0 24px' }}>
        <div className="admin-filter-bar" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên người dùng..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>Làm mới</Button>
        </div>
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
        styles={{ body: { padding: 0 } }}
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