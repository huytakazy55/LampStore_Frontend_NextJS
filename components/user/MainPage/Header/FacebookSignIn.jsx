"use client";

import React, { useCallback, useEffect } from 'react';

const FACEBOOK_SDK_URL = 'https://connect.facebook.net/en_US/sdk.js';

const FacebookSignIn = ({ onFacebookLoginSuccess, onFacebookLoginError }) =>
{
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

    const initializeFacebook = useCallback(() =>
    {
        if (!window.FB || !appId) return;

        window.FB.init({
            appId,
            cookie: true,
            xfbml: false,
            version: 'v20.0'
        });
    }, [appId]);

    useEffect(() =>
    {
        if (!appId || window.FB)
        {
            if (window.FB) initializeFacebook();
            return;
        }

        const existingScript = document.querySelector(`script[src="${FACEBOOK_SDK_URL}"]`);
        if (existingScript)
        {
            existingScript.onload = initializeFacebook;
            return;
        }

        const script = document.createElement('script');
        script.src = FACEBOOK_SDK_URL;
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.onload = initializeFacebook;
        document.head.appendChild(script);
    }, [appId, initializeFacebook]);

    const handleClick = () =>
    {
        if (!appId)
        {
            onFacebookLoginError(new Error('Missing Facebook App ID'));
            return;
        }

        if (!window.FB)
        {
            onFacebookLoginError(new Error('Facebook SDK is not loaded'));
            return;
        }

        window.FB.login((loginResponse) =>
        {
            if (!loginResponse.authResponse)
            {
                onFacebookLoginError(new Error('Facebook login was cancelled'));
                return;
            }

            window.FB.api('/me', {
                fields: 'id,name,email,picture.type(large)'
            }, (profile) =>
            {
                if (!profile || profile.error)
                {
                    onFacebookLoginError(profile?.error || new Error('Cannot fetch Facebook profile'));
                    return;
                }

                onFacebookLoginSuccess({
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    picture: profile.picture?.data?.url || '',
                    accessToken: loginResponse.authResponse.accessToken
                });
            });
        }, { scope: 'public_profile,email' });
    };

    return (
        <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer"
            onClick={handleClick}
        >
            <i className='bx bxl-facebook-circle text-blue-600 text-xl'></i>Facebook
        </button>
    );
};

export default FacebookSignIn;
