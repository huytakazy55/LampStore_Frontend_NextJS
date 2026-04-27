"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FlashSaleService from '@/services/FlashSaleService';
import { Link } from '@/lib/router-compat';
import './FlashSale.css';

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

    if (loading || !flashSale) return null;

    const items = flashSale.items?.$values || flashSale.items || [];
    if (items.length === 0) return null;

    const formatPrice = (price) =>
    {
        return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
    };

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <section className="flash-sale-section">
            <div className="flash-sale-container">
                {/* Header */}
                <div className="flash-sale-header">
                    <div className="flash-sale-title-group">
                        <div className="flash-sale-icon">⚡</div>
                        <h2 className="flash-sale-title">FLASH SALE</h2>
                        <div className="flash-sale-icon">⚡</div>
                    </div>

                    <div className="flash-sale-countdown">
                        <span className="countdown-label">{countdownState.label}</span>
                        <div className="countdown-boxes">
                            <div className="countdown-box">{pad(countdownState.hours)}</div>
                            <span className="countdown-sep">:</span>
                            <div className="countdown-box">{pad(countdownState.minutes)}</div>
                            <span className="countdown-sep">:</span>
                            <div className="countdown-box">{pad(countdownState.seconds)}</div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flash-sale-grid">
                    {items.map((item) =>
                    {
                        const soldPercent = item.stock > 0 ? Math.round((item.soldCount / item.stock) * 100) : 0;
                        const productLink = item.productSlug ? `/product/${item.productSlug}` : '#';

                        return (
                            <Link key={item.id || item.productId} href={productLink} className="flash-sale-card">
                                {/* Discount Badge */}
                                <div className="flash-sale-badge">-{item.discountPercent}%</div>

                                {/* Image */}
                                <div className="flash-sale-img-wrap">
                                    <img
                                        src={item.productImageUrl ? `${item.productImageUrl}` : '/images/placeholder.png'}
                                        alt={item.productName}
                                        loading="lazy"
                                        className="flash-sale-img"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flash-sale-info">
                                    <div className="flash-sale-product-name">{item.productName}</div>
                                    <div className="flash-sale-prices">
                                        <span className="flash-price">{formatPrice(item.flashSalePrice)}</span>
                                        <span className="original-price">{formatPrice(item.productOriginalPrice)}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flash-sale-progress-wrap">
                                        <div className="flash-sale-progress">
                                            <div
                                                className="flash-sale-progress-bar"
                                                style={{ width: `${Math.min(soldPercent, 100)}%` }}
                                            />
                                        </div>
                                        <span className="flash-sale-sold">
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
