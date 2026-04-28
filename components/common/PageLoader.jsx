"use client";

/**
 * PageLoader — Premium animated loading indicator.
 * Capybara-themed orbiting dots animation with glow effect.
 * No text, purely visual.
 */
const PageLoader = ({ height = '60vh' }) => {
    return (
        <div className={`w-full flex justify-center items-center`} style={{ minHeight: height }}>
            <div className="relative w-20 h-20">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                        borderTopColor: '#f59e0b',
                        borderRightColor: '#f59e0b40',
                        animation: 'loaderSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                    }}
                />
                {/* Middle counter-rotating ring */}
                <div className="absolute inset-2 rounded-full border-2 border-transparent"
                    style={{
                        borderBottomColor: '#e11d48',
                        borderLeftColor: '#e11d4840',
                        animation: 'loaderSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse',
                        animationDelay: '-0.3s',
                    }}
                />
                {/* Inner pulsing core */}
                <div className="absolute inset-[14px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 40%, transparent 70%)',
                        animation: 'loaderPulse 1.5s ease-in-out infinite',
                    }}
                />
                {/* Orbiting dot 1 */}
                <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
                    style={{
                        top: '-4px', left: '50%', marginLeft: '-4px',
                        animation: 'loaderOrbit 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                        transformOrigin: '4px 44px',
                    }}
                />
                {/* Orbiting dot 2 */}
                <div className="absolute w-1.5 h-1.5 rounded-full bg-rose-400 shadow-lg shadow-rose-400/50"
                    style={{
                        bottom: '-3px', left: '50%', marginLeft: '-3px',
                        animation: 'loaderOrbit 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse',
                        animationDelay: '-0.6s',
                        transformOrigin: '3px -37px',
                    }}
                />

                <style jsx>{`
                    @keyframes loaderSpin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes loaderPulse {
                        0%, 100% { transform: scale(0.6); opacity: 0.4; }
                        50% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes loaderOrbit {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default PageLoader;
