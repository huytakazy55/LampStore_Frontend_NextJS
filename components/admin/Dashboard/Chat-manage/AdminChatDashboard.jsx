"use client";

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Tag, Space, Modal, Select, Input, DatePicker, message } from 'antd';
import { MessageOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ChatService from '@/services/ChatService';
import AdminChatWindow from './AdminChatWindow';
import { useDispatch, useSelector } from 'react-redux';
import { setChats } from '@/redux/slices/chatSlice';
import { ThemeContext } from '@/contexts/ThemeContext';
import NotificationService from '@/services/NotificationService';
import './AdminChatDashboard.css';

const AdminChatDashboard = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedChatForAssign, setSelectedChatForAssign] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const { themeColors } = useContext(ThemeContext);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  // Dedup tại UI layer: lưu key của các notification đã hiện
  const shownNotifKeysRef = React.useRef(new Set());

  const handleInAppNotification = useCallback((event) => {
    const notification = event.detail;
    if (notification.type !== 'chat') return;

    // Dedup tại UI: chatId + nội dung (5 giây) tránh hiện 2 popup
    const dedupKey = `${notification.chatId}_${(notification.message || '').substring(0, 40)}_${Math.floor(Date.now() / 5000)}`;
    if (shownNotifKeysRef.current.has(dedupKey)) return;
    shownNotifKeysRef.current.add(dedupKey);
    setTimeout(() => shownNotifKeysRef.current.delete(dedupKey), 5000);

    // Hiển thị Ant Design toast
    message.info({
      content: `📨 ${notification.title}: ${(notification.message || '').substring(0, 80)}`,
      duration: 5,
      style: { marginTop: '60px' }
    });

    // Thêm vào danh sách realtime notifications của dashboard
    const entry = {
      id: Date.now(),
      chatId: notification.chatId,
      userName: notification.senderName || 'Khách hàng',
      content: notification.message || '',
      subject: notification.subject || '',
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
    // NotificationService.setup() đã được gọi từ App.js, ở đây chỉ đăng ký listener dashboard
    window.addEventListener('inAppNotification', handleInAppNotification);
    return () => window.removeEventListener('inAppNotification', handleInAppNotification);
  }, [handleInAppNotification]);


  const clearNotification = (notificationId) => {
    setRealtimeNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const forceReconnectSignalR = async () => {
    try {
      message.loading('Đang kết nối lại SignalR...', 2);
      const result = await NotificationService.forceReconnect();
      if (result) {
        message.success('Kết nối lại thành công!');
      } else {
        message.error('Kết nối lại thất bại');
      }
    } catch (error) {
      message.error('Lỗi khi kết nối lại SignalR');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [allChats, stats] = await Promise.all([
        ChatService.getAllChats(),
        ChatService.getChatStatistics()
      ]);
      
      // Handle .NET serialization format
      const chatList = allChats?.$values || allChats || [];
      dispatch(setChats(chatList));
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    // Refresh data when closing chat
    loadDashboardData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'green'; // Open
      case 2: return 'orange'; // InProgress  
      case 3: return 'blue'; // Resolved
      case 4: return 'gray'; // Closed
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Mở';
      case 2: return 'Đang xử lý';
      case 3: return 'Đã giải quyết';
      case 4: return 'Đã đóng';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'gray'; // Low
      case 2: return 'blue'; // Normal
      case 3: return 'orange'; // High
      case 4: return 'red'; // Urgent
      default: return 'gray';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Thấp';
      case 2: return 'Bình thường';
      case 3: return 'Cao';
      case 4: return 'Khẩn cấp';
      default: return 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id) => id.slice(0, 8) + '...'
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'subject',
      key: 'subject',
      width: 200,
      align: 'center',
    },
    {
      title: 'Người dùng',
      dataIndex: ['user', 'userName'],
      key: 'userName',
      width: 120,
      align: 'center',
      render: (userName) => userName || 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      align: 'center',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      )
    },
    {
      title: 'Admin phụ trách',
      dataIndex: ['assignedAdmin', 'userName'],
      key: 'assignedAdmin',
      width: 120,
      align: 'center',
      render: (adminName) => adminName || 'Chưa giao'
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      align: 'center',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => openChat(record)}
          >
            Xem
          </Button>
        </Space>
      )
    }
  ];

  // Lọc dữ liệu
  const filteredChats = chats.filter(chat => {
    // Tìm kiếm
    const searchMatch = searchText
      ? (
          chat.user?.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
          chat.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
          chat.id?.toString().includes(searchText)
        )
      : true;
    // Lọc trạng thái
    const statusMatch = statusFilter ? chat.status === statusFilter : true;
    // Lọc ưu tiên
    const priorityMatch = priorityFilter ? chat.priority === priorityFilter : true;
    // Lọc ngày (không dùng moment)
    const dateMatch = dateRange.length === 2 && dateRange[0] && dateRange[1]
      ? (
          new Date(chat.createdAt).getTime() >= new Date(dateRange[0]).setHours(0,0,0,0) &&
          new Date(chat.createdAt).getTime() <= new Date(dateRange[1]).setHours(23,59,59,999)
        )
      : true;
    return searchMatch && statusMatch && priorityMatch && dateMatch;
  });

  // Tính toán số lượng nếu statistics không có dữ liệu
  const totalChats = statistics?.total ?? chats.length;
  const openChats = statistics?.open ?? chats.filter(c => c.status === 1).length;
  const inProgressChats = statistics?.inProgress ?? chats.filter(c => c.status === 2).length;
  const resolvedChats = statistics?.resolved ?? chats.filter(c => c.status === 3).length;

  // Icon style giống dashboard
  const chatIcons = {
    total: (
      <div className="bg-blue-100 p-1 rounded-full">
        <MessageOutlined className="text-blue-400 text-base" />
      </div>
    ),
    open: (
      <div className="bg-green-100 p-1 rounded-full">
        <ClockCircleOutlined className="text-green-500 text-base" />
      </div>
    ),
    inProgress: (
      <div className="bg-yellow-100 p-1 rounded-full">
        <UserOutlined className="text-yellow-500 text-base" />
      </div>
    ),
    resolved: (
      <div className="bg-purple-100 p-1 rounded-full">
        <CheckCircleOutlined className="text-purple-500 text-base" />
      </div>
    ),
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Title Bar */}
      <div
        className="admin-title-bar"
        style={{
          background: '#f6f8fc',
          padding: '24px 24px 16px',
          marginBottom: 0
        }}
      >
        <div style={{fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear}}>
          Quản lý Chat hỗ trợ
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: '#888' }}>Trang chủ</span>
          <span style={{ margin: '0 8px', color: '#bbb' }}>/</span>
          <span style={{ color: themeColors.StartColorLinear }}>Quản lý Chat hỗ trợ</span>
        </div>
      </div>

      {/* Real-time Notifications Panel */}
      {realtimeNotifications.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          top: 100, 
          right: 24, 
          zIndex: 1000,
          maxWidth: 350,
          maxHeight: 400,
          overflowY: 'auto'
        }}>
                     {realtimeNotifications.filter(n => n.isNew).map(notification => (
             <div 
               key={notification.id}
               className="realtime-notification notification-slide-in"
             >
               <div className="notification-header">
                 📨 TIN NHẮN MỚI - {notification.timestamp}
               </div>
               <div className="notification-user">
                 👤 {notification.userName}
               </div>
               <div className="notification-subject">
                 💬 Chủ đề: {notification.subject}
               </div>
               <div className="notification-content">
                 "{notification.content.substring(0, 100)}{notification.content.length > 100 ? '...' : ''}"
               </div>
               <div className="notification-actions">
                 <Button 
                   size="small" 
                   type="primary"
                   onClick={() => {
                     const chat = chats.find(c => c.id === notification.chatId);
                     if (chat) {
                       openChat(chat);
                       clearNotification(notification.id);
                     }
                   }}
                 >
                   Xem chat
                 </Button>
                 <Button 
                   size="small" 
                   onClick={() => clearNotification(notification.id)}
                 >
                   Đóng
                 </Button>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* Statistics Cards */}
      <Row gutter={24} style={{ margin: '24px' }}>
        <Col flex={1}>
          <div
            className="bg-white rounded-xl shadow-lg p-2 flex items-center min-w-[100px] border-l-8 border-blue-400 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)' }}
          >
            {chatIcons.total}
            <div className="ml-2">
              <div className="text-base font-medium text-gray-800">{totalChats}</div>
              <div className="text-gray-500 text-xs">Tổng chats</div>
            </div>
          </div>
        </Col>
        <Col flex={1}>
          <div
            className="bg-white rounded-xl shadow-lg p-2 flex items-center min-w-[100px] border-l-8 border-green-400 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)' }}
          >
            {chatIcons.open}
            <div className="ml-2">
              <div className="text-base font-medium text-gray-800">{openChats}</div>
              <div className="text-gray-500 text-xs">Đang mở</div>
            </div>
          </div>
        </Col>
        <Col flex={1}>
          <div
            className="bg-white rounded-xl shadow-lg p-2 flex items-center min-w-[100px] border-l-8 border-yellow-400 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)' }}
          >
            {chatIcons.inProgress}
            <div className="ml-2">
              <div className="text-base font-medium text-gray-800">{inProgressChats}</div>
              <div className="text-gray-500 text-xs">Đang xử lý</div>
            </div>
          </div>
        </Col>
        <Col flex={1}>
          <div
            className="bg-white rounded-xl shadow-lg p-2 flex items-center min-w-[100px] border-l-8 border-purple-400 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)' }}
          >
            {chatIcons.resolved}
            <div className="ml-2">
              <div className="text-base font-medium text-gray-800">{resolvedChats}</div>
              <div className="text-gray-500 text-xs">Đã giải quyết</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Chat List Table */}
      <div className="admin-table-card" style={{ margin: '0 24px' }}>
        {/* Filter bar */}
        <div className="admin-filter-bar" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên, tiêu đề, ID..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 120 }}
          >
            <Select.Option value={1}>Mở</Select.Option>
            <Select.Option value={2}>Đang xử lý</Select.Option>
            <Select.Option value={3}>Đã giải quyết</Select.Option>
            <Select.Option value={4}>Đã đóng</Select.Option>
          </Select>
          <Select
            placeholder="Ưu tiên"
            value={priorityFilter}
            onChange={setPriorityFilter}
            allowClear
            style={{ width: 120 }}
          >
            <Select.Option value={1}>Thấp</Select.Option>
            <Select.Option value={2}>Bình thường</Select.Option>
            <Select.Option value={3}>Cao</Select.Option>
            <Select.Option value={4}>Khẩn cấp</Select.Option>
          </Select>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 240 }}
            format="DD/MM/YYYY"
          />
          <Button onClick={() => { setSearchText(''); setStatusFilter(null); setPriorityFilter(null); setDateRange([]); }}>Xóa lọc</Button>
        </div>
        <div className="admin-table-wrapper">
          <Table
            columns={columns}
            dataSource={filteredChats}
            rowKey="id"
            loading={loading}
            scroll={{ x: 800 }}
            className="custom-table"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chats`
            }}
          />
        </div>
      </div>

      {/* Admin Chat Window Modal */}
      <Modal
        title="Chat Hỗ trợ"
        open={isChatWindowOpen}
        onCancel={closeChatWindow}
        footer={null}
        width={800}
        style={{ top: 20 }}
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