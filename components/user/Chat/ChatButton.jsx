"use client";

import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import NotificationBadge from './NotificationBadge';
import ChatService from '@/services/ChatService';
import GuestProfileService from '@/services/GuestProfileService';
import NotificationService from '@/services/NotificationService';

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
      <div style={{ 
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}>
        <button
          onClick={toggleChat}
          onMouseOver={() => setIsHovered(true)}
          onMouseOut={() => setIsHovered(false)}
          style={{
            background: isChatOpen
              ? 'linear-gradient(135deg, #f43f5e 0%, #f59e42 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            borderRadius: '50%',
            width: '52px',
            height: '52px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: isHovered
              ? '0 6px 18px 0 rgba(60,60,180,0.22), 0 0 0 6px rgba(37,99,235,0.10)'
              : '0 2px 8px 0 rgba(60,60,180,0.14)',
            transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isHovered ? 'scale(1.10)' : 'scale(1)',
            outline: isHovered ? '2px solid #7c3aed' : 'none',
            position: 'relative',
          }}
          title="Chat hỗ trợ"
        >
          <NotificationBadge />
          {isChatOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          )}
          {/* Label xuất hiện khi hover */}
          <span style={{
            position: 'absolute',
            right: '62px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(37,99,235,0.95)',
            color: 'white',
            padding: isHovered ? '5px 12px' : '0px 0px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 500,
            opacity: isHovered ? 1 : 0,
            pointerEvents: 'none',
            transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
            boxShadow: isHovered ? '0 2px 8px rgba(37,99,235,0.18)' : 'none',
            whiteSpace: 'nowrap',
          }}>
            Hỗ trợ
          </span>
        </button>
      </div>

      {/* Real Chat Window với animation */}
      <div style={{
        pointerEvents: isChatOpen ? 'auto' : 'none',
        opacity: isChatOpen ? 1 : 0,
        transform: isChatOpen ? 'translateY(0px) scale(1)' : 'translateY(40px) scale(0.95)',
        transition: 'all 0.35s cubic-bezier(.4,2,.6,1)',
        position: 'fixed',
        bottom: '110px',
        right: '40px',
        zIndex: 999,
      }}>
        {isChatOpen && (
          <ChatWindow onClose={() => setIsChatOpen(false)} />
        )}
      </div>
    </>
  );
};

export default ChatButton; 
