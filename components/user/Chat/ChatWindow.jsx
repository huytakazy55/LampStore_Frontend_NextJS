"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Minimize2, MessageSquare, Smile, Package, ChevronDown, ChevronUp, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import ChatService from '@/services/ChatService';
import OrderService from '@/services/OrderService';
import NotificationService from '@/services/NotificationService';
import GuestProfileService from '@/services/GuestProfileService';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages, addMessage } from '@/redux/slices/chatSlice';

const ChatWindow = ({ onClose }) =>
{
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const messagesEndRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const hasSetupListenersRef = useRef(false);
  const currentChatRef = useRef(null);
  const messagesRef = useRef([]);

  const dispatch = useDispatch();
  const activeChatId = currentChat?.id || currentChat?.Id;
  const messages = useSelector(state => state.chat.messages[activeChatId] || []);

  // Keep refs in sync with state
  useEffect(() => { currentChatRef.current = currentChat; }, [currentChat]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

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

  useEffect(() =>
  {
    const loadRecentOrders = async () =>
    {
      try
      {
        let response;
        if (isGuestMode())
        {
          const guestToken = GuestProfileService.getExistingGuestToken();
          if (!guestToken) return;
          response = await OrderService.getGuestOrders(guestToken);
        } else if (localStorage.getItem('token'))
        {
          response = await OrderService.getMyOrders();
        } else
        {
          return;
        }

        const list = response?.$values || response || [];
        const sortedOrders = Array.isArray(list)
          ? [...list].sort((a, b) => new Date(b.orderDate || b.OrderDate) - new Date(a.orderDate || a.OrderDate))
          : [];
        setOrders(sortedOrders);
      } catch (error)
      {
        console.error('Error loading recent orders for chat:', error);
      } finally
      {
        setOrdersLoading(false);
      }
    };

    loadRecentOrders();
  }, []);

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

          const openChat = guestChats[0];
          if (openChat)
          {
            await enterChat(openChat);
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

          const openChat = userChats[0];
          if (openChat)
          {
            await enterChat(openChat);
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
          const cid = currentChatRef.current.id || currentChatRef.current.Id;
          if (cid) loadMessages(cid);
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
    const newChatId = chat.id || chat.Id;
    if (currentChatRef.current && !isGuestMode())
    {
      const oldChatId = currentChatRef.current.id || currentChatRef.current.Id;
      if (oldChatId) await ChatService.leaveChat(oldChatId);
    }
    setCurrentChat(chat);
    if (!isGuestMode() && newChatId)
    {
      await ChatService.joinChat(newChatId);
    }
    if (newChatId) {
      await loadMessages(newChatId);
    }
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

    const activeChatId = (currentChatRef.current?.id || currentChatRef.current?.Id)?.toString().toLowerCase();
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
    const currentRefId = currentChatRef.current?.id || currentChatRef.current?.Id;
    if (currentRefId && typingData.ChatId === currentRefId)
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
    const currentRefId = currentChatRef.current?.id || currentChatRef.current?.Id;
    if (currentRefId && readData.ChatId === currentRefId)
    {
      loadMessages(currentRefId);
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

  const getOrderValue = (order, camelCase, pascalCase) => order?.[camelCase] ?? order?.[pascalCase];

  const getOrderDisplayCode = (order) =>
  {
    const orderCode = getOrderValue(order, 'orderCode', 'OrderCode');
    const id = getOrderValue(order, 'id', 'Id');
    return orderCode || id?.substring(0, 8).toUpperCase() || 'N/A';
  };

  const formatOrderPrice = (amount) => Number(amount || 0).toLocaleString('vi-VN') + 'đ';

  const buildOrderSupportMessage = (order, question) =>
  {
    const id = getOrderValue(order, 'id', 'Id');
    const orderCode = getOrderValue(order, 'orderCode', 'OrderCode');
    const status = getOrderValue(order, 'status', 'Status');
    const totalAmount = getOrderValue(order, 'totalAmount', 'TotalAmount');

    return [
      '📦 YÊU CẦU HỖ TRỢ ĐƠN HÀNG',
      `Mã đơn hàng: ${id || 'N/A'}`,
      orderCode ? `Mã giao dịch: ${orderCode}` : null,
      `Trạng thái: ${status || 'N/A'}`,
      `Tổng tiền: ${formatOrderPrice(totalAmount)}`,
      `Nội dung: ${question}`
    ].filter(Boolean).join('\n');
  };

  const sendMessage = async () =>
  {
    if (!newMessage.trim() || !currentChat) return;
    const chatId = currentChat.id || currentChat.Id;
    if (!chatId) return;
    const content = selectedOrder
      ? buildOrderSupportMessage(selectedOrder, newMessage.trim())
      : newMessage.trim();
    
    try
    {
      if (isGuestMode())
      {
        await ChatService.sendGuestMessage(chatId, content);
      } else
      {
        await ChatService.sendMessage(chatId, content);
      }
      setNewMessage('');
      setSelectedOrder(null);
      await loadMessages(chatId);
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
  const latestOrder = orders[0];

  return (
    <div
      className="flex min-h-0 h-full sm:h-[32rem] w-full sm:w-[22rem] flex-col overflow-hidden sm:rounded-2xl bg-white shadow-[0_6px_18px_rgba(60,60,180,0.13),0_0_0_2.5px_rgba(245,158,11,0.12)]"
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

      {/* Recent order context */}
      {!ordersLoading && latestOrder && (
        <div className="border-b border-gray-100 bg-primary-50/70 px-3 py-2">
          <button
            type="button"
            onClick={() => setShowOrders(prev => !prev)}
            className="flex w-full items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-primary-300"
          >
            <Package size={18} className="shrink-0 text-primary-600" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-gray-800">
                  Đơn gần nhất #{getOrderDisplayCode(latestOrder)}
                </span>
                <span className="shrink-0 text-xs font-semibold text-primary-600">
                  {formatOrderPrice(getOrderValue(latestOrder, 'totalAmount', 'TotalAmount'))}
                </span>
              </div>
              <p className="m-0 mt-0.5 text-[11px] text-gray-500">
                {getOrderValue(latestOrder, 'status', 'Status')} · Chọn đơn để hỏi hỗ trợ
              </p>
            </div>
            {showOrders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showOrders && (
            <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto">
              {orders.slice(0, 5).map(order =>
              {
                const orderId = getOrderValue(order, 'id', 'Id');
                const isSelected = getOrderValue(selectedOrder, 'id', 'Id') === orderId;
                return (
                  <button
                    key={orderId}
                    type="button"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrders(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? 'border-primary-400 bg-primary-100'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                  >
                    <span>
                      <strong>#{getOrderDisplayCode(order)}</strong>
                      <span className="ml-2 text-gray-500">{getOrderValue(order, 'status', 'Status')}</span>
                    </span>
                    <span className="font-semibold text-primary-600">
                      {formatOrderPrice(getOrderValue(order, 'totalAmount', 'TotalAmount'))}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex flex-1 min-h-0 flex-col gap-[0.6rem] overflow-y-auto p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
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
            const msgSenderId = message.senderId || message.SenderId;
            const msgId = message.id || message.Id;
            const msgContent = message.content || message.Content;
            const msgCreatedAt = message.createdAt || message.CreatedAt || new Date().toISOString();
            
            // If senderId is null/undefined and we're in guest mode, it's the guest's own message
            const isFromCurrentUser = msgSenderId === currentUserId || (isGuestMode() && !msgSenderId);
            return (
              <div key={msgId} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
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
                    <p className="m-0 whitespace-pre-wrap break-words">{msgContent}</p>
                    <div className="mt-[3px] flex items-center justify-end gap-1">
                      <span className="text-[0.68rem] opacity-70">
                        {new Date(msgCreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-[0.7rem] relative">
        {selectedOrder && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-2 text-xs text-gray-700">
            <Package size={15} className="shrink-0 text-primary-600" />
            <span className="min-w-0 flex-1 truncate">
              Đang hỏi về đơn <strong>#{getOrderDisplayCode(selectedOrder)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="rounded p-0.5 text-gray-400 hover:bg-white hover:text-gray-700"
              aria-label="Bỏ đính kèm đơn hàng"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {showEmojiPicker && (
          <div className="absolute bottom-[100%] right-4 mb-2 z-50" ref={emojiPickerRef}>
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              searchDisabled={true} 
              skinTonesDisabled={true}
              width={280}
              height={350}
            />
          </div>
        )}
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
            onClick={() => setShowEmojiPicker(prev => !prev)}
            disabled={loading || !currentChat}
            className="flex items-center justify-center rounded-xl bg-gray-200 px-3 py-1.5 text-[0.95rem] font-semibold text-gray-600 transition-all hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            title="Thêm biểu tượng cảm xúc"
          >
            <Smile size={18} />
          </button>
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
