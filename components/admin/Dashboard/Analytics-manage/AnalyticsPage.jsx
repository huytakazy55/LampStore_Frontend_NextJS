"use client";

import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Spin, Row, Col, Statistic, Space } from "antd";
import { RiseOutlined, UserOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

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
                        topPaths: data.topPaths?.$values || data.topPaths || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const columns = [
        {
            title: 'Top',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => <span className="font-bold text-gray-500">#{index + 1}</span>,
            width: 80,
        },
        {
            title: 'Tên Sản Phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-semibold text-gray-800">{text || 'Không xác định'}</span>,
        },
        {
            title: 'Lượt Xem (30 Ngày)',
            dataIndex: 'viewCount',
            key: 'viewCount',
            render: (views) => (
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold border border-blue-100 flex items-center gap-1 w-max">
                    <EyeOutlined /> {views} views
                </span>
            ),
            align: 'right',
        },
    ];

    if (loading || !stats) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Spin size="large" tip="Đang tải dữ liệu phân tích..." />
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f6f8fc] min-h-full">
            <div className="mb-6 flex items-center justify-between">
                <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                    Phân Tích Chi Tiết
                </Title>
            </div>

            <div className="flex flex-wrap gap-6 mb-8">
                {[
                    {
                        icon: (
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-2xl">
                                <i className="bx bxs-group"></i>
                            </div>
                        ),
                        value: stats.siteVisits,
                        label: "Tổng Lượt Truy Cập",
                        percent: 100,
                        percentType: "green",
                        time: "Tất cả",
                    },
                    {
                        icon: (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl">
                                <i className="bx bx-user-circle"></i>
                            </div>
                        ),
                        value: stats.uniqueVisits30Days,
                        label: "Khách Truy Cập (30 Ngày)",
                        percent: stats.uniqueVisits30Days,
                        percentType: "blue",
                        time: "30 Ngày Qua",
                    },
                    {
                        icon: (
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-2xl">
                                <i className="bx bx-package"></i>
                            </div>
                        ),
                        value: stats.productCount,
                        label: "Sản Phẩm Đang Bán",
                        percent: "Tất cả",
                        percentType: "red",
                        time: "Tất cả",
                    }
                ].map((item, idx) => {
                    const percentColor = {
                        green: "bg-green-100 text-green-500",
                        blue: "bg-blue-100 text-blue-500",
                        yellow: "bg-yellow-100 text-yellow-500",
                        red: "bg-red-100 text-red-500",
                        purple: "bg-purple-100 text-purple-500",
                    };
                    return (
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
                              ${item.percentType === "purple" ? "border-purple-400" : ""}
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
                    );
                })}
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card
                        bordered={false}
                        className="shadow-sm rounded-xl"
                        title={<span className="text-lg font-bold text-gray-800">Sản phẩm Tuyển Chọn (Được Xem Nhiều Nhất)</span>}
                    >
                        <Table
                            columns={columns}
                            dataSource={stats.topProducts.map((p, i) => ({ ...p, key: p.id || i }))}
                            pagination={false}
                            rowClassName="hover:bg-gray-50 cursor-pointer"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        bordered={false}
                        className="shadow-sm rounded-xl"
                        title={<span className="text-lg font-bold text-gray-800">Trang Được Truy Cập Nhiều Nhất</span>}
                    >
                        <Table
                            columns={[
                                { title: 'Top', dataIndex: 'index', render: (text, record, index) => <span className="font-bold text-gray-500">#{index + 1}</span>, width: 60 },
                                { title: 'Đường Dẫn', dataIndex: 'path', render: (text) => <span className="text-gray-800 font-mono text-xs">{text}</span> },
                                { title: 'Lượt Xem', dataIndex: 'viewCount', render: (views) => <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-semibold border border-green-100 flex items-center gap-1 w-max"><EyeOutlined /> {views} views</span>, align: 'right', width: 140 }
                            ]}
                            dataSource={stats.topPaths.map((p, i) => ({ ...p, key: i }))}
                            pagination={false}
                            rowClassName="hover:bg-gray-50 cursor-pointer"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
