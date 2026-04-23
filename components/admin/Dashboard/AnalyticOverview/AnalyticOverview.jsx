"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const icons = {
  user: (
    <div className="bg-red-100 p-3 rounded-full">
      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a4 4 0 00-3-3.87" />
        <path d="M9 20H4v-2a4 4 0 013-3.87" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  ),
  category: (
    <div className="bg-green-100 p-3 rounded-full">
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    </div>
  ),
  product: (
    <div className="bg-blue-100 p-3 rounded-full">
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 7l9-4 9 4M4 10v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
        <path d="M12 21V9" />
      </svg>
    </div>
  ),
  order: (
    <div className="bg-yellow-100 p-3 rounded-full">
      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2" />
        <path d="M21 17V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10" />
      </svg>
    </div>
  ),
};

const percentColor = {
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-500",
  blue: "bg-blue-100 text-blue-600",
  yellow: "bg-yellow-100 text-yellow-600",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }}></span>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticOverview() {
  const [stats, setStats] = useState({
    siteVisits: 0,
    uniqueVisits30Days: 0,
    productCount: 0,
    categoryCount: 0,
    orderCount: 0,
    topProducts: [],
    dailyVisits: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
        const res = await fetch(`${API_ENDPOINT}/api/Analytics/overview`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            siteVisits: data.siteVisits || 0,
            uniqueVisits30Days: data.uniqueVisits30Days || 0,
            productCount: data.productCount || 0,
            categoryCount: data.categoryCount || 0,
            orderCount: data.orderCount || 0,
            topProducts: data.topProducts?.$values || data.topProducts || [],
            dailyVisits: data.dailyVisits?.$values || data.dailyVisits || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchAnalytics();
  }, []);

  const data = [
    {
      icon: icons.category,
      value: stats.categoryCount,
      label: "Danh mục",
      percent: 100,
      percentType: "green",
      time: "Tất cả",
    },
    {
      icon: icons.product,
      value: stats.productCount,
      label: "Sản phẩm",
      percent: 100,
      percentType: "blue",
      time: "Tất cả",
    },
    {
      icon: icons.order,
      value: stats.orderCount,
      label: "Tổng Đơn",
      percent: 100,
      percentType: "yellow",
      time: "Tất cả",
    },
    {
      icon: icons.user,
      value: stats.siteVisits,
      label: "Lượt truy cập",
      percent: stats.uniqueVisits30Days,
      percentType: "red",
      time: "Người dùng (30 ngày)",
    },
  ];

  return (
    <div className="flex flex-col gap-6 bg-[#f6f8fc] p-6">
      {/* Stat Cards */}
      <div className="flex flex-wrap gap-6">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`
              bg-white rounded-xl shadow-lg 
              p-5 flex items-center min-w-[220px] flex-1
              border-l-8 border-[1px] cursor-pointer
              ${item.percentType === "green" ? "border-green-400" : ""}
              ${item.percentType === "blue" ? "border-blue-400" : ""}
              ${item.percentType === "yellow" ? "border-yellow-400" : ""}
              ${item.percentType === "red" ? "border-red-400" : ""}
              hover:scale-[1.03] hover:shadow-2xl transition-all duration-200
            `}
            style={{ background: "linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)" }}
          >
            {item.icon}
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-800">{item.value.toLocaleString()}</div>
              <div className="text-gray-500 text-sm">{item.label}</div>
            </div>
            <div className="ml-auto flex flex-col items-end">
              <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold ${percentColor[item.percentType]}`}>
                {item.percent} <span>U</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{item.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visits Area Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Lượt Truy Cập</h3>
              <p className="text-sm text-gray-400">30 ngày gần nhất</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Tổng lượt</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Khách</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> SP xem</span>
            </div>
          </div>
          {stats.dailyVisits.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.dailyVisits} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProduct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="visits" name="Tổng lượt" stroke="#3b82f6" fill="url(#colorVisits)" strokeWidth={2} />
                <Area type="monotone" dataKey="uniqueVisitors" name="Khách" stroke="#22c55e" fill="url(#colorUnique)" strokeWidth={2} />
                <Area type="monotone" dataKey="productViews" name="SP xem" stroke="#8b5cf6" fill="url(#colorProduct)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              <div className="text-center">
                <i className="bx bx-line-chart text-4xl mb-2 block"></i>
                Chưa có dữ liệu truy cập
              </div>
            </div>
          )}
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Top Sản Phẩm Được Xem</h3>
              <p className="text-sm text-gray-400">Sản phẩm nổi bật 30 ngày</p>
            </div>
          </div>
          {stats.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.topProducts.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  {['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'].map((color, i) => (
                    <linearGradient key={i} id={`barColor${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                      <stop offset="100%" stopColor={color} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  width={130}
                  tickFormatter={(val) => val.length > 18 ? val.substring(0, 18) + '…' : val}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="viewCount"
                  name="Lượt xem"
                  radius={[0, 8, 8, 0]}
                  barSize={22}
                >
                  {stats.topProducts.slice(0, 6).map((_, index) => {
                    const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'];
                    return <Cell key={index} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              <div className="text-center">
                <i className="bx bx-bar-chart-alt-2 text-4xl mb-2 block"></i>
                Chưa có dữ liệu sản phẩm
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}