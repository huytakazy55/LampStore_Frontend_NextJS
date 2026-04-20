"use client";

import React, { useEffect, useState } from "react";
import ProductManage from "@/services/ProductManage";
import CategoryManage from "@/services/CategoryManage";

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

export default function AnalyticOverview() {
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    ProductManage.GetProduct()
      .then((res) => setProductCount(res.data.$values.length))
      .catch(() => { });
    CategoryManage.GetCategory()
      .then((res) => setCategoryCount(res.data.$values.length))
      .catch(() => { });
  }, []);

  const data = [
    {
      icon: icons.category,
      value: categoryCount,
      label: "Danh mục",
      percent: 33,
      percentType: "green",
      time: "trong 30 ngày",
    },
    {
      icon: icons.product,
      value: productCount,
      label: "Sản phẩm bán",
      percent: 33,
      percentType: "blue",
      time: "trong 30 ngày",
    },
    {
      icon: icons.order,
      value: 20,
      label: "Đơn vận chuyển",
      percent: 33,
      percentType: "yellow",
      time: "trong 30 ngày",
    },
    {
      icon: icons.user,
      value: 200,
      label: "Người dùng",
      percent: 21,
      percentType: "red",
      time: "trong 30 ngày",
    },
  ];

  return (
    <div className="flex flex-wrap gap-6 bg-[#f6f8fc] p-6">
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
            <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold ${percentColor[item.percentType]}`}>              {item.percent}% <span>↑</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}