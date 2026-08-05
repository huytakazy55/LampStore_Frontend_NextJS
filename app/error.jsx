"use client";

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Route error boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                <i className="bx bx-error-circle text-6xl text-red-400 mb-4 inline-block"></i>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Đã có lỗi xảy ra</h2>
                <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
                    Rất tiếc, trang gặp sự cố không mong muốn. Vui lòng thử lại.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cta-600 text-white font-semibold rounded-lg hover:bg-cta-800 transition-all shadow-lg shadow-primary-200"
                    >
                        <i className="bx bx-refresh"></i>
                        Thử lại
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-primary-400 hover:text-primary-600 transition-all"
                    >
                        <i className="bx bx-home-alt"></i>
                        Về trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
}
