"use client";

import React, { useContext, useState } from 'react';
import { Card, Row, Col, Typography, Radio, Space } from 'antd';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';

const { Title } = Typography;

const dataDaily = [
  { name: 'Thứ Hai', sale1: 100, sale2: 400 },
  { name: 'Thứ Ba', sale1: 320, sale2: 310 },
  { name: 'Thứ Tư', sale1: 150, sale2: 310 },
  { name: 'Thứ Năm', sale1: 250, sale2: 210 },
  { name: 'Thứ Sáu', sale1: 120, sale2: 210 },
  { name: 'Thứ Bảy', sale1: 100, sale2: 210 },
  { name: 'Chủ Nhật', sale1: 420, sale2: 210 },
];

const dataWeekly = [
  { name: 'Week 1', sale1: 600, sale2: 800 },
  { name: 'Week 2', sale1: 700, sale2: 900 },
];

const dataMonthly = [
  { name: 'Tháng 1', sale1: 2000, sale2: 3500 },
  { name: 'Tháng 2', sale1: 4200, sale2: 2600 },
  { name: 'Tháng 3', sale1: 3100, sale2: 5600 },
  { name: 'Tháng 4', sale1: 1200, sale2: 4500 },
  { name: 'Tháng 5', sale1: 4000, sale2: 2600 },
  { name: 'Tháng 6', sale1: 2200, sale2: 3600 },
  { name: 'Tháng 7', sale1: 3200, sale2: 2600 },
  { name: 'Tháng 8', sale1: 3500, sale2: 5600 },
  { name: 'Tháng 9', sale1: 1200, sale2: 3600 },
  { name: 'Tháng 10', sale1: 3200, sale2: 2600 },
  { name: 'Tháng 11', sale1: 2200, sale2: 4600 },
  { name: 'Tháng 12', sale1: 4200, sale2: 5600 },
];

const dataTrafficByMonth = [
  { name: 'January', value: 400 },
  { name: 'February', value: 300 },
  { name: 'March', value: 300 },
  { name: 'April', value: 200 },
  { name: 'May', value: 278 },
  { name: 'June', value: 189 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF00A0', '#A000FF'];

const AnalyticChart = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('daily');
  const data = timeRange === 'daily' ? dataDaily : timeRange === 'weekly' ? dataWeekly : dataMonthly;
  const {themeColors} = useContext(ThemeContext);

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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sale1" 
                stroke={themeColors.StartColorLinear}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="sale2" 
                stroke={themeColors.EndColorLinear}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card>
          <Title level={4} style={{ margin: '0 0 16px 0', color: themeColors.EndColorLinear }}>
            Lưu lượng theo tháng
          </Title>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataTrafficByMonth}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataTrafficByMonth.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}

export default AnalyticChart;
