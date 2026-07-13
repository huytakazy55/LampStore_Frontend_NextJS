"use client";

import React, { useState } from 'react'

const TopBar = () => {
    const [showMap, setShowMap] = useState(false);
    const [showFbConfirm, setShowFbConfirm] = useState(false);

    return (
        <div className='h-8 md:h-10 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-transparent transition-colors duration-300'>
            <nav className='xl:mx-auto xl:max-w-[1440px] flex justify-between items-center h-full px-4 xl:px-0 text-[10px] md:text-xs font-medium tracking-wide'>
                <div className='flex items-center gap-4 md:gap-8'>
                    <div className='flex items-center gap-1.5 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors group relative' onClick={() => setShowMap(true)}>
                        <i className='bx bx-map text-sm'></i>
                        <span className='hidden sm:inline'>A2 Vĩnh Hồ, Thịnh Quang, Đống Đa, Hà Nội</span>
                        <span className='sm:hidden'>A2 Vĩnh Hồ, Hà Nội</span>
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">Xem bản đồ cửa hàng</span>
                    </div>
                    <a href="tel:0969608810" className='flex items-center gap-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer group relative no-underline text-inherit'>
                        <i className='bx bx-phone text-sm'></i>
                        <span>(+84) 969 608 810</span>
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">Gọi Hotline mua hàng</span>
                    </a>
                </div>

                <div className='flex items-center gap-4 md:gap-6'>
                    <button onClick={() => setShowFbConfirm(true)} className='hidden sm:block hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase cursor-pointer bg-transparent border-none p-0 text-[10px] md:text-xs font-medium tracking-wide group relative'>
                        Facebook
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100] normal-case">Theo dõi Facebook CapyLumine</span>
                    </button>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('openZaloQr'))} className='hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase cursor-pointer bg-transparent border-none p-0 text-[10px] md:text-xs font-medium tracking-wide tooltip-trigger relative group'>
                        Zalo
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100] normal-case">Mã QR Zalo</span>
                    </button>
                    <div className='flex items-center gap-1.5 ml-2 cursor-pointer group relative'>
                        <img src="https://flagcdn.com/w20/vn.png" alt="VN" className='w-4 h-[11px] object-cover rounded-[1px]' />
                        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-gray-700 opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 z-[100]">Ngôn ngữ: Tiếng Việt</span>
                    </div>
                </div>
            </nav>

            {/* Google Map Popup */}
            {showMap && (
                <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity' onClick={() => setShowMap(false)}>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl w-[95%] max-w-6xl h-[60vh] md:h-[70vh] p-5 relative shadow-2xl scale-100 transition-transform' onClick={(e) => e.stopPropagation()}>
                        <button
                            className='absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors z-10'
                            onClick={() => setShowMap(false)}
                            title='Đóng bản đồ'
                        >
                            <i className='bx bx-x text-xl'></i>
                        </button>
                        <h3 className='text-lg md:text-xl font-bold mb-4 flex items-center gap-2 bg-primary-600 dark:bg-primary-400 text-transparent bg-clip-text inline-block'>
                            <i className='bx bx-map text-2xl'></i> Vị trí Cửa hàng CapyLumine
                        </h3>
                        <div className='w-full h-[calc(100%-3.5rem)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700'>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1862.3516020899583!2d105.8194656114243!3d21.004531067309728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad3745ecd1cd%3A0x7d736e82eec7e4ea!2sPaimon%20Shop!5e0!3m2!1svi!2s!4v1783758217361!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Facebook Confirm Popup */}
            {showFbConfirm && (
                <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity' onClick={() => setShowFbConfirm(false)}>
                    <div className='bg-white dark:bg-gray-800 rounded-xl w-[90%] max-w-sm p-6 relative shadow-2xl' onClick={(e) => e.stopPropagation()}>
                        <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-3'>
                            Chuyển hướng
                        </h3>
                        <p className='text-gray-600 dark:text-gray-300 text-sm mb-6'>
                            Bạn có muốn chuyển hướng sang trang Facebook của Capy Lumine không?
                        </p>
                        <div className='flex justify-end gap-3'>
                            <button 
                                className='px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors cursor-pointer border-none'
                                onClick={() => setShowFbConfirm(false)}
                            >
                                Huỷ
                            </button>
                            <a 
                                href="https://www.facebook.com/profile.php?id=61592105631152"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-medium transition-colors cursor-pointer no-underline flex items-center'
                                onClick={() => setShowFbConfirm(false)}
                            >
                                Đồng ý
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TopBar