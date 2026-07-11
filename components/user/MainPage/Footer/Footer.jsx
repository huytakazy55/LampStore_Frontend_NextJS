"use client";

import React, { useState } from 'react'


const MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6778758888713!2d105.81908607604745!3d21.005545788574118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad5fb9812307%3A0x63c20c5aa29db56b!2zS2h1IHThuq1wIHRo4buDIEEyIHBo4buRIFbEqW5oIEjhu5MsIFRo4buLbmggUXVhbmcsIMSQ4buRbmcgxJBhLCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1svi!2s!4v1726261210365!5m2!1svi!2s";

const LazyMap = () =>
{
    const [loaded, setLoaded] = useState(false);
    return (
        <div className='relative w-full h-full'>
            {/* Placeholder button — always rendered to reserve space, hidden after load */}
            {!loaded && (
                <button
                    onClick={() => setLoaded(true)}
                    className='absolute inset-0 w-full h-full bg-primary-600/80 dark:bg-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary-700 dark:hover:bg-gray-700 transition-colors group z-10'
                    aria-label="Nhấn để xem bản đồ Google Maps"
                >
                    <i className='bx bx-map text-3xl text-white dark:text-primary-500 group-hover:scale-110 transition-transform' />
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

const Footer = () =>
{
    return (
        <footer style={{ contain: 'layout style', contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
            {/* Main Footer */}
            <div className='relative overflow-hidden bg-primary-600 dark:bg-black' style={{ minHeight: '380px' }}>
                {/* === Left Wave (Swoops under the map) — Light mode === */}
                <svg className='absolute top-0 left-0 w-full h-full pointer-events-none dark:hidden' viewBox="0 0 1440 500" preserveAspectRatio="none" fill="none">
                    {/* Outer wave */}
                    <path d="M 0,80 C 120,250 250,480 600,500 L 0,500 Z" className="fill-primary-700/40" />
                    {/* Inner wave */}
                    <path d="M 0,180 C 100,320 200,490 450,500 L 0,500 Z" className="fill-primary-500/50" />
                </svg>

                {/* === Left Wave — Dark mode === */}
                <svg className='absolute top-0 left-0 w-full h-full pointer-events-none hidden dark:block' viewBox="0 0 1440 500" preserveAspectRatio="none" fill="none">
                    {/* Outer wave */}
                    <path d="M 0,80 C 120,250 250,480 600,500 L 0,500 Z" className="fill-primary-800/40" />
                    {/* Inner wave */}
                    <path d="M 0,180 C 100,320 200,490 450,500 L 0,500 Z" className="fill-primary-600/30" />
                </svg>

                <div className='w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-0 py-10 md:py-14 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0 relative z-10'>

                    {/* === Cột trái: Bản đồ trong khung tròn === */}
                    <div className='w-full lg:w-[30%] flex justify-center lg:justify-start items-center'>
                        <div className='w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-primary-500 shadow-xl shadow-black/10 dark:shadow-secondary-400/10 flex-shrink-0'>
                            <LazyMap />
                        </div>
                    </div>

                    {/* === Cột giữa: Tên + Info liên hệ === */}
                    <div className='w-full lg:w-[40%]'>
                        <div className='mb-5 md:mb-6'>
                            <h3 className='text-lg md:text-xl font-bold text-white dark:text-white uppercase tracking-wide'>
                                CapyLumine
                            </h3>
                            <p className='text-white dark:text-white text-sm mt-1 font-semibold'>Đèn ngủ & Đèn trang trí</p>
                            <p className='text-gray-200 dark:text-gray-300 text-xs mt-2 leading-relaxed'>
                                Mang đến những sản phẩm chiếu sáng đẹp, tiện ích và giàu cảm xúc cho không gian sống.
                            </p>
                        </div>

                        {/* Contact grid 2 cột */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-white mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white dark:text-white'>
                                    <p>(+84)969 608 810</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-white mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white dark:text-white'>
                                    <p>support@capylumine.com</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-white mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white dark:text-white'>
                                    <p>A2 Vĩnh Hồ, Thịnh Quang,</p>
                                    <p>Đống Đa, Hà Nội</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <span className='w-2 h-2 rounded-full bg-white dark:bg-white mt-[7px] flex-shrink-0'></span>
                                <div className='text-sm text-white dark:text-white'>
                                    <p>capylumine.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Links hỗ trợ */}
                        <div className='mt-6 pt-5 border-t border-primary-400/30 dark:border-gray-800'>
                            <h4 className='text-sm font-semibold text-white dark:text-white mb-3 uppercase tracking-wider'>Hỗ trợ khách hàng</h4>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2'>
                                {[
                                    { text: 'Giới thiệu', href: '/ho-tro/gioi-thieu' },
                                    { text: 'Bảo hành sản phẩm', href: '/ho-tro/bao-hanh' },
                                    { text: 'Hướng dẫn sử dụng', href: '/ho-tro/huong-dan-su-dung' },
                                    { text: 'Vận chuyển & thanh toán', href: '/ho-tro/van-chuyen-thanh-toan' },
                                    { text: 'Hướng dẫn chọn mua', href: '/ho-tro/huong-dan-chon-mua' },
                                    { text: 'Chính sách đổi trả', href: '/ho-tro/chinh-sach-doi-tra' },
                                ].map((item, i) => (
                                    <a key={i} href={item.href} className='text-xs text-white dark:text-white hover:text-gray-200 dark:hover:text-gray-200 transition-colors duration-300 flex items-center gap-2'>
                                        <i className='bx bx-chevron-right text-white dark:text-white'></i>
                                        {item.text}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* === Cột phải: Logo + Social === */}
                    <div className='w-full lg:w-[30%] flex flex-col items-center lg:items-end'>
                        {/* Logo & Text matching screenshot_9 */}
                        <div className='flex items-center gap-3.5 mb-6 lg:justify-end'>
                            <div className='w-20 h-20 md:w-[88px] md:h-[88px] rounded-2xl overflow-hidden shadow-lg flex-shrink-0'>
                                <img src='/images/Capylumine-sm.png' alt="CapyLumine" className='w-full h-full object-cover' />
                            </div>
                            <div className='flex flex-col mt-2 md:mt-4'>
                                <div className={`text-[24px] md:text-[32px] font-extrabold tracking-tight font-sans leading-none mb-1 flex items-center ml-1`}>
                                    <span className='text-[#4631a3]'>Capy</span>
                                    <span className='text-[#9328f5]'>Lum</span>
                                    <span className='relative inline-block'>
                                        <span className='text-[#9328f5] relative z-10'>ı</span>
                                        {/* Sparkle as dot */}
                                        <span className="absolute top-[1px] left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center">
                                            <svg className="relative w-1.5 h-1.5 md:w-2 md:h-2 text-[#ffce54]" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                                            </svg>
                                        </span>
                                    </span>
                                    <span className='text-[#9328f5]'>ne</span>
                                </div>
                                
                                <div className='flex items-center ml-1'>
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-[#ffce54] drop-shadow-[0_0_6px_rgba(255,206,84,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M21.996 12.882A10.016 10.016 0 0 1 12 2.004c0-.28.026-.554.07-.822A9.99 9.99 0 0 0 2 11.996 9.99 9.99 0 0 0 12 21.99 9.99 9.99 0 0 0 21.996 12.882z" />
                                        </svg>
                                        <svg className="absolute top-[2px] right-[2px] w-2 h-2 text-[#fff2a8]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                                        </svg>
                                        <svg className="absolute -bottom-1 -right-2.5 w-2.5 h-2.5 text-[#ffce54]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                                        </svg>
                                    </div>
                                    <div className='text-[12px] md:text-[14px] text-[#ffce54] font-extrabold tracking-tighter uppercase leading-none ml-1.5 md:ml-2' style={{ fontFamily: 'sans-serif' }}>
                                        DREAMY NIGHT LIGHTS
                                    </div>
                                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#ffce54] ml-1 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C12 0 12 10 24 12C12 14 12 24 12 24C12 24 12 14 0 12C12 10 12 0 12 0Z" />
                                    </svg>
                                </div>
                            </div>
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
                                    className='w-10 h-10 rounded-full border border-white dark:border-white flex items-center justify-center text-white dark:text-white transition-all duration-300 hover:text-gray-200 hover:border-gray-200 dark:hover:text-gray-200 dark:hover:border-gray-200 hover:-translate-y-1'
                                >
                                    <i className={`bx ${social.icon} text-lg`}></i>
                                </a>
                            ))}
                        </div>

                        {/* Decorative dots */}
                        <div className='flex items-center gap-2'>
                            <span className='w-4 h-4 rounded-full bg-white/40 dark:bg-white/40 border border-white/30 dark:border-white/30'></span>
                            <span className='w-4 h-4 rounded-full bg-white/40 dark:bg-white/40 border border-white/30 dark:border-white/30'></span>
                            <span className='w-4 h-4 rounded-full bg-white dark:bg-white'></span>
                        </div>
                    </div>
                </div>

                {/* === Bottom S-curve wave — Light mode === */}
                <svg className='absolute bottom-0 left-0 w-full pointer-events-none dark:hidden' style={{ height: '80px' }} viewBox="0 0 1440 80" preserveAspectRatio="none">
                    <path d="M800,80 C850,80 900,70 950,55 C1050,25 1150,5 1250,15 C1350,25 1400,50 1440,60 L1440,80 Z" className="fill-primary-800" />
                    <path d="M850,80 C900,80 950,72 1000,60 C1100,35 1200,18 1300,25 C1380,30 1420,45 1440,55 L1440,80 Z" className="fill-primary-500" />
                </svg>

                <svg className='absolute bottom-0 left-0 w-full pointer-events-none hidden dark:block' style={{ height: '80px' }} viewBox="0 0 1440 80" preserveAspectRatio="none">
                    <path d="M800,80 C850,80 900,70 950,55 C1050,25 1150,5 1250,15 C1350,25 1400,50 1440,60 L1440,80 Z" className="fill-tertiary-400" />
                    <path d="M850,80 C900,80 950,72 1000,60 C1100,35 1200,18 1300,25 C1380,30 1420,45 1440,55 L1440,80 Z" className="fill-[#111]" />
                </svg>
            </div>

            {/* Copyright bar */}
            <div className='w-full py-4 bg-primary-900 dark:bg-[#111]'>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-2 xl:mx-auto xl:max-w-[1440px] px-6 xl:px-0'>
                    <div className='text-xs md:text-sm text-white dark:text-white text-center'>
                        © 2026 | Bản quyền thuộc về <span className='text-white dark:text-white font-semibold'>CapyLumine</span>
                    </div>
                    <div className='flex items-center gap-4 text-white dark:text-white text-xs'>
                        <a href='/ho-tro/dieu-khoan-su-dung' className='hover:text-gray-200 dark:hover:text-gray-200 transition-colors'>Điều khoản</a>
                        <span>•</span>
                        <a href='/ho-tro/chinh-sach-bao-mat' className='hover:text-gray-200 dark:hover:text-gray-200 transition-colors'>Chính sách</a>
                        <span>•</span>
                        <a href='#' className='hover:text-gray-200 dark:hover:text-gray-200 transition-colors'>Liên hệ</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer