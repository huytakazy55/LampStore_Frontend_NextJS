"use client";

import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import NotificationBadge from './NotificationBadge';
import ChatService from '@/services/ChatService';
import GuestProfileService from '@/services/GuestProfileService';
import NotificationService from '@/services/NotificationService';

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const seenMessageKeysRef = useRef(new Set());
  const initializedPollRef = useRef(false);
  const isChatOpenRef = useRef(false);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid || payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch {
      return null;
    }
  };

  const normalizeList = (data) => data?.$values || data || [];

  const getLastMessage = (chat) => {
    const messages = normalizeList(chat.messages || chat.Messages);
    return chat.lastMessage || chat.LastMessage || messages[0] || messages[messages.length - 1] || null;
  };

  useEffect(() => {
    const pollLatestMessage = async () => {
      if (isChatOpenRef.current) return;

      const isLoggedIn = !!localStorage.getItem('token');
      const guestToken = GuestProfileService.getExistingGuestToken();
      if (!isLoggedIn && !guestToken) return;

      try {
        const chatsData = isLoggedIn
          ? await ChatService.getUserChats()
          : await ChatService.getGuestChats();
        const chats = normalizeList(chatsData);
        const currentUserId = getCurrentUserId();
        const guestSenderId = guestToken ? `guest_${guestToken.substring(0, 8)}` : null;

        chats.forEach((chat) => {
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
          if (isOwnMessage) {
            seenMessageKeysRef.current.add(key);
            return;
          }

          if (!initializedPollRef.current) {
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
      } catch {
        // Silent: realtime/poll notification should not disturb shopping flow.
      }
    };

    pollLatestMessage();
    const intervalId = setInterval(pollLatestMessage, 6000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleChat = () => {
    const nextOpen = !isChatOpen;
    setIsChatOpen(nextOpen);
    if (nextOpen) {
      NotificationService.markChatNotificationsAsRead();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
        <button
          onClick={toggleChat}
          className={`group relative flex h-12 w-12 items-center justify-center rounded-full border-none text-white shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl hover:ring-4 hover:ring-primary-400/20 active:scale-95 cursor-pointer ${
            isChatOpen
              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-primary-500/25'
              : 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-primary-500/25'
          }`}
          title="Chat hỗ trợ"
        >
          <NotificationBadge />
          {isChatOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          )}
          {/* Label xuất hiện khi hover */}
          <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-primary-600 px-3 py-1 text-[13px] font-medium text-white opacity-0 shadow-lg shadow-primary-600/20 transition-all duration-300 group-hover:opacity-100">
            Hỗ trợ
          </span>
        </button>
      </div>

      {/* Real Chat Window với animation */}
      <div className={`fixed bottom-[88px] right-24 z-[999] transition-all duration-300 ease-out ${
        isChatOpen
          ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto'
          : 'translate-y-10 scale-95 opacity-0 pointer-events-none'
      }`}>
        {isChatOpen && (
          <ChatWindow onClose={() => setIsChatOpen(false)} />
        )}
      </div>
    </>
  );
};

export default ChatButton; 
