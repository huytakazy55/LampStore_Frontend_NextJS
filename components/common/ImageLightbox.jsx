"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ImageLightbox = ({ isOpen, onClose, images, initialIndex = 0 }) =>
{
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() =>
    {
        if (isOpen)
        {
            setCurrentIndex(initialIndex);
            setIsZoomed(false);
            document.body.style.overflow = 'hidden';
        } else
        {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, initialIndex]);

    const handlePrev = useCallback((e) =>
    {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setIsZoomed(false);
    }, [images.length]);

    const handleNext = useCallback((e) =>
    {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setIsZoomed(false);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() =>
    {
        if (!isOpen) return;
        const handleKey = (e) =>
        {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose, handlePrev, handleNext]);

    if (!mounted || !isOpen || !images || images.length === 0) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
                <i className="bx bx-x text-2xl"></i>
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm font-medium bg-black/30 px-4 py-1.5 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Prev button */}
            {images.length > 1 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-3 md:left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                >
                    <i className="bx bx-chevron-left text-3xl"></i>
                </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-3 md:right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                >
                    <i className="bx bx-chevron-right text-3xl"></i>
                </button>
            )}

            {/* Main image */}
            <div
                className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Ảnh ${currentIndex + 1}`}
                    className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                        }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                    draggable={false}
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-sm max-w-[90vw] overflow-x-auto">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={(e) =>
                            {
                                e.stopPropagation();
                                setCurrentIndex(i);
                                setIsZoomed(false);
                            }}
                            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${currentIndex === i
                                ? 'border-white shadow-lg scale-110'
                                : 'border-transparent opacity-50 hover:opacity-80'
                                }`}
                        >
                            <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
                        </button>
                    ))}
                </div>
            )}
        </div>,
        document.body
    );
};

export default ImageLightbox;
