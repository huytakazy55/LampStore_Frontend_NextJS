"use client";

import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import NotificationBadge from './NotificationBadge';
import ChatService from '@/services/ChatService';
import GuestProfileService from '@/services/GuestProfileService';
import NotificationService from '@/services/NotificationService';
import Image from 'next/image';
import zaloLogo from '@/assets/images/zalo-logo-removebg.png';
import zaloQrCode from '@/assets/images/zalo-add-friend.jpg';

const CONTACT_PHONE = '0969608810';
const ZALO_URL = 'https://zalo.me/0969608810';

const ChatButton = () =>
{
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isZaloPopupOpen, setIsZaloPopupOpen] = useState(false);
  const seenMessageKeysRef = useRef(new Set());
  const initializedPollRef = useRef(false);
  const isChatOpenRef = useRef(false);

  useEffect(() =>
  {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const getCurrentUserId = () =>
  {
    try
    {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid || payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch
    {
      return null;
    }
  };

  const normalizeList = (data) => data?.$values || data || [];

  const getLastMessage = (chat) =>
  {
    const messages = normalizeList(chat.messages || chat.Messages);
    return chat.lastMessage || chat.LastMessage || messages[0] || messages[messages.length - 1] || null;
  };

  useEffect(() =>
  {
    const pollLatestMessage = async () =>
    {
      if (isChatOpenRef.current) return;

      const isLoggedIn = !!localStorage.getItem('token');
      const guestToken = GuestProfileService.getExistingGuestToken();
      if (!isLoggedIn && !guestToken) return;

      try
      {
        const chatsData = isLoggedIn
          ? await ChatService.getUserChats()
          : await ChatService.getGuestChats();
        const chats = normalizeList(chatsData);
        const currentUserId = getCurrentUserId();
        const guestSenderId = guestToken ? `guest_${guestToken.substring(0, 8)}` : null;

        chats.forEach((chat) =>
        {
          const lastMessage = getLastMessage(chat);
          const content = lastMessage?.content || lastMessage?.Content || '';
          if (!content) return;

          const chatId = chat.id || chat.Id;
          const messageId = lastMessage.id || lastMessage.Id || lastMessage.messageId || lastMessage.MessageId;
          const senderId = lastMessage.senderId || lastMessage.SenderId || '';
          const timestamp = lastMessage.createdAt || lastMessage.CreatedAt || chat.lastMessageAt || chat.LastMessageAt || '';
          const key = messageId || `${chatId}_${senderId}_${content}_${timestamp}`;

          const isOwnMessage = isLoggedIn
            ? senderId && senderId === currentUserId
            : !senderId || senderId === guestSenderId;
          if (isOwnMessage)
          {
            seenMessageKeysRef.current.add(key);
            return;
          }

          if (!initializedPollRef.current)
          {
            seenMessageKeysRef.current.add(key);
            return;
          }

          if (seenMessageKeysRef.current.has(key)) return;
          seenMessageKeysRef.current.add(key);

          NotificationService.handleCustomerChatNotification({
            ChatId: chatId,
            SenderId: senderId,
            SenderName: lastMessage.senderName || lastMessage.SenderName || 'CapyLumine',
            Content: content,
            Timestamp: timestamp,
            ChatSubject: chat.subject || chat.Subject,
          });
        });

        initializedPollRef.current = true;
      } catch
      {
        // Silent: realtime/poll notification should not disturb shopping flow.
      }
    };

    pollLatestMessage();
    const intervalId = setInterval(pollLatestMessage, 6000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleChat = () =>
  {
    const nextOpen = !isChatOpen;
    setIsChatOpen(nextOpen);
    if (nextOpen)
    {
      NotificationService.markChatNotificationsAsRead();
    }
  };

  return (
    <>
      {/* Zalo Button */}
      <button
        onClick={() => setIsZaloPopupOpen(true)}
        className="group fixed right-6 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_rgba(0,136,255,0.3)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-[0_12px_25px_rgba(0,136,255,0.5)] active:scale-95 border-none cursor-pointer p-0"
        style={{ bottom: '88px' }}
        aria-label="Liên hệ Zalo"
        title="Liên hệ Zalo"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
          <Image src={zaloLogo} alt="Zalo Logo" className="bx-tada transition-transform duration-300 group-hover:scale-110 w-[90%] h-[90%] object-contain" style={{ animationDuration: '0.8s' }} />
        </div>

        <div className="absolute inset-0 rounded-full bg-[#0088FF] animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
        <span className="pointer-events-none absolute right-[120%] top-1/2 -translate-y-1/2 translate-x-4 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 text-[14px] font-bold text-[#0088FF] opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-[#0088FF] border border-white/20">
          Mua hàng qua Zalo
        </span>
      </button>

      {/* Phone Button */}
      <a
        href={`tel:${CONTACT_PHONE}`}
        className="group fixed right-6 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4B4B] to-[#E60000] text-white shadow-[0_8px_20px_rgba(255,75,75,0.3)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-[0_12px_25px_rgba(255,75,75,0.5)] active:scale-95"
        style={{ bottom: '24px' }}
        aria-label="Gọi điện thoại"
        title="Gọi điện thoại"
      >
        <i className="bx bx-phone-call text-2xl bx-tada transition-transform duration-300 group-hover:scale-110" style={{ animationDuration: '0.8s' }}></i>

        <div className="absolute inset-0 rounded-full bg-[#FF4B4B] animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '3s', animationDelay: '1.5s' }}></div>
        <span className="pointer-events-none absolute right-[120%] top-1/2 -translate-y-1/2 translate-x-4 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 text-[14px] font-bold text-[#FF4B4B] opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-[#FF4B4B] border border-white/20">
          Gọi ngay
        </span>
      </a>

      {/* Chat Button */}
      <div className="fixed right-6 z-[1000] flex flex-col items-end" style={{ bottom: '152px' }}>
        <button
          onClick={toggleChat}
          className={`group relative flex h-12 w-12 items-center justify-center rounded-full border-none text-white shadow-[0_8px_20px_rgba(107,33,168,0.3)] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-[0_12px_25px_rgba(107,33,168,0.5)] active:scale-95 cursor-pointer ${isChatOpen
            ? 'bg-primary-600 rotate-180'
            : 'bg-primary-600'
            }`}
          title="Chat hỗ trợ"
        >
          <NotificationBadge />
          {isChatOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="-rotate-180 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          )}
          <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '3s', animationDelay: '1.5s' }}></div>
          {/* Label xuất hiện khi hover */}
          <span className="pointer-events-none absolute right-[120%] top-1/2 -translate-y-1/2 translate-x-4 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 text-[14px] font-bold text-primary-600 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-primary-400 border border-white/20">
            Hỗ trợ
          </span>
        </button>
      </div>

      {/* Chat Backdrop */}
      <div
        className={`fixed inset-0 z-[9991] bg-black/40 backdrop-blur-sm transition-all duration-300 ${isChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsChatOpen(false)}
      ></div>

      {/* Real Chat Window với animation */}
      <div
        className={`fixed left-1/2 sm:left-auto sm:right-24 z-[9992] transition-all duration-300 ease-out ${isChatOpen
          ? '-translate-x-1/2 sm:translate-x-0 translate-y-0 scale-100 opacity-100 pointer-events-auto'
          : '-translate-x-1/2 sm:translate-x-0 translate-y-10 scale-95 opacity-0 pointer-events-none'
          }`}
        style={{ bottom: '152px' }}
      >
        {isChatOpen && (
          <ChatWindow onClose={() => setIsChatOpen(false)} />
        )}
      </div>

      {/* Zalo QR Popup */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${isZaloPopupOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsZaloPopupOpen(false)}
      >
        <div
          className={`relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl transition-all duration-500 max-w-sm w-full mx-4 ${isZaloPopupOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}`}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => setIsZaloPopupOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-transparent border-none cursor-pointer">
            <i className="bx bx-x text-2xl"></i>
          </button>

          <div className="text-center mb-5 mt-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Kết bạn Zalo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quét mã QR để kết bạn với chúng tôi</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl mb-6 flex justify-center border border-gray-100 dark:border-gray-600">
            <Image src={zaloQrCode} alt="Zalo QR Code" className="rounded-lg object-contain w-full h-auto max-h-[320px] shadow-sm" />
          </div>

          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#0088FF] hover:bg-[#0066CC] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]"
          >
            Mở ứng dụng Zalo
          </a>
        </div>
      </div>
    </>
  );
};

export default ChatButton;
