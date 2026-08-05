"use client";

import React, { useEffect, useState } from "react";
import AdminPageHeader from '../shared/AdminPageHeader';
import StatCard from '../shared/StatCard';
import { Table, Card, Spin, Row, Col, Statistic, Space } from "antd";
import { RiseOutlined, UserOutlined, ShopOutlined, EyeOutlined } from '@ant-design/icons';
import axiosInstance from '@/lib/axiosConfig';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await axiosInstance.get('/api/Analytics/overview');
                setStats({
                    siteVisits: data.siteVisits || 0,
                    uniqueVisits30Days: data.uniqueVisits30Days || 0,
                    productCount: data.productCount || 0,
                    categoryCount: data.categoryCount || 0,
                    orderCount: data.orderCount || 0,
                    topProducts: data.topProducts?.$values || data.topProducts || [],
                    topPaths: data.topPaths?.$values || data.topPaths || []
                });
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
        <div className="p-4 min-h-full">
            <AdminPageHeader
                title="Phân Tích Chi Tiết"
                breadcrumbItems={[
                    { title: 'Trang chủ' },
                    { title: 'Phân Tích Chi Tiết' }
                ]}
            />

            <div className="flex flex-wrap gap-6 mb-8">
                {[
                    {
                        icon: <i className="bx bxs-group"></i>,
                        color: "green",
                        value: stats.siteVisits.toLocaleString(),
                        label: "Tổng Lượt Truy Cập",
                        percent: <>100 <span>U</span></>,
                        time: "Tất cả",
                    },
                    {
                        icon: <i className="bx bx-user-circle"></i>,
                        color: "blue",
                        value: stats.uniqueVisits30Days.toLocaleString(),
                        label: "Khách Truy Cập (30 Ngày)",
                        percent: <>{stats.uniqueVisits30Days} <span>U</span></>,
                        time: "30 Ngày Qua",
                    },
                    {
                        icon: <i className="bx bx-package"></i>,
                        color: "purple",
                        value: stats.productCount.toLocaleString(),
                        label: "Sản Phẩm Đang Bán",
                        percent: "Tất cả",
                        time: "Tất cả",
                    }
                ].map((item, idx) => (
                    <StatCard key={idx} minWidth="220px" {...item} />
                ))}
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
