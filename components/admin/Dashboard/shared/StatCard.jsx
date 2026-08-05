"use client";

import React from 'react';

// Canonical color set for admin dashboard stat cards — previously each page (Analytics,
// AnalyticOverview, Orders, Delivery, Chat) redefined its own copy of this map inline,
// with slightly different color keys/omissions in each.
const COLOR_STYLES = {
    green: { border: 'border-green-400', iconBg: 'bg-green-100', iconText: 'text-green-500', badge: 'bg-green-100 text-green-500' },
    blue: { border: 'border-blue-400', iconBg: 'bg-blue-100', iconText: 'text-blue-500', badge: 'bg-blue-100 text-blue-500' },
    yellow: { border: 'border-primary-500', iconBg: 'bg-primary-50 dark:bg-primary-900/20', iconText: 'text-primary-500', badge: 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' },
    red: { border: 'border-red-400', iconBg: 'bg-red-100', iconText: 'text-red-500', badge: 'bg-red-100 text-red-500' },
    purple: { border: 'border-purple-400', iconBg: 'bg-purple-100', iconText: 'text-purple-500', badge: 'bg-purple-100 text-purple-500' },
    orange: { border: 'border-orange-400', iconBg: 'bg-orange-100', iconText: 'text-orange-500', badge: 'bg-orange-100 text-orange-500' },
    cyan: { border: 'border-cyan-400', iconBg: 'bg-cyan-100', iconText: 'text-cyan-500', badge: 'bg-cyan-100 text-cyan-500' },
    indigo: { border: 'border-indigo-400', iconBg: 'bg-indigo-100', iconText: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-500' },
};

export default function StatCard({
    icon,
    color = 'blue',
    value,
    label,
    percent,
    time,
    minWidth = '200px',
    valueClassName = 'text-2xl',
})
{
    const c = COLOR_STYLES[color] || COLOR_STYLES.blue;
    const hasBadge = percent !== undefined && percent !== null && percent !== '';

    return (
        <div
            className={`bg-white rounded-xl shadow-lg p-5 flex items-center flex-1 border-l-8 border-[1px] cursor-pointer ${c.border} hover:scale-[1.03] hover:shadow-2xl transition-all duration-200`}
            style={{ minWidth, background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)' }}
        >
            {icon && (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${c.iconBg} ${c.iconText}`}>
                    {icon}
                </div>
            )}
            <div className="ml-4">
                <div className={`${valueClassName} font-bold text-gray-800`}>{value}</div>
                <div className="text-gray-500 text-sm">{label}</div>
            </div>
            {hasBadge && (
                <div className="ml-auto flex flex-col items-end">
                    <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold ${c.badge}`}>
                        {percent}
                    </div>
                    {time && <div className="text-xs text-gray-400 mt-1">{time}</div>}
                </div>
            )}
        </div>
    );
}
