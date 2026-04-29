"use client";

import React, { useState } from 'react'

const MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6778758888713!2d105.81908607604745!3d21.005545788574118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad5fb9812307%3A0x63c20c5aa29db56b!2zS2h1IHThuq1wIHRo4buDIEEyIHBo4buRIFbEqW5oIEjhu5MsIFRo4buLbmggUXVhbmcsIMSQ4buRbmcgxJBhLCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1726261210365!5m2!1svi!2s";

const LazyMap = () => {
    const [loaded, setLoaded] = useState(false);
    if (loaded) {
        return (
            <iframe
                className='w-full h-full'
                title="Bản đồ vị trí cửa hàng CapyLumine"
                src={MAPS_EMBED_URL}
                style={{ border: 0 }}
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
            />
        );
    }
    return (
        <button
            onClick={() => setLoaded(true)}
            className='w-full h-full bg-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-700 transition-colors group'
            aria-label="Nhấn để xem bản đồ Google Maps"
        >
            <i className='bx bx-map text-3xl text-yellow-400 group-hover:scale-110 transition-transform' />
            <span className='text-xs text-gray-300 font-medium'>Xem bản đồ</span>
        </button>
    );
};

const Footer = () => {
    return (
        <footer style={{ contain: 'layout style', contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
            {/* Main Footer */}
            <div className='relative overflow-hidden bg-black' style={{ minHeight: '380px' }}>
                {/* === Top yellow S-curve flowing from left === */}
                <svg className='absolute top-0 left-0 w-full h-full pointer-events-none' viewBox="0 0 1440 500" preserveAspectRatio="none" fill="none">
                    {/* Outer yellow curve - wraps behind the circle */}
                    <path d="M0,0 L0,120 C0,200 80,320 200,380 C300,430 380,500 380,500 L0,500 Z" fill="#facc15" />
                    {/* Inner black curve - creates the S-shape cutout */}
                    <path d="M0,0 L0,80 C20,160 100,260 200,320 C280,370 340,440 400,500 L0,500 Z" fill="black" />
                </svg>

                <div className='w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-0 py-10 md:py-14 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0 relative z-10'>

                    {/* === Cột trái: Bản đồ trong khung tròn === */}
                    <div className='w-full lg:w-[30%] flex justify-center lg:justify-start items-center'>
                        <div className='w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl shadow-yellow-400/10 flex-shrink-0'>
                            <LazyMap />
                        </div>
                    </div>

                    {/* === Cột giữa: Tên + Info liên hệ === */}
                    <div className='w-full lg:w-[40%]'>
                        <div className='mb-5 md:mb-6'>
                            <h3 className='text-lg md:text-xl font-bold text-white uppercase tracking-wide'>
                                Tranh Đèn Ngủ <span className='text-yellow-400'>3D Tráng Gương</span>
                            </h3>
                            <p className='text-gray-400 text-sm mt-1'>Đèn ngủ cao cấp — Nâng tầm giấc ngủ Việt</p>
                        </div>

                        {/* Contact grid 2 cột */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-gray-300'>
                                    <p>(+84)969 608 810</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-gray-300'>
                                    <p>Khongthaydoi124@gmail.com</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-gray-300'>
                                    <p>A2 Vĩnh Hồ, Thịnh Quang,</p>
                                    <p>Đống Đa, Hà Nội</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-gray-300'>
                                    <p>CapyLumine.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Links hỗ trợ */}
                        <div className='mt-6 pt-5 border-t border-gray-800'>
                            <h4 className='text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wider'>Hỗ trợ khách hàng</h4>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2'>
                                {[
                                    { text: 'Giới thiệu', href: '/ho-tro/gioi-thieu' },
                                    { text: 'Bảo hành sản phẩm', href: '/ho-tro/bao-hanh' },
                                    { text: 'Hướng dẫn sử dụng', href: '/ho-tro/huong-dan-su-dung' },
                                    { text: 'Vận chuyển & thanh toán', href: '/ho-tro/van-chuyen-thanh-toan' },
                                    { text: 'Hướng dẫn chọn mua', href: '/ho-tro/huong-dan-chon-mua' },
                                    { text: 'Chính sách đổi trả', href: '/ho-tro/chinh-sach-doi-tra' },
                                ].map((item, i) => (
                                    <a key={i} href={item.href} className='text-xs text-gray-400 hover:text-gray-200 transition-colors duration-300 flex items-center gap-2'>
                                        <i className='bx bx-chevron-right text-yellow-400/50'></i>
                                        {item.text}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === Cột phải: Logo + Social === */}
                    <div className='w-full lg:w-[30%] flex flex-col items-center lg:items-end'>
                        {/* Logo text */}
                        <div className='text-right mb-6'>
                            <div className='text-2xl md:text-3xl font-extrabold text-white tracking-tight'>
                                Capy<span className='text-yellow-400'>Lumine</span><span className='text-gray-500 text-lg'>.com</span>
                            </div>
                            <p className='text-gray-500 text-xs mt-1 tracking-widest uppercase'>Premium CapyLumine</p>
                        </div>

                        {/* Social icons */}
                        <div className='flex items-center gap-3 mb-6'>
                            {[
                                { icon: 'bxl-facebook-square', label: 'Facebook' },
                                { icon: 'bxl-instagram', label: 'Instagram' },
                                { icon: 'bxl-tiktok', label: 'TikTok' },
                                { icon: 'bxl-youtube', label: 'YouTube' },
                            ].map((social) => (
                                <a
                                    key={social.icon}
                                    href='#'
                                    aria-label={social.label}
                                    className='w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 transition-all duration-300 hover:text-yellow-400 hover:border-yellow-400 hover:-translate-y-1'
                                >
                                    <i className={`bx ${social.icon} text-lg`}></i>
                                </a>
                            ))}
                        </div>

                        {/* Decorative dots */}
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full bg-gray-800 border border-gray-700'></span>
                            <span className='w-4 h-4 rounded-full bg-gray-800 border border-gray-700'></span>
                            <span className='w-4 h-4 rounded-full bg-yellow-400'></span>
                        </div>
                    </div>
                </div>

                {/* === Bottom yellow S-curve wave === */}
                <svg className='absolute bottom-0 left-0 w-full pointer-events-none' style={{ height: '80px' }} viewBox="0 0 1440 80" preserveAspectRatio="none">
                    {/* Yellow ribbon wave */}
                    <path d="M800,80 C850,80 900,70 950,55 C1050,25 1150,5 1250,15 C1350,25 1400,50 1440,60 L1440,80 Z" fill="#facc15" />
                    {/* Black overlay to create S-shape */}
                    <path d="M850,80 C900,80 950,72 1000,60 C1100,35 1200,18 1300,25 C1380,30 1420,45 1440,55 L1440,80 Z" fill="#111" />
                </svg>
            </div>

            {/* Copyright bar */}
            <div className='w-full py-4' style={{ background: '#111' }}>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-2 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0'>
                    <div className='text-xs md:text-sm text-gray-500 text-center'>
                        © 2024 | Bản quyền thuộc về <span className='text-yellow-400 font-semibold'>CapyLumine.com</span>
                    </div>
                    <div className='flex items-center gap-4 text-gray-500 text-xs'>
                        <a href='#' className='hover:text-gray-400 transition-colors'>Điều khoản</a>
                        <span>•</span>
                        <a href='#' className='hover:text-gray-400 transition-colors'>Chính sách</a>
                        <span>•</span>
                        <a href='#' className='hover:text-gray-400 transition-colors'>Liên hệ</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer