"use client";

/**
 * GuestProfileService - Manages a virtual guest profile using a UUID stored in localStorage.
 * This "guest token" acts as a virtual identity for unauthenticated users,
 * allowing them to place orders. When they sign up or log in,
 * the token is used to claim those orders, then cleared.
 */

const GUEST_TOKEN_KEY = 'guest_token';
const GUEST_CODE_KEY = 'guest_code';
const GUEST_CREATED_KEY = 'guest_created_at';
const GUEST_INFO_KEY = 'guest_info';

/**
 * Generate a short customer code: KH-XXXXXX (6 uppercase alphanumeric chars)
 */
const generateGuestCode = () =>
{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++)
    {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `KH-${code}`;
};

const GuestProfileService = {
    /**
     * Get or create a guest token (UUID v4).
     * Also creates guest code & timestamp if they don't exist.
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
            localStorage.setItem(GUEST_CODE_KEY, generateGuestCode());
            localStorage.setItem(GUEST_CREATED_KEY, new Date().toISOString());
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
     * Get the guest customer code (e.g. KH-A3F2B1).
     * Returns null if no guest profile exists.
     */
    getGuestCode()
    {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(GUEST_CODE_KEY);
    },

    /**
     * Get the full guest profile object.
     * Returns { guestToken, guestCode, createdAt } or null.
     */
    getGuestProfile()
    {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem(GUEST_TOKEN_KEY);
        if (!token) return null;
        return {
            guestToken: token,
            guestCode: localStorage.getItem(GUEST_CODE_KEY) || 'KH-UNKNOWN',
            createdAt: localStorage.getItem(GUEST_CREATED_KEY) || null,
        };
    },

    /**
     * Save guest checkout info (name, phone, email, address, etc.)
     * for auto-filling future checkout forms.
     */
    saveGuestInfo(info)
    {
        if (typeof window === 'undefined') return;
        try
        {
            localStorage.setItem(GUEST_INFO_KEY, JSON.stringify(info));
        } catch (e)
        {
            console.error('Failed to save guest info:', e);
        }
    },

    /**
     * Get saved guest checkout info.
     * Returns { fullName, phone, email, address, city, district, ward, ... } or null.
     */
    getGuestInfo()
    {
        if (typeof window === 'undefined') return null;
        try
        {
            const data = localStorage.getItem(GUEST_INFO_KEY);
            return data ? JSON.parse(data) : null;
        } catch
        {
            return null;
        }
    },

    /**
     * Clear the guest token only (called after successfully claiming orders).
     */
    clearGuestToken()
    {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(GUEST_TOKEN_KEY);
    },

    /**
     * Clear ALL guest data (token, code, info, timestamps).
     * Called after login to an existing account.
     */
    clearAllGuestData()
    {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(GUEST_TOKEN_KEY);
        localStorage.removeItem(GUEST_CODE_KEY);
        localStorage.removeItem(GUEST_CREATED_KEY);
        localStorage.removeItem(GUEST_INFO_KEY);
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
