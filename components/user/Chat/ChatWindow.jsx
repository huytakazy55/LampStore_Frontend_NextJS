"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Minimize2, MessageSquare } from 'lucide-react';
import ChatService from '@/services/ChatService';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage } from '@/redux/slices/chatSlice';

const ChatWindow = ({ onClose }) =>
{
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const hasSetupListenersRef = useRef(false);
  const currentChatRef = useRef(null);
  const messagesRef = useRef([]);

  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages[currentChat?.id] || []);

  // Keep refs in sync with state
  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const getCurrentUserId = () =>
  {
    try
    {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid || payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch (error)
    {
      return null;
    }
  };

  // ── On mount: initialize SignalR + auto-create/reuse chat ──
  useEffect(() =>
  {
    const init = async () =>
    {
      setLoading(true);
      try
      {
        // Initialize SignalR
        if (!hasSetupListenersRef.current)
        {
          const connected = await ChatService.initializeConnection();
          if (connected)
          {
            setupRealTimeListeners();
            hasSetupListenersRef.current = true;
          }
        }

        // Find or create a chat
        const response = await ChatService.getUserChats();
        let userChats = [];
        if (response && response.$values && Array.isArray(response.$values))
        {
          userChats = response.$values;
        } else if (Array.isArray(response))
        {
          userChats = response;
        }

        // Use the most recent open chat, or create a new one
        const openChat = userChats.find(c => c.status === 1 || c.status === 2) || userChats[0];

        if (openChat)
        {
          await enterChat(openChat);
        } else
        {
          // Auto-create a new chat
          const newChat = await ChatService.createChat('Chat hỗ trợ', 2);
          await enterChat(newChat);
        }
      } catch (error)
      {
        console.error('Chat init error:', error);
      } finally
      {
        setLoading(false);
      }
    };

    init();

    return () =>
    {
      if (currentChatRef.current)
      {
        ChatService.leaveChat(currentChatRef.current.id);
      }
      removeEventListeners();
      hasSetupListenersRef.current = false;
    };
  }, []);

  const enterChat = async (chat) =>
  {
    if (currentChatRef.current)
    {
      await ChatService.leaveChat(currentChatRef.current.id);
    }
    setCurrentChat(chat);
    await ChatService.joinChat(chat.id);
    await loadMessages(chat.id);
  };

  // ── SignalR Listeners ──
  const setupRealTimeListeners = () =>
  {
    if (hasSetupListenersRef.current) return;
    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('userTyping', handleUserTyping);
    window.addEventListener('messageRead', handleMessageRead);
  };

  const removeEventListeners = () =>
  {
    window.removeEventListener('newMessage', handleNewMessage);
    window.removeEventListener('userTyping', handleUserTyping);
    window.removeEventListener('messageRead', handleMessageRead);
  };

  const handleNewMessage = (event) =>
  {
    const newMsg = event.detail;
    const targetChatId = newMsg.chatId || newMsg.ChatId;
    const messageId = newMsg.messageId || newMsg.MessageId || newMsg.id;
    const content = newMsg.content || newMsg.Content;
    const senderId = newMsg.senderId || newMsg.SenderId;
    const timestamp = newMsg.timestamp || newMsg.Timestamp || newMsg.createdAt || new Date().toISOString();

    const messageKey = messageId || `${content}_${senderId}_${Math.floor(new Date(timestamp).getTime() / 1000)}`;
    if (processedMessagesRef.current.has(messageKey)) return;
    processedMessagesRef.current.add(messageKey);
    setTimeout(() => processedMessagesRef.current.delete(messageKey), 30000);

    let messageType = newMsg.type || newMsg.Type || 1;
    if (typeof messageType === 'string') messageType = 1;

    const messageToAdd = {
      id: messageId || `signalr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      createdAt: timestamp,
      senderId,
      senderName: newMsg.senderName || newMsg.SenderName,
      isRead: false,
      type: messageType,
      isFromSignalR: true
    };

    const activeChatId = currentChatRef.current?.id;
    const currentMessages = messagesRef.current;

    if (activeChatId && targetChatId === activeChatId)
    {
      const exists = currentMessages.some(msg =>
      {
        if (messageId && msg.id === messageId) return true;
        if (msg.content === messageToAdd.content &&
          msg.senderId === messageToAdd.senderId &&
          Math.abs(new Date(msg.createdAt) - new Date(messageToAdd.createdAt)) < 5000) return true;
        return false;
      });
      if (!exists) dispatch(addMessage({ chatId: activeChatId, message: messageToAdd }));
    } else if (targetChatId)
    {
      dispatch(addMessage({ chatId: targetChatId, message: messageToAdd }));
    }
  };

  const handleUserTyping = (event) =>
  {
    const typingData = event.detail;
    if (currentChatRef.current && typingData.ChatId === currentChatRef.current.id)
    {
      setTypingUsers(prev =>
      {
        if (typingData.IsTyping)
        {
          return [...prev.filter(u => u !== typingData.UserName), typingData.UserName];
        }
        return prev.filter(u => u !== typingData.UserName);
      });
    }
  };

  const handleMessageRead = (event) =>
  {
    const readData = event.detail;
    if (currentChatRef.current && readData.ChatId === currentChatRef.current.id)
    {
      loadMessages(currentChatRef.current.id);
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () =>
  {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (chatId) =>
  {
    try
    {
      const response = await ChatService.getChatMessages(chatId);
      let chatMessages = [];
      if (response && response.$values && Array.isArray(response.$values))
      {
        const objectMap = new Map();
        const collectObjects = (obj) =>
        {
          if (typeof obj === 'object' && obj !== null)
          {
            if (obj.$id) objectMap.set(obj.$id, obj);
            Object.values(obj).forEach(value =>
            {
              if (typeof value === 'object' && value !== null)
              {
                if (Array.isArray(value)) value.forEach(collectObjects);
                else collectObjects(value);
              }
            });
          }
        };
        collectObjects(response);
        chatMessages = response.$values.map(item =>
        {
          if (item.$ref) return objectMap.get(item.$ref) || item;
          return item;
        }).filter(Boolean);
      } else if (Array.isArray(response))
      {
        chatMessages = response;
      }
      dispatch(setMessages({ chatId, messages: chatMessages }));
    } catch (error)
    {
      dispatch(setMessages({ chatId, messages: [] }));
    }
  };

  const sendMessage = async () =>
  {
    if (!newMessage.trim() || !currentChat) return;
    try
    {
      await ChatService.sendMessage(currentChat.id, newMessage);
      setNewMessage('');
      await loadMessages(currentChat.id);
    } catch (error)
    {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) =>
  {
    if (e.key === 'Enter' && !e.shiftKey)
    {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ──
  const currentUserId = getCurrentUserId();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0',
        right: '30px',
        width: '22rem',
        height: '32rem',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 6px 18px 0 rgba(60,60,180,0.13), 0 0 0 2.5px rgba(37,99,235,0.08)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'chatWindowSlideIn 0.38s cubic-bezier(.4,2,.6,1)',
      }}
      onWheel={e => e.stopPropagation()}
      tabIndex={0}
    >
      <style>{`
        @keyframes chatWindowSlideIn {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-send-btn {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          border-radius: 12px;
          padding: 0.35rem 0.8rem;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          box-shadow: 0 1.5px 5px rgba(37,99,235,0.10);
          transition: all 0.18s cubic-bezier(.4,2,.6,1);
          cursor: pointer;
        }
        .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-send-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          box-shadow: 0 2.5px 8px rgba(124,58,237,0.13);
          transform: scale(1.06);
        }
        .chat-input {
          border-radius: 12px;
          border: 1.2px solid #e0e7ef;
          padding: 0.38rem 0.8rem;
          font-size: 0.97rem;
          outline: none;
          transition: border 0.2s;
        }
        .chat-input:focus {
          border: 1.2px solid #7c3aed;
          box-shadow: 0 0 0 1.5px #e0e7ef;
        }
        .chat-scrollable {
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        color: 'white',
        padding: '0.85rem 1.1rem',
        borderTopLeftRadius: '1rem',
        borderTopRightRadius: '1rem',
        boxShadow: '0 2px 8px 0 rgba(60,60,180,0.10)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '3.1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} />
          <div>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', letterSpacing: '0.3px', color: 'white' }}>
              Chat với CapyLumine
            </h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>
              {loading ? 'Đang kết nối...' : 'Trực tuyến'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.13)',
            border: 'none',
            borderRadius: '50%',
            width: '2.1rem', height: '2.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            transition: 'background 0.18s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
        >
          <Minimize2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 chat-scrollable" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#9ca3af' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: 12, fontSize: '0.9rem' }}>Đang tải...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#9ca3af', textAlign: 'center' }}>
            <MessageSquare size={40} style={{ color: '#d1d5db', marginBottom: 8 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Xin chào! 👋</p>
            <p style={{ fontSize: '0.82rem' }}>Hãy gửi tin nhắn, chúng tôi sẽ phản hồi sớm nhất!</p>
          </div>
        ) : (
          messages.map((message) =>
          {
            const isFromCurrentUser = message.senderId === currentUserId;
            return (
              <div key={message.id} style={{ display: 'flex', justifyContent: isFromCurrentUser ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', maxWidth: '80%' }}>
                  {!isFromCurrentUser && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>A</div>
                  )}
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: isFromCurrentUser ? '0.8rem 0.8rem 0.2rem 0.8rem' : '0.8rem 0.8rem 0.8rem 0.2rem',
                    background: isFromCurrentUser
                      ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                      : '#f3f4f6',
                    color: isFromCurrentUser ? 'white' : '#1f2937',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    boxShadow: isFromCurrentUser
                      ? '0 1px 4px rgba(37,99,235,0.15)'
                      : '0 1px 2px rgba(0,0,0,0.05)',
                  }}>
                    {!isFromCurrentUser && (
                      <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', marginBottom: 2, margin: 0 }}>
                        🛡️ Admin
                      </p>
                    )}
                    <p style={{ margin: 0 }}>{message.content || message.Content}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>
                        {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isFromCurrentUser && (
                        <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>
                          {message.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#f3f4f6', padding: '0.4rem 0.7rem', borderRadius: '0.8rem', fontSize: '0.8rem', color: '#6b7280' }}>
              {typingUsers.join(', ')} đang gõ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid #f3f4f6', background: '#fafbfc' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="chat-input"
            style={{ flex: 1, minWidth: 0 }}
            disabled={loading || !currentChat}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading || !currentChat}
            className="chat-send-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;