"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import CartService from '@/services/CartService';

const CartContext = createContext();
const CART_KEY = 'lamp_store_cart';
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const loadCart = () =>
{
    if (typeof window === 'undefined') return [];
    try
    {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch
    {
        return [];
    }
};

const saveCart = (items) =>
{
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const getCartItemKey = (productId, selectedOptions) =>
{
    const optionStr = Object.entries(selectedOptions || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v.value}`)
        .join('|');
    return `${productId}__${optionStr}`;
};

const backendToFrontendItem = (backendItem) =>
{
    const selectedOptions = backendItem.selectedOptions
        ? JSON.parse(backendItem.selectedOptions)
        : {};

    const totalAdditional = Object.values(selectedOptions)
        .reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);

    const basePrice = backendItem.basePrice || 0;

    let imagePath = backendItem.productImage || '';
    if (imagePath && !imagePath.startsWith('http'))
    {
        imagePath = `${API_ENDPOINT}${imagePath}`;
    }

    return {
        key: getCartItemKey(backendItem.productId, selectedOptions),
        backendId: backendItem.id,
        productId: backendItem.productId,
        name: backendItem.productName || '',
        image: imagePath,
        basePrice: basePrice,
        finalPrice: basePrice + totalAdditional,
        quantity: backendItem.quantity,
        selectedOptions: selectedOptions,
        weight: backendItem.weight || 0
    };
};

const isLoggedIn = () =>
{
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
};

const getItemsFromApiResponse = (backendData) =>
{
    return (backendData?.$values || backendData || [])
        .map(backendToFrontendItem);
};

const mergeCartItem = (items, item) =>
{
    const key = getCartItemKey(item.productId, item.selectedOptions);
    const existingIndex = items.findIndex(ci => ci.key === key);

    if (existingIndex >= 0)
    {
        const updated = [...items];
        updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + item.quantity
        };
        return updated;
    }

    const totalAdditional = Object.values(item.selectedOptions || {})
        .reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);

    return [...items, {
        key,
        productId: item.productId,
        name: item.name,
        image: item.image,
        basePrice: item.price,
        finalPrice: item.price + totalAdditional,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || {},
        weight: item.weight || 0
    }];
};

export function CartProvider({ children })
{
    const [cartItems, setCartItems] = useState([]);
    const cartItemsRef = useRef([]);
    const syncRequestRef = useRef(0);

    // Hydrate from localStorage after mount
    useEffect(() =>
    {
        let cancelled = false;

        const hydrateCart = async () =>
        {
            const localItems = loadCart();
            cartItemsRef.current = localItems;
            setCartItems(localItems);

            if (!isLoggedIn()) return;

            try
            {
                const backendData = await CartService.getMyCart();
                if (cancelled) return;
                const items = getItemsFromApiResponse(backendData);
                cartItemsRef.current = items;
                setCartItems(items);
            } catch (error)
            {
                console.error('Cart hydration failed:', error);
            }
        };

        hydrateCart();

        return () =>
        {
            cancelled = true;
        };
    }, []);

    useEffect(() =>
    {
        cartItemsRef.current = cartItems;
        saveCart(cartItems);
    }, [cartItems]);

    const syncCartSnapshot = useCallback((items) =>
    {
        if (!isLoggedIn()) return;

        const requestId = ++syncRequestRef.current;

        CartService.syncCart(items).then(backendData =>
        {
            if (requestId !== syncRequestRef.current) return;
            const syncedItems = getItemsFromApiResponse(backendData);
            cartItemsRef.current = syncedItems;
            setCartItems(syncedItems);
        }).catch(err => console.error('Cart sync failed:', err));
    }, []);

    const addToCart = useCallback((item) =>
    {
        const nextItems = mergeCartItem(cartItemsRef.current, item);
        cartItemsRef.current = nextItems;
        setCartItems(nextItems);
        syncCartSnapshot(nextItems);
    }, [syncCartSnapshot]);

    const removeFromCart = useCallback((key) =>
    {
        const item = cartItemsRef.current.find(i => i.key === key);
        if (item?.backendId && isLoggedIn())
        {
            CartService.removeItem(item.backendId).catch(err =>
                console.error('Failed to remove from backend:', err)
            );
        }

        const nextItems = cartItemsRef.current.filter(i => i.key !== key);
        cartItemsRef.current = nextItems;
        setCartItems(nextItems);
    }, []);

    const updateQuantity = useCallback((key, quantity) =>
    {
        if (quantity < 1) return;

        const item = cartItemsRef.current.find(i => i.key === key);
        if (item?.backendId && isLoggedIn())
        {
            CartService.updateItemQuantity(item.backendId, quantity).catch(err =>
                console.error('Failed to update quantity in backend:', err)
            );
        }

        const nextItems = cartItemsRef.current.map(cartItem =>
            cartItem.key === key ? { ...cartItem, quantity } : cartItem
        );
        cartItemsRef.current = nextItems;
        setCartItems(nextItems);
    }, []);

    const clearCart = useCallback(() =>
    {
        if (isLoggedIn())
        {
            CartService.clearMyCart().catch(err =>
                console.error('Failed to clear backend cart:', err)
            );
        }
        cartItemsRef.current = [];
        setCartItems([]);
    }, []);

    const syncCartOnLogin = useCallback(async () =>
    {
        try
        {
            const localItems = loadCart();
            const backendData = await CartService.syncCart(localItems);
            const items = getItemsFromApiResponse(backendData);
            cartItemsRef.current = items;
            setCartItems(items);
        } catch (error)
        {
            console.error('Cart sync failed:', error);
        }
    }, []);

    const clearCartOnLogout = useCallback(() =>
    {
        cartItemsRef.current = [];
        setCartItems([]);
        if (typeof window !== 'undefined')
        {
            localStorage.removeItem(CART_KEY);
        }
    }, []);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            syncCartOnLogin,
            clearCartOnLogout
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () =>
{
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export default CartContext;
