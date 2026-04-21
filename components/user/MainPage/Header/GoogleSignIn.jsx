"use client";

import React, { useEffect, useRef } from 'react';

const GoogleSignIn = ({ onGoogleLoginSuccess, onGoogleLoginError }) =>
{
    const googleButtonRef = useRef(null);

    useEffect(() =>
    {
        // Kiểm tra xem script đã được load chưa
        if (window.google && window.google.accounts)
        {
            initializeGoogleSignIn();
            return;
        }

        // Load Google Identity Services script nếu chưa có
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript)
        {
            existingScript.onload = initializeGoogleSignIn;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);

        return () =>
        {
            // Cleanup khi component unmount
            if (googleButtonRef.current)
            {
                googleButtonRef.current.innerHTML = '';
            }
        };
    }, []);

    const initializeGoogleSignIn = () =>
    {
        if (window.google && window.google.accounts && googleButtonRef.current)
        {
            // Initialize Google Identity Services
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '326656385962-br7reli303c8ne447hilklrun5fm94hr.apps.googleusercontent.com',
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            // Render hidden Google button
            window.google.accounts.id.renderButton(
                googleButtonRef.current,
                {
                    theme: 'outline',
                    size: 'medium',
                    type: 'standard',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                }
            );
        }
    };

    const handleCredentialResponse = (response) =>
    {
        try
        {
            // Decode JWT token từ Google
            const decodedToken = parseJwt(response.credential);


            // Gửi thông tin đến parent component
            onGoogleLoginSuccess({
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture,
                sub: decodedToken.sub, // Google user ID
                token: response.credential
            });
        } catch (error)
        {
            console.error('Error handling Google login:', error);
            onGoogleLoginError(error);
        }
    };

    const parseJwt = (token) =>
    {
        try
        {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c)
            {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error)
        {
            throw new Error('Invalid token');
        }
    };

    const handleCustomButtonClick = () =>
    {
        // Trigger click của hidden Google button
        if (googleButtonRef.current)
        {
            const googleBtn = googleButtonRef.current.querySelector('div[role="button"]');
            if (googleBtn)
            {
                googleBtn.click();
            }
        }
    };

    return (
        <>
            {/* Hidden Google button */}
            <div
                ref={googleButtonRef}
                style={{ display: 'none' }}
            />

            {/* Custom button giống Facebook */}
            <div
                className='flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer'
                onClick={handleCustomButtonClick}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
            </div>
        </>
    );
};

export default GoogleSignIn; 