"use client";

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled render error caught by ErrorBoundary:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        if (typeof window !== 'undefined') window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <i className="bx bx-error-circle text-6xl text-red-400 mb-4 inline-block"></i>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
                        Rất tiếc, trang gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cta-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-primary-200 hover:shadow-[0_8px_20px_rgba(234,88,12,0.45)]"
                        >
                            <i className="bx bx-refresh"></i>
                            Tải lại trang
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
}

export default ErrorBoundary;
