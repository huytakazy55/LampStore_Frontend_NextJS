"use client";

import { createSlice } from '@reduxjs/toolkit';

const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const roleFromStorage = tokenFromStorage ? (() => {
  try {
    return JSON.parse(atob(tokenFromStorage.split('.')[1])).role;
  } catch {
    return null;
  }
})() : null;

const initialState = {
  token: tokenFromStorage || null,
  role: roleFromStorage || null,
  isAuthenticated: !!tokenFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer; 