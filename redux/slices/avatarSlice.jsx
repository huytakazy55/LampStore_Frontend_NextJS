"use client";

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  avatar: '',
};

const avatarSlice = createSlice({
  name: 'avatar',
  initialState,
  reducers: {
    setAvatar: (state, action) => {
      state.avatar = action.payload;
    },
  },
});

export const { setAvatar } = avatarSlice.actions;
export default avatarSlice.reducer;