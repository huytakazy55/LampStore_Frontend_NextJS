"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import FlashSaleService from '@/services/FlashSaleService';
import { Link } from '@/lib/router-compat';

const FlashSale = () =>
{
    const [flashSale, setFlashSale] = useState(null);
    const [countdownState, setCountdownState] = useState({ label: '', hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    const fetchActive = useCallback(async () =>
    {
        try
        {
            const data = await FlashSaleService.getActiveFlashSale();
            if (data && data.id)
            {
                setFlashSale(data);
            } else
            {
                setFlashSale(null);
            }
        } catch
        {
            setFlashSale(null);
        } finally
        {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchActive(); }, [fetchActive]);

    // Countdown timer
    useEffect(() =>
    {
        if (!flashSale) return;

        const updateCountdown = () =>
        {
            const now = new Date().getTime();
            const start = new Date(flashSale.startTime).getTime();
            const end = new Date(flashSale.endTime).getTime();

            let targetTime = end;
            let label = "Kết thúc sau";

            if (now < start)
            {
                targetTime = start;
                label = "Bắt đầu sau";
            }

            const diff = targetTime - now;

            if (diff <= 0 && now >= end)
            {
                setFlashSale(null);
                return;
            } else if (diff <= 0 && now >= start && now < end)
            {
                return;
            }

            setCountdownState({
                label,
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };

        updateCountdown();
        timerRef.current = setInterval(updateCountdown, 1000);
        return () => clearInterval(timerRef.current);
    }, [flashSale]);

    // Return empty placeholder instead of null to prevent CLS when flash sale loads
    if (loading || !flashSale) return <div style={{ contain: 'layout style', minHeight: 0 }} />;

    const items = flashSale.items?.$values || flashSale.items || [];
    if (items.length === 0) return null;

    const formatPrice = (price) =>
    {
        return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    };

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <section className="mx-auto mb-6 w-full max-w-[1440px] px-2 md:px-4 xl:px-0">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff3b30] via-[#ff6b35] to-[#ff3b30] shadow-[0_4px_24px_rgba(255,59,48,0.25)] dark:from-[#991b1b] dark:via-[#c2410c] dark:to-[#991b1b] dark:shadow-[0_4px_24px_rgba(153,27,27,0.35)]">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-center md:justify-between md:px-6 md:py-4 md:text-left">
                    <div className="flex items-center gap-2">
                        <div className="animate-flashPulse text-2xl">⚡</div>
                        <h2 className="m-0 text-lg font-extrabold uppercase tracking-[2px] text-white md:text-[22px]">FLASH SALE</h2>
                        <div className="animate-flashPulse text-2xl">⚡</div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="text-[13px] font-medium text-white/85">{countdownState.label}</span>
                        <div className="flex items-center gap-1">
                            <div className="min-w-[30px] rounded-md bg-[#1a1a2e] px-1.5 py-[3px] text-center font-mono text-sm font-bold leading-[1.4] text-white md:min-w-9 md:px-2 md:py-1 md:text-base">{pad(countdownState.hours)}</div>
                            <span className="text-lg font-bold leading-none text-white">:</span>
                            <div className="min-w-[30px] rounded-md bg-[#1a1a2e] px-1.5 py-[3px] text-center font-mono text-sm font-bold leading-[1.4] text-white md:min-w-9 md:px-2 md:py-1 md:text-base">{pad(countdownState.minutes)}</div>
                            <span className="text-lg font-bold leading-none text-white">:</span>
                            <div className="min-w-[30px] rounded-md bg-[#1a1a2e] px-1.5 py-[3px] text-center font-mono text-sm font-bold leading-[1.4] text-white md:min-w-9 md:px-2 md:py-1 md:text-base">{pad(countdownState.seconds)}</div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-0 bg-white p-0.5 dark:bg-gray-800 sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
                    {items.map((item) =>
                    {
                        const soldPercent = item.stock > 0 ? Math.round((item.soldCount / item.stock) * 100) : 0;
                        const productLink = item.productSlug ? `/product/${item.productSlug}` : '#';

                        return (
                            <Link
                                key={item.id || item.productId}
                                href={productLink}
                                className="group relative flex flex-col overflow-hidden border border-[#f0f0f0] text-inherit no-underline transition-all duration-200 hover:z-[1] hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-[#263044] dark:hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                            >
                                {/* Discount Badge */}
                                <div className="absolute right-0 top-0 z-[2] rounded-bl-[10px] bg-gradient-to-br from-[#ff3b30] to-[#ff6b4a] px-2.5 py-1 text-xs font-bold leading-[1.3] text-white dark:from-[#dc2626] dark:to-[#ea580c]">-{item.discountPercent}%</div>

                                {/* Image */}
                                <div className="relative w-full overflow-hidden bg-[#fafafa] pt-[100%] dark:bg-[#111827]">
                                    <Image
                                        src={item.productImageUrl ? `${item.productImageUrl}` : '/images/placeholder.png'}
                                        alt={item.productName}
                                        fill
                                        sizes="(max-width: 768px) 45vw, 20vw"
                                        quality={75}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex flex-col gap-1.5 px-3 pb-3.5 pt-2.5">
                                    <div className="line-clamp-2 min-h-[34px] text-[13px] font-medium leading-[1.3] text-[#333] dark:text-gray-200">{item.productName}</div>
                                    <div className="flex flex-wrap items-baseline gap-1.5">
                                        <span className="text-base font-bold text-[#c0392b] dark:text-red-300">{formatPrice(item.flashSalePrice)}</span>
                                        <span className="text-xs text-[#757575] line-through dark:text-gray-500">{formatPrice(item.productOriginalPrice)}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative">
                                        <div className="relative h-[18px] overflow-hidden rounded-full bg-[#e8a8a4] dark:bg-gray-700">
                                            <div
                                                className="relative h-full min-w-2 rounded-full bg-gradient-to-r from-[#ff3b30] to-[#ff6b4a] transition-[width] duration-500 after:absolute after:left-1 after:right-1 after:top-0.5 after:h-1 after:rounded-full after:bg-white/30 after:content-['']"
                                                style={{ width: `${Math.min(soldPercent, 100)}%` }}
                                            />
                                        </div>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#7f1d1d]">
                                            {item.soldCount > 0 ? `Đã bán ${item.soldCount}` : 'Vừa mở bán'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
