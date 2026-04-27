"use client";

/**
 * GuestProfileService - Manages a virtual guest profile using a UUID stored in localStorage.
 * This "guest token" acts as a virtual identity for unauthenticated users,
 * allowing them to place orders. When they sign up or log in,
 * the token is used to claim those orders, then cleared.
 */

const GUEST_TOKEN_KEY = 'guest_token';

const GuestProfileService = {
    /**
     * Get or create a guest token (UUID v4).
     * Returns the existing token if present, otherwise creates one.
     */
    getGuestToken()
    {
        if (typeof window === 'undefined') return null;

        let token = localStorage.getItem(GUEST_TOKEN_KEY);
        if (!token)
        {
            token = crypto.randomUUID();
            localStorage.setItem(GUEST_TOKEN_KEY, token);
        }
        return token;
    },

    /**
     * Get existing guest token without creating one.
     */
    getExistingGuestToken()
    {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(GUEST_TOKEN_KEY);
    },

    /**
     * Clear the guest token (called after successfully claiming orders).
     */
    clearGuestToken()
    {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(GUEST_TOKEN_KEY);
    },

    /**
     * Check if the current user is a guest (has guest token, no JWT).
     */
    isGuest()
    {
        if (typeof window === 'undefined') return false;
        return !localStorage.getItem('token') && !!localStorage.getItem(GUEST_TOKEN_KEY);
    },
};

export default GuestProfileService;
