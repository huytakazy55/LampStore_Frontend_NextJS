"use client";

import React, { useState } from 'react'

const MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6778758888713!2d105.81908607604745!3d21.005545788574118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad5fb9812307%3A0x63c20c5aa29db56b!2zS2h1IHThuq1wIHRo4buDIEEyIHBo4buRIFbEqW5oIEjhu5MsIFRo4buLbmggUXVhbmcsIMSQ4buRbmcgxJBhLCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1726261210365!5m2!1svi!2s";

const LazyMap = () => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className='relative w-full h-full'>
            {/* Placeholder button — always rendered to reserve space, hidden after load */}
            {!loaded && (
                <button
                    onClick={() => setLoaded(true)}
                    className='absolute inset-0 w-full h-full bg-amber-600/80 dark:bg-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-amber-600 dark:hover:bg-gray-700 transition-colors group z-10'
                    aria-label="Nhấn để xem bản đồ Google Maps"
                >
                    <i className='bx bx-map text-3xl text-white dark:text-yellow-400 group-hover:scale-110 transition-transform' />
                    <span className='text-xs text-white dark:text-gray-300 font-medium'>Xem bản đồ</span>
                </button>
            )}
            {/* Iframe — only mounted after click, takes same space */}
            {loaded && (
                <iframe
                    className='absolute inset-0 w-full h-full'
                    title="Bản đồ vị trí cửa hàng CapyLumine"
                    src={MAPS_EMBED_URL}
                    width="256"
                    height="256"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    referrerPolicy="no-referrer-when-downgrade"
                    loading="lazy"
                />
            )}
        </div>
    );
};

