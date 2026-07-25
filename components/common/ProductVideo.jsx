"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ProductVideo = ({
  src,
  className,
  wrapperClassName,
  style,
  autoPlay = false,
  muted = false,
  loop = false,
  preload = 'metadata',
  playsInline = true,
  children = 'Trình duyệt không hỗ trợ phát video.',
}) => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className={wrapperClassName} style={{ position: 'relative', width: '100%' }}>
        <video
          src={src}
          controls
          controlsList="nofullscreen"
          disablePictureInPicture
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload={preload}
          playsInline={playsInline}
          className={`product-video-native-controls ${className || ''}`}
          style={style}
        >
          {children}
        </video>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mở rộng video"
          title="Mở rộng video"
          style={{
            position: 'absolute',
            right: 56,
            bottom: 17,
            zIndex: 2,
            width: 30,
            height: 30,
            padding: 0,
            border: 0,
            borderRadius: 3,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: 19,
            lineHeight: '30px',
            cursor: 'pointer',
          }}
        >
          ⛶
        </button>
      </div>

      {mounted && open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video sản phẩm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'rgba(0,0,0,0.72)',
          }}
        >
          <div style={{ position: 'relative', width: 'min(900px, 92vw)' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng video"
              style={{
                position: 'absolute',
                top: -42,
                right: 0,
                border: 0,
                background: 'transparent',
                color: '#fff',
                fontSize: 34,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <video
              src={src}
              controls
              autoPlay
              controlsList="nofullscreen"
              disablePictureInPicture
              playsInline
              className="product-video-native-controls"
              style={{
                display: 'block',
                width: '100%',
                maxHeight: '78vh',
                objectFit: 'contain',
                borderRadius: 10,
                background: '#000',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              }}
            >
              {children}
            </video>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        video.product-video-native-controls::-webkit-media-controls-fullscreen-button {
          display: none !important;
          -webkit-appearance: none;
        }
      `}</style>
    </>
  );
};

export default ProductVideo;
