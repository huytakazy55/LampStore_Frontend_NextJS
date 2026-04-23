"use client";

import React, { useContext, useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Radio, Spin } from 'antd';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { ThemeContext } from '@/contexts/ThemeContext';

const { Title } = Typography;
const COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#84cc16', '#f59e0b', '#ef4444'];

const formatVND = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value?.toLocaleString('vi-VN') || '0';
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }}></span>
            {p.name}: <span className="font-bold">
              {p.dataKey === 'revenue' ? `${Number(p.value).toLocaleString('vi-VN')}₫` : p.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3 text-sm">
        <p className="font-semibold text-gray-700">{d.name}</p>
        <p style={{ color: d.payload.fill }}>Doanh số: <span className="font-bold">{Number(d.value).toLocaleString('vi-VN')}₫</span></p>
        {d.payload.orderCount !== undefined && (
          <p className="text-gray-500">Số đơn: <span className="font-bold">{d.payload.orderCount}</span></p>
        )}
      </div>
    );
  }
  return null;
};

const AnalyticChart = () => {
  const [timeRange, setTimeRange] = useState('daily');
  const [salesData, setSalesData] = useState({ dailySales: [], weeklySales: [], monthlySales: [] });
  const [loading, setLoading] = useState(true);
  const { themeColors } = useContext(ThemeContext);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
        const res = await fetch(`${API_ENDPOINT}/api/Analytics/sales-overview`);
        if (res.ok) {
          const data = await res.json();
          setSalesData({
            dailySales: data.dailySales?.$values || data.dailySales || [],
            weeklySales: data.weeklySales?.$values || data.weeklySales || [],
            monthlySales: data.monthlySales?.$values || data.monthlySales || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch sales data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const chartData = timeRange === 'daily' ? salesData.dailySales
    : timeRange === 'weekly' ? salesData.weeklySales
      : salesData.monthlySales;

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0, color: themeColors.EndColorLinear }}>
              Doanh số theo thời gian
            </Title>
            <Radio.Group value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <Radio.Button value="daily">Hàng ngày</Radio.Button>
              <Radio.Button value="weekly">Hàng tuần</Radio.Button>
              <Radio.Button value="monthly">Hàng tháng</Radio.Button>
            </Radio.Group>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]"><Spin size="large" /></div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={formatVND} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu (₫)"
                  stroke={themeColors.StartColorLinear || '#3b82f6'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: themeColors.StartColorLinear || '#3b82f6' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orderCount"
                  name="Số đơn"
                  stroke={themeColors.EndColorLinear || '#f97316'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Chưa có dữ liệu doanh số
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card>
          <Title level={4} style={{ margin: '0 0 16px 0', color: themeColors.EndColorLinear }}>
            Doanh số theo tháng
          </Title>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]"><Spin size="large" /></div>
          ) : salesData.monthlySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData.monthlySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesData.monthlySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Chưa có dữ liệu doanh số
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}

export default AnalyticChart;
