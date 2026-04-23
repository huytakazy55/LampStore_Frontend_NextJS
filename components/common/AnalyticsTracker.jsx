"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Generate or get SessionID
        let sessionId = localStorage.getItem('lampstore_session_id');
        if (!sessionId) {
            sessionId = generateUUID();
            localStorage.setItem('lampstore_session_id', sessionId);
        }

        const trackVisit = async () => {
            try {
                const fullPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

                // Bỏ qua trang admin (không tính lượt truy cập nội bộ)
                if (pathname.startsWith('/admin')) {
                    return;
                }

                await fetch(`${API_ENDPOINT}/api/Analytics/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        SessionId: sessionId,
                        Path: fullPath,
                        ProductId: null
                    }),
                });
            } catch (error) {
                console.error('Failed to track visit', error);
            }
        };

        trackVisit();
    }, [pathname, searchParams]);

    return null; // Component does not render anything
}