const Footer = () => {
    return (
        <footer style={{ contain: 'layout style', contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
            {/* Main Footer */}
            <div className='relative overflow-hidden bg-amber-500 dark:bg-black' style={{ minHeight: '380px' }}>
                {/* === Top S-curve — Light mode (amber) === */}
                <svg className='absolute top-0 left-0 w-full h-full pointer-events-none dark:hidden' viewBox="0 0 1440 500" preserveAspectRatio="none" fill="none">
                    <path d="M0,0 L0,120 C0,200 80,320 200,380 C300,430 380,500 380,500 L0,500 Z" fill="#92400e" />
                    <path d="M0,0 L0,80 C20,160 100,260 200,320 C280,370 340,440 400,500 L0,500 Z" fill="#f59e0b" />
                </svg>
                {/* === Top S-curve — Dark mode === */}
                <svg className='absolute top-0 left-0 w-full h-full pointer-events-none hidden dark:block' viewBox="0 0 1440 500" preserveAspectRatio="none" fill="none">
                    <path d="M0,0 L0,120 C0,200 80,320 200,380 C300,430 380,500 380,500 L0,500 Z" fill="#facc15" />
                    <path d="M0,0 L0,80 C20,160 100,260 200,320 C280,370 340,440 400,500 L0,500 Z" fill="black" />
                </svg>

                <div className='w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-0 py-10 md:py-14 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0 relative z-10'>

                    {/* === Cột trái: Bản đồ trong khung tròn === */}
                    <div className='w-full lg:w-[30%] flex justify-center lg:justify-start items-center'>
                        <div className='w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-yellow-400 shadow-xl shadow-black/10 dark:shadow-yellow-400/10 flex-shrink-0'>
                            <LazyMap />
                        </div>
                    </div>

                    {/* === Cột giữa: Tên + Info liên hệ === */}
                    <div className='w-full lg:w-[40%]'>
                        <div className='mb-5 md:mb-6'>
                            <h3 className='text-lg md:text-xl font-bold text-white dark:text-white uppercase tracking-wide'>
                                Tranh Đèn Ngủ <span className='text-amber-900 dark:text-yellow-400'>3D Tráng Gương</span>
                            </h3>
                            <p className='text-amber-100/70 dark:text-gray-400 text-sm mt-1'>Đèn ngủ cao cấp — Nâng tầm giấc ngủ Việt</p>
                        </div>

                        {/* Contact grid 2 cột */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white/90 dark:text-gray-300'>
                                    <p>(+84)969 608 810</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white/90 dark:text-gray-300'>
                                    <p>Khongthaydoi124@gmail.com</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white/90 dark:text-gray-300'>
                                    <p>A2 Vĩnh Hồ, Thịnh Quang,</p>
                                    <p>Đống Đa, Hà Nội</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-yellow-400 mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white/90 dark:text-gray-300'>
                                    <p>CapyLumine.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Links hỗ trợ */}
                        <div className='mt-6 pt-5 border-t border-amber-400/30 dark:border-gray-800'>
                            <h4 className='text-sm font-semibold text-amber-900 dark:text-yellow-400 mb-3 uppercase tracking-wider'>Hỗ trợ khách hàng</h4>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2'>
                                {[
                                    { text: 'Giới thiệu', href: '/ho-tro/gioi-thieu' },
                                    { text: 'Bảo hành sản phẩm', href: '/ho-tro/bao-hanh' },
                                    { text: 'Hướng dẫn sử dụng', href: '/ho-tro/huong-dan-su-dung' },
                                    { text: 'Vận chuyển & thanh toán', href: '/ho-tro/van-chuyen-thanh-toan' },
                                    { text: 'Hướng dẫn chọn mua', href: '/ho-tro/huong-dan-chon-mua' },
                                    { text: 'Chính sách đổi trả', href: '/ho-tro/chinh-sach-doi-tra' },
                                ].map((item, i) => (
                                    <a key={i} href={item.href} className='text-xs text-white/70 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-300 flex items-center gap-2'>
                                        <i className='bx bx-chevron-right text-amber-800/50 dark:text-yellow-400/50'></i>
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
                            <div className='text-2xl md:text-3xl font-extrabold text-white dark:text-white tracking-tight'>
                                Capy<span className='text-amber-900 dark:text-yellow-400'>Lumine</span><span className='text-amber-200/60 dark:text-gray-500 text-lg'>.com</span>
                            </div>
                            <p className='text-amber-200/50 dark:text-gray-500 text-xs mt-1 tracking-widest uppercase'>Premium CapyLumine</p>
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
                                    className='w-10 h-10 rounded-full border border-white/30 dark:border-gray-700 flex items-center justify-center text-white/60 dark:text-gray-400 transition-all duration-300 hover:text-white hover:border-white dark:hover:text-yellow-400 dark:hover:border-yellow-400 hover:-translate-y-1'
                                >
                                    <i className={`bx ${social.icon} text-lg`}></i>
                                </a>
                            ))}
                        </div>

                        {/* Decorative dots */}
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full bg-amber-400/40 dark:bg-gray-800 border border-amber-400/30 dark:border-gray-700'></span>
                            <span className='w-4 h-4 rounded-full bg-amber-400/40 dark:bg-gray-800 border border-amber-400/30 dark:border-gray-700'></span>
                            <span className='w-4 h-4 rounded-full bg-white dark:bg-yellow-400'></span>
                        </div>
                    </div>
                </div>

                {/* === Bottom S-curve wave — Light mode === */}
                <svg className='absolute bottom-0 left-0 w-full pointer-events-none dark:hidden' style={{ height: '80px' }} viewBox="0 0 1440 80" preserveAspectRatio="none">
                    <path d="M800,80 C850,80 900,70 950,55 C1050,25 1150,5 1250,15 C1350,25 1400,50 1440,60 L1440,80 Z" fill="#92400e" />
                    <path d="M850,80 C900,80 950,72 1000,60 C1100,35 1200,18 1300,25 C1380,30 1420,45 1440,55 L1440,80 Z" fill="#d97706" />
                </svg>
                {/* === Bottom S-curve wave — Dark mode === */}
                <svg className='absolute bottom-0 left-0 w-full pointer-events-none hidden dark:block' style={{ height: '80px' }} viewBox="0 0 1440 80" preserveAspectRatio="none">
                    <path d="M800,80 C850,80 900,70 950,55 C1050,25 1150,5 1250,15 C1350,25 1400,50 1440,60 L1440,80 Z" fill="#facc15" />
                    <path d="M850,80 C900,80 950,72 1000,60 C1100,35 1200,18 1300,25 C1380,30 1420,45 1440,55 L1440,80 Z" fill="#111" />
                </svg>
            </div>

            {/* Copyright bar */}
            <div className='w-full py-4 bg-amber-900 dark:bg-[#111]'>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-2 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0'>
                    <div className='text-xs md:text-sm text-amber-100 dark:text-gray-400 text-center'>
                        © 2024 | Bản quyền thuộc về <span className='text-white dark:text-yellow-400 font-semibold'>CapyLumine.com</span>
                    </div>
                    <div className='flex items-center gap-4 text-amber-200 dark:text-gray-400 text-xs'>
                        <a href='/ho-tro/dieu-khoan-su-dung' className='hover:text-white dark:hover:text-gray-200 transition-colors'>Điều khoản</a>
                        <span>•</span>
                        <a href='/ho-tro/chinh-sach-bao-mat' className='hover:text-white dark:hover:text-gray-200 transition-colors'>Chính sách</a>
                        <span>•</span>
                        <a href='#' className='hover:text-white dark:hover:text-gray-200 transition-colors'>Liên hệ</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer