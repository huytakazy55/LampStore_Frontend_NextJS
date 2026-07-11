"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Minimize2, MessageSquare } from 'lucide-react';
import ChatService from '@/services/ChatService';
import NotificationService from '@/services/NotificationService';
import GuestProfileService from '@/services/GuestProfileService';
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

  const isGuestMode = () => !localStorage.getItem('token') && !!GuestProfileService.getExistingGuestToken();

  const getCurrentUserId = () =>
  {
    try
    {
      const token = localStorage.getItem('token');
      if (token)
      {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.nameid || payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      }
      // Guest mode: return guest identifier
      const guestToken = GuestProfileService.getExistingGuestToken();
      if (guestToken) return `guest_${guestToken.substring(0, 8)}`;
      return null;
    } catch (error)
    {
      return null;
    }
  };

  const isInitializingRef = useRef(false);

  // ── On mount: initialize chat (SignalR for logged-in, API-only for guest) ──
  useEffect(() =>
  {
    if (isInitializingRef.current) return;
    
    const init = async () =>
    {
      isInitializingRef.current = true;
      setLoading(true);
      try
      {
        if (isGuestMode())
        {
          // Guest mode: skip SignalR, use API only
          const response = await ChatService.getGuestChats();
          let guestChats = [];
          if (response && response.$values && Array.isArray(response.$values))
          {
            guestChats = response.$values;
          } else if (Array.isArray(response))
          {
            guestChats = response;
          }

          const openChat = guestChats.find(c => c.status === 1 || c.status === 2) || guestChats[0];
          if (openChat)
          {
            await enterChat(openChat);
          } else
          {
            const guestCode = GuestProfileService.getGuestCode() || 'Khách vãng lai';
            const newChat = await ChatService.createGuestChat('Chat hỗ trợ', guestCode);
            await enterChat(newChat);
          }
        } else
        {
          // Logged-in mode: use SignalR
          if (!hasSetupListenersRef.current)
          {
            const connected = await ChatService.initializeConnection();
            if (connected)
            {
              setupRealTimeListeners();
              hasSetupListenersRef.current = true;
            }
          }

          const response = await ChatService.getUserChats();
          let userChats = [];
          if (response && response.$values && Array.isArray(response.$values))
          {
            userChats = response.$values;
          } else if (Array.isArray(response))
          {
            userChats = response;
          }

          const openChat = userChats.find(c => c.status === 1 || c.status === 2) || userChats[0];
          if (openChat)
          {
            await enterChat(openChat);
          } else
          {
            const newChat = await ChatService.createChat('Chat hỗ trợ', 2);
            await enterChat(newChat);
          }
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

    // Guest mode: poll for new messages every 5s
    let pollInterval;
    if (isGuestMode())
    {
      pollInterval = setInterval(() =>
      {
        if (currentChatRef.current)
        {
          loadMessages(currentChatRef.current.id);
        }
      }, 5000);
    }

    return () =>
    {
      if (currentChatRef.current && !isGuestMode())
      {
        // NOTE: Removed leaveChat to fix Strict Mode race condition
        // ChatService.leaveChat(currentChatRef.current.id);
      }
      removeEventListeners();
      hasSetupListenersRef.current = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const enterChat = async (chat) =>
  {
    if (currentChatRef.current && !isGuestMode())
    {
      await ChatService.leaveChat(currentChatRef.current.id);
    }
    setCurrentChat(chat);
    if (!isGuestMode())
    {
      await ChatService.joinChat(chat.id);
    }
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

    const activeChatId = currentChatRef.current?.id?.toString().toLowerCase();
    const currentMessages = messagesRef.current;
    const normalizedTargetChatId = targetChatId?.toString().toLowerCase();

    if (activeChatId && normalizedTargetChatId === activeChatId)
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
      if (senderId !== currentUserId)
      {
        NotificationService.markChatNotificationsAsRead(activeChatId);
      }
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
      const response = isGuestMode()
        ? await ChatService.getGuestChatMessages(chatId)
        : await ChatService.getChatMessages(chatId);
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
      if (isGuestMode())
      {
        await ChatService.sendGuestMessage(currentChat.id, newMessage);
      } else
      {
        await ChatService.sendMessage(currentChat.id, newMessage);
      }
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
      className="flex h-[32rem] w-[calc(100vw-2rem)] sm:w-[22rem] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_18px_rgba(60,60,180,0.13),0_0_0_2.5px_rgba(245,158,11,0.12)]"
      onWheel={e => e.stopPropagation()}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex min-h-[3.1rem] items-center justify-between bg-primary-600 px-[1.1rem] py-[0.85rem] text-white shadow-[0_2px_8px_rgba(245,158,11,0.18)]">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <div>
            <h3 className="m-0 text-[1.05rem] font-semibold tracking-[0.3px] text-white">
              Chat với CapyLumine
            </h3>
            <p className="m-0 text-xs opacity-80">
              {loading ? 'Đang kết nối...' : 'Trực tuyến'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-[2.1rem] w-[2.1rem] cursor-pointer items-center justify-center rounded-full border-none bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <Minimize2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-[0.6rem] overflow-y-auto overscroll-contain p-4">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary-500" />
            <p className="mt-3 text-sm">Đang tải...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-gray-400">
            <MessageSquare size={40} className="mb-2 text-gray-300" />
            <p className="text-[0.95rem] font-medium">Xin chào! 👋</p>
            <p className="text-[0.82rem]">Hãy gửi tin nhắn, chúng tôi sẽ phản hồi sớm nhất!</p>
          </div>
        ) : (
          messages.map((message) =>
          {
            // If senderId is null/undefined and we're in guest mode, it's the guest's own message
            const isFromCurrentUser = message.senderId === currentUserId || (isGuestMode() && !message.senderId);
            return (
              <div key={message.id} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className="flex max-w-[80%] items-end gap-[0.4rem]">
                  {!isFromCurrentUser && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-[0.7rem] font-bold text-white">A</div>
                  )}
                  <div className={`px-3 py-2 text-[0.9rem] leading-[1.4] shadow-sm ${
                    isFromCurrentUser
                      ? 'rounded-[0.8rem_0.8rem_0.2rem_0.8rem] bg-primary-600 text-white shadow-primary-500/15'
                      : 'rounded-[0.8rem_0.8rem_0.8rem_0.2rem] bg-gray-100 text-gray-800'
                  }`}>
                    {!isFromCurrentUser && (
                      <p className="m-0 mb-0.5 text-[0.72rem] font-semibold text-emerald-600">
                        🛡️ Admin
                      </p>
                    )}
                    <p className="m-0">{message.content || message.Content}</p>
                    <div className="mt-[3px] flex items-center justify-end gap-1">
                      <span className="text-[0.68rem] opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isFromCurrentUser && (
                        <span className="text-[0.68rem] opacity-70">
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
          <div className="flex justify-start">
            <div className="rounded-[0.8rem] bg-gray-100 px-[0.7rem] py-[0.4rem] text-[0.8rem] text-gray-500">
              {typingUsers.join(', ')} đang gõ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-[0.7rem]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-[0.97rem] outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            disabled={loading || !currentChat}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading || !currentChat}
            className="flex items-center justify-center rounded-xl bg-primary-600 px-3 py-1.5 text-[0.95rem] font-semibold text-white shadow-md shadow-primary-500/10 transition-all hover:scale-105 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
