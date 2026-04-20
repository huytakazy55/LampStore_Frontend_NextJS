"use client";

// Re-export everything from the SSR-safe axiosConfig in lib/
export { default, refreshAccessToken, isTokenValid, getTokenTimeRemaining } from '@/lib/axiosConfig';