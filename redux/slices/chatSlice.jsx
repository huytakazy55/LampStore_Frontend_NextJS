"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [], // danh sách các cuộc trò chuyện
  messages: {}, // { [chatId]: [message, ...] }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats(state, action) {
      state.chats = action.payload;
    },
    setMessages(state, action) {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },
    addMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
    },
    clearMessages(state, action) {
      const { chatId } = action.payload;
      state.messages[chatId] = [];
    },
    removeOptimisticMessage(state, action) {
      const { chatId, content, senderId, createdAt } = action.payload;
      if (!state.messages[chatId]) return;
      state.messages[chatId] = state.messages[chatId].filter(msg =>
        !(
          msg.isOptimistic &&
          msg.content === content &&
          msg.senderId === senderId &&
          Math.abs(new Date(msg.createdAt) - new Date(createdAt)) < 30000
        )
      );
    },
  },
});

export const { setChats, setMessages, addMessage, clearMessages, removeOptimisticMessage } = chatSlice.actions;
export default chatSlice.reducer; 