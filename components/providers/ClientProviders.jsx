"use client";

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from '@/redux/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import AOSProvider from './AOSProvider';
import LenisProvider from '@/components/common/LenisProvider';
import FloatingCart from '@/components/user/FloatingCart/FloatingCart';
import ChatButton from '@/components/user/Chat/ChatButton';
import '@/lib/axiosConfig';
import '@/lib/i18n';

// Expose toast to global scope for NotificationService
if (typeof window !== 'undefined')
{
    window.toast = toast;
}

export default function ClientProviders({ children })
{
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                retry: 2,
                refetchOnWindowFocus: false,
                refetchOnMount: true,
            },
        },
    }));

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <AOSProvider>
                                <LenisProvider>
                                    {children}
                                </LenisProvider>
                            </AOSProvider>
                            {!isAdminPage && <FloatingCart />}
                            {!isAdminPage && <ChatButton />}
                            <ToastContainer
                                position='bottom-right'
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick
                                pauseOnHover
                                draggable
                                theme='colored'
                            />
                        </WishlistProvider>
                    </CartProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
}
