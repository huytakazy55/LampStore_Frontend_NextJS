"use client";

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AdminPageHeader from '../shared/AdminPageHeader';
import StatCard from '../shared/StatCard';
import { Button, Table, Modal, Input, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import ChatService from '@/services/ChatService';
import NotificationService from '@/services/NotificationService';
import AdminChatWindow from './AdminChatWindow';
import { useDispatch, useSelector } from 'react-redux';
import { setChats } from '@/redux/slices/chatSlice';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useSearchParams } from '@/lib/router-compat';
import { unwrapValues } from '@/lib/odata';

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
  const notifications = useSelector(state => state.notification.notifications);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { themeColors } = useContext(ThemeContext);
  const targetChatId = searchParams.get('chatId');

  const unreadChatIds = useMemo(() => new Set(
    notifications
      .filter(notification => notification.type === 'chat' && !notification.isRead && notification.chatId)
      .map(notification => notification.chatId.toString().toLowerCase())
  ), [notifications]);

  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid
        || payload.sub
        || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || '';
    } catch {
      return '';
    }
  }, []);

  const getLastMessage = (chat) => {
    const messages = unwrapValues(chat.messages || chat.Messages);
    return chat.lastMessage || chat.LastMessage || messages[0] || messages[messages.length - 1] || null;
  };

  const getMessageContent = (message) => message?.content || message?.Content || '';

  const isUnreadChat = (chat) => {
    const chatId = (chat.id || chat.Id || '').toString().toLowerCase();
    if (chatId && unreadChatIds.has(chatId)) return true;

    const lastMsg = getLastMessage(chat);
    const senderId = lastMsg?.senderId || lastMsg?.SenderId || '';
    const isRead = lastMsg?.isRead ?? lastMsg?.IsRead;
    return Boolean(getMessageContent(lastMsg) && senderId && senderId !== currentUserId && isRead === false);
  };

  const handleInAppNotification = useCallback((event) => {
    const notification = event.detail;
    if (notification.type !== 'chat') return;
    setTimeout(() => loadDashboardData(), 1000);
  }, []);

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('inAppNotification', handleInAppNotification);
    return () => window.removeEventListener('inAppNotification', handleInAppNotification);
  }, [handleInAppNotification]);

  useEffect(() => {
    if (!targetChatId || loading) return;

    const normalizedTargetId = targetChatId.toString().toLowerCase();
    const matchedChat = chats.find(chat =>
      (chat.id || chat.Id || '').toString().toLowerCase() === normalizedTargetId
    );

    if (!matchedChat) return;

    const selectedChatId = (selectedChat?.id || selectedChat?.Id || '').toString().toLowerCase();
    if (isChatWindowOpen && selectedChatId === normalizedTargetId) return;

    setSelectedChat(matchedChat);
    setIsChatWindowOpen(true);
    NotificationService.markChatNotificationsAsRead(matchedChat.id || matchedChat.Id);
  }, [chats, isChatWindowOpen, loading, selectedChat, targetChatId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const allChats = await ChatService.getAllChats();
      const chatList = unwrapValues(allChats);
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
    NotificationService.markChatNotificationsAsRead(chat.id || chat.Id);
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
        // Fix: Use GuestName from the backend if it exists for guest chats
        const name = userName || record.guestName || record.GuestName || 'Khách';
        const isActive = record.status === 1 || record.status === 2;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold text-white"
              style={{ background: getAvatarGradient(name) }}
            >
              {name.charAt(0).toUpperCase()}
              {isActive && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />}
            </div>
            <span className="chat-user-name max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium text-slate-800">{name}</span>
          </div>
        );
      }
    },
    {
      title: 'Tin nhắn gần nhất',
      key: 'lastMessage',
      render: (_, record) => {
        const lastMsg = getLastMessage(record);
        const content = getMessageContent(lastMsg);
        const isEmpty = !content;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`chat-message-text line-clamp-1 text-[13px] leading-[1.4] ${isEmpty ? 'italic text-slate-300' : 'text-slate-500'}`}>
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
          <span className={`inline-block rounded-full px-2.5 py-[3px] text-[12.5px] font-medium ${time.isRecent ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
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
        <Tooltip title="Trả lời khách hàng">
          <button
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-none px-4 py-1.5 text-[13px] font-medium text-white transition-all duration-200 cursor-pointer hover:-translate-y-px hover:shadow-[0_3px_10px_rgba(99,102,241,0.3)] hover:brightness-[1.08] active:translate-y-0"
            onClick={(event) => {
              event.stopPropagation();
              openChat(record);
            }}
            style={{
              background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
            }}
          >
            💬 Trả lời
          </button>
        </Tooltip>
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
    <div style={{ padding: '16px' }}>
      <AdminPageHeader
        title="Tin nhắn"
        breadcrumbItems={[
          { title: 'Trang chủ' },
          { title: 'Tin nhắn' }
        ]}
      />
      <div className="admin-table-card">

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-6 py-4 mb-2">
          {[
            { icon: <i className="bx bx-message-rounded-dots"></i>, color: 'blue', value: totalChats, label: "Tổng cuộc trò chuyện", percent: "Tất cả" },
            { icon: <i className="bx bx-user-circle"></i>, color: 'green', value: activeChats, label: "Đang hoạt động", percent: "Active" },
            { icon: <i className="bx bx-time-five"></i>, color: 'yellow', value: pendingChats, label: "Chờ phản hồi", percent: "Wait" },
            { icon: <i className="bx bx-check-circle"></i>, color: 'red', value: resolvedChats, label: "Đã giải quyết", percent: "Done" },
          ].map((item, idx) => (
            <StatCard key={idx} valueClassName="text-xl" {...item} />
          ))}
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
        <div
          className="admin-table-wrapper chat-theme-table"
          style={{
            '--chat-theme-start': themeColors.StartColorLinear,
            '--chat-theme-end': themeColors.EndColorLinear,
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredChats}
            rowKey={(record) => record.id || record.Id}
            loading={loading}
            className="custom-table"
            rowClassName={(record) => isUnreadChat(record) ? 'chat-row-unread' : ''}
            onRow={(record) => ({
              onClick: () => openChat(record),
              className: 'chat-clickable-row',
            })}
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
        title={`💬 Chat với ${selectedChat?.user?.userName || selectedChat?.guestName || selectedChat?.GuestName || 'Khách hàng'}`}
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
