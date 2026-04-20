"use client";

// Stub for ScrollContainerContext — not needed in Next.js (no smooth-scrollbar on main content)
import { createContext, useContext } from 'react';

const ScrollContainerContext = createContext(null);

export const useScrollContainer = () => useContext(ScrollContainerContext);
export default ScrollContainerContext;
