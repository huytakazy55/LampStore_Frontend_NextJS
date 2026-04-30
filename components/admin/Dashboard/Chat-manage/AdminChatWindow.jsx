"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Input, Select, Space, Divider, Tag, Avatar, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import ChatService from '@/services/ChatService';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage, removeOptimisticMessage } from '@/redux/slices/chatSlice';

const { TextArea } = Input;
const { Option } = Select;

const AdminChatWindow = ({ chat, onClose, onUpdate }) => {
  const [newMessage, setNewMessage] = useState('');
  const [chatStatus, setChatStatus] = useState(chat?.status || 1);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages[chat?.id] || []);

  useEffect(() => {
    if (chat?.id) {
      loadMessages();
      initializeSignalR();
    }

    // Cleanup function
    return () => {
      // NOTE: Removed ChatService.leaveChat(chat.id) from here to fix a React Strict Mode 
      // race condition where leaveChat would fire after the second joinChat.
      // event listeners được quản lý bởi useEffect riêng (useCallback handlers)
    };
  }, [chat?.id]);

  const initializeSignalR = async () => {
    try {
      const connected = await ChatService.initializeConnection();
      if (connected && chat?.id) {
        await ChatService.joinChat(chat.id);
      }
    } catch (error) {
      console.error('❌ Admin SignalR initialization error:', error);
    }
  };

  // Bug fix: dùng useCallback để handler có reference ổn định
  // tránh removeEventListener không gỡ được do stale reference
  const handleNewMessage = useCallback((event) => {
    const newMsg = event.detail;
    const targetChatId = (newMsg.ChatId || newMsg.chatId)?.toString().toLowerCase();
    const currentChatId = chat?.id?.toString().toLowerCase();
    
    if (chat && targetChatId === currentChatId) {
      const messageId = newMsg.MessageId || newMsg.messageId || newMsg.id;
      const content = newMsg.content || newMsg.Content;
      const senderId = newMsg.senderId || newMsg.SenderId;
      const timestamp = newMsg.createdAt || newMsg.Timestamp || newMsg.timestamp || new Date().toISOString();

      // Tạo key unique từ content + senderId + timestamp
      const messageKey = `${content}_${senderId}_${Math.floor(new Date(timestamp).getTime() / 1000)}`;

      // Kiểm tra cache để tránh xử lý message trùng
      if (processedMessagesRef.current.has(messageKey)) {
        return;
      }

      // Thêm vào cache và tự động xóa sau 10 giây
      processedMessagesRef.current.add(messageKey);
      setTimeout(() => {
        processedMessagesRef.current.delete(messageKey);
      }, 10000);

      const messageToAdd = {
        id: messageId || `signalr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        createdAt: timestamp,
        senderId,
        isRead: false,
        isFromSignalR: true
      };

      // Kiểm tra xem đã có message thật này chưa
      const existsReal = messagesRef.current.some(msg =>
        msg.id === messageToAdd.id && !msg.isOptimistic
      );

      if (existsReal) {
        return; // Đã có message thật, không làm gì
      }

      // Tìm optimistic message tương ứng để thay thế
      const optimisticIndex = messagesRef.current.findIndex(msg =>
        msg.isOptimistic &&
        msg.content === messageToAdd.content &&
        msg.senderId === messageToAdd.senderId &&
        Math.abs(new Date(msg.createdAt) - new Date(messageToAdd.createdAt)) < 30000
      );

      if (optimisticIndex !== -1) {
        // Thay thế optimistic message bằng real message
        const updatedMessages = [...messagesRef.current];
        updatedMessages[optimisticIndex] = messageToAdd;
        dispatch(setMessages({ chatId: chat.id, messages: updatedMessages }));
      } else {
        // Không có optimistic message, thêm message mới
        dispatch(addMessage({ chatId: chat.id, message: messageToAdd }));
      }
    }
  }, [chat, dispatch]);

  // eslint-disable-next-line no-unused-vars
  const handleUserTyping = useCallback((event) => {
    const typingData = event.detail;
    // You can add typing indicator UI here if needed
  }, []);

  // Bug fix: ref để handler luôn có messages mới nhất (tránh stale closure)
  const messagesRef = useRef([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Setup/remove event listeners khi handlers thay đổi
  useEffect(() => {
    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('userTyping', handleUserTyping);
    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('userTyping', handleUserTyping);
    };
  }, [handleNewMessage, handleUserTyping]);

  // Helper function to get current admin user ID
  const getCurrentAdminUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.nameid || payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

      return userId;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto scroll to bottom when chat window is opened (chat thay đổi)
  useEffect(() => {
    if (chat?.id) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
    // eslint-disable-next-line
  }, [chat?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);

      const response = await ChatService.getChatMessages(chat.id);

      // Handle .NET serialization format with references
      let chatMessages = [];

      if (response?.$values && Array.isArray(response.$values)) {
        // Create a map to store objects by their $id
        const objectMap = new Map();

        // First pass: collect all objects with $id
        const collectObjects = (obj) => {
          if (typeof obj === 'object' && obj !== null) {
            if (obj.$id) {
              objectMap.set(obj.$id, obj);
            }
            // Recursively collect from nested objects/arrays
            Object.values(obj).forEach(value => {
              if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                  value.forEach(collectObjects);
                } else {
                  collectObjects(value);
                }
              }
            });
          }
        };

        collectObjects(response);

        // Second pass: resolve references in $values array
        chatMessages = response.$values.map(item => {
          if (item.$ref) {
            const resolvedObject = objectMap.get(item.$ref);
            return resolvedObject || item;
          }
          return item;
        }).filter(Boolean);
      } else if (Array.isArray(response)) {
        chatMessages = response;
      } else {
        chatMessages = [];
      }

      dispatch(setMessages({ chatId: chat.id, messages: chatMessages }));
    } catch (error) {
      dispatch(setMessages({ chatId: chat.id, messages: [] }));
      message.error('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const currentUserId = getCurrentAdminUserId();
      const messageContent = newMessage;
      setNewMessage('');

      // Bug fix: dispatch optimistic message vào Redux ngay lập tức để UI cập nhật tức thì
      const optimisticMessage = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: messageContent,
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
        isRead: false,
        isOptimistic: true
      };
      dispatch(addMessage({ chatId: chat.id, message: optimisticMessage }));

      // Send via API
      await ChatService.sendMessage(chat.id, messageContent, 1);

      message.success('Đã gửi tin nhắn');
    } catch (error) {
      message.error('Không thể gửi tin nhắn');

      // Reload messages to remove optimistic message on error
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const updateChatStatus = async (newStatus) => {
    try {
      await ChatService.updateChatStatus(chat.id, newStatus);
      setChatStatus(newStatus);
      message.success('Đã cập nhật trạng thái');

      // Update parent component
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'green';
      case 2: return 'orange';
      case 3: return 'blue';
      case 4: return 'gray';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'gray';
      case 2: return 'blue';
      case 3: return 'orange';
      case 4: return 'red';
      default: return 'gray';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{
        flex: 1,
        minHeight: 0,
        padding: '16px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        backgroundColor: '#fafafa',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải tin nhắn...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Chưa có tin nhắn nào
          </div>
        ) : (
          messages.map((msg) => {
            // Get current admin user ID
            const currentUserId = getCurrentAdminUserId();

            // Bug fix: chỉ so sánh senderId với chat.user.id để xác định admin/user
            // Nếu senderId khớp với user của chat HOẶC senderId là null HOẶC bắt đầu bằng 'guest_' -> là customer
            // Ngược lại (bao gồm optimistic message của admin) -> là admin
            const isFromUser = msg.senderId === chat?.user?.id || !msg.senderId || (typeof msg.senderId === 'string' && msg.senderId.startsWith('guest_'));
            const isFromAdmin = !isFromUser;

            return (
              <div
                key={String(msg.id).startsWith('temp_') ? `${msg.id}_${msg.createdAt}` : msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isFromAdmin ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '70%' }}>
                  {/* User Avatar (left side) */}
                  {isFromUser && (
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{ marginRight: '8px', backgroundColor: '#1890ff' }}
                    />
                  )}

                  <div>
                    {/* Sender Label */}
                    {isFromAdmin && (
                      <div style={{
                        fontSize: '11px',
                        color: '#52c41a',
                        marginBottom: '4px',
                        textAlign: 'right',
                        fontWeight: 'bold'
                      }}>
                        🛡️ Admin (You)
                      </div>
                    )}
                    {isFromUser && (
                      <div style={{
                        fontSize: '11px',
                        color: '#1890ff',
                        marginBottom: '4px',
                        fontWeight: 'bold'
                      }}>
                        👤 Customer
                      </div>
                    )}

                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: isFromAdmin ? '#52c41a' : '#fff',
                        color: isFromAdmin ? '#fff' : '#000',
                        border: isFromAdmin ? 'none' : '1px solid #d9d9d9'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '14px' }}>{msg.content || msg.Content}</p>
                    </div>
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '11px',
                      color: '#999',
                      textAlign: isFromAdmin ? 'right' : 'left'
                    }}>
                      {new Date(msg.createdAt).toLocaleString('vi-VN')}
                      {msg.isRead && isFromAdmin && ' ✓✓'}
                    </p>
                  </div>

                  {/* Admin Avatar (right side) */}
                  {isFromAdmin && (
                    <Avatar
                      size="small"
                      style={{ marginLeft: '8px', backgroundColor: '#52c41a' }}
                    >
                      A
                    </Avatar>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>


      {/* Message Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập phản hồi cho khách hàng..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={sending}
            disabled={!newMessage.trim()}
          >
            Gửi
          </Button>
        </div>

        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          💡 Mẹo: Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </div>
      </div>
    </div>
  );
};

export default AdminChatWindow; 