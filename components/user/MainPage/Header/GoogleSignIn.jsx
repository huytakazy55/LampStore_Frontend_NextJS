"use client";

import React, { useEffect, useRef } from 'react';

const GoogleSignIn = ({ onGoogleLoginSuccess, onGoogleLoginError }) => {
    const googleButtonRef = useRef(null);

    useEffect(() => {
        // Kiểm tra xem script đã được load chưa
        if (window.google && window.google.accounts) {
            initializeGoogleSignIn();
            return;
        }

        // Load Google Identity Services script nếu chưa có
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            existingScript.onload = initializeGoogleSignIn;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);

        return () => {
            // Cleanup khi component unmount
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML = '';
            }
        };
    }, []);

    const initializeGoogleSignIn = () => {
        if (window.google && window.google.accounts && googleButtonRef.current) {
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

    const handleCredentialResponse = (response) => {
        try {
            // Decode JWT token từ Google
            const decodedToken = parseJwt(response.credential);
            console.log('Google user info:', decodedToken);
            
            // Gửi thông tin đến parent component
            onGoogleLoginSuccess({
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture,
                sub: decodedToken.sub, // Google user ID
                token: response.credential
            });
        } catch (error) {
            console.error('Error handling Google login:', error);
            onGoogleLoginError(error);
        }
    };

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    };

    const handleCustomButtonClick = () => {
        // Trigger click của hidden Google button
        if (googleButtonRef.current) {
            const googleBtn = googleButtonRef.current.querySelector('div[role="button"]');
            if (googleBtn) {
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
                className='border-[1px] rounded-sm p-[5px] w-[35%] bg-white/30 flex justify-center items-center gap-1 cursor-pointer hover:bg-white/50 transition-colors'
                onClick={handleCustomButtonClick}
            >
                <i className='bx bxl-google text-h3'></i>
                <span>Google</span>
            </div>
        </>
    );
};

export default GoogleSignIn; 