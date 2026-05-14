"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Select, Spin, Table, Tag, Tooltip } from "antd";
import { EnvironmentOutlined, GlobalOutlined, ReloadOutlined } from "@ant-design/icons";
import axiosInstance from "@/services/axiosConfig";

const normalizeList = (value) => value?.$values || value || [];

const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default function VisitorMapPage() {
    const [data, setData] = useState(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLocations = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await axiosInstance.get(`/api/Analytics/visitor-locations?days=${days}&limit=100`);
            setData({
                ...res.data,
                locations: normalizeList(res.data?.locations),
                ipVisits: normalizeList(res.data?.ipVisits),
            });
        } catch (err) {
            console.error("Failed to fetch visitor locations", err);
            setError("Không tải được dữ liệu vị trí truy cập. Kiểm tra backend hoặc kết nối tới dịch vụ IP geolocation.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [days]);

    const locations = data?.locations || [];
    const maxVisits = useMemo(
        () => Math.max(1, ...locations.map((item) => item.visitCount || 0)),
        [locations]
    );

    const ipColumns = [
        {
            title: "IP",
            dataIndex: "ipAddress",
            width: 140,
            render: (text, record) => (
                <div className="font-mono text-xs text-gray-700">
                    {text}
                    {!record.isPublicIp && <Tag className="ml-2" color="default">local</Tag>}
                </div>
            ),
        },
        {
            title: "Khu vực",
            render: (_, record) => {
                const location = [record.city, record.region, record.country].filter(Boolean).join(", ");
                return location || <span className="text-gray-400">Chưa xác định</span>;
            },
        },
        {
            title: "ISP",
            dataIndex: "isp",
            render: (text) => text || <span className="text-gray-400">-</span>,
        },
        {
            title: "Lượt",
            dataIndex: "visitCount",
            width: 90,
            align: "right",
            render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
        },
        {
            title: "Khách",
            dataIndex: "uniqueVisitors",
            width: 90,
            align: "right",
        },
        {
            title: "Truy cập gần nhất",
            dataIndex: "lastVisit",
            width: 170,
            render: formatDate,
        },
    ];

    return (
        <div className="p-6 bg-[#f6f8fc] min-h-full">
            <div className="admin-table-card">
                <div className="admin-title-bar" style={{ padding: "24px 24px 16px" }}>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-3">
                            <GlobalOutlined className="text-blue-600" />
                            Bản đồ truy cập
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 mb-0">
                            Tổng hợp IP đã ghi nhận và quy đổi thành khu vực trong {days} ngày gần nhất.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={days}
                            onChange={setDays}
                            style={{ width: 150 }}
                            options={[
                                { value: 7, label: "7 ngày" },
                                { value: 30, label: "30 ngày" },
                                { value: 90, label: "90 ngày" },
                                { value: 365, label: "365 ngày" },
                            ]}
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchLocations} loading={loading}>
                            Làm mới
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="px-6 pb-4">
                        <Alert type="warning" showIcon message={error} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 pb-6">
                    {[
                        ["IP đã ghi nhận", data?.totalIpCount || 0, "bg-blue-50 text-blue-600"],
                        ["IP định vị được", data?.resolvedIpCount || 0, "bg-green-50 text-green-600"],
                        ["IP nội bộ", data?.privateIpCount || 0, "bg-gray-50 text-gray-600"],
                        ["Chưa định vị", data?.unresolvedIpCount || 0, "bg-amber-50 text-amber-600"],
                    ].map(([label, value, color]) => (
                        <div key={label} className="bg-white border border-gray-100 rounded-lg p-4">
                            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                                <EnvironmentOutlined />
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{value.toLocaleString("vi-VN")}</div>
                            <div className="text-sm text-gray-500">{label}</div>
                        </div>
                    ))}
                </div>

                <div className="px-6 pb-6">
                    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 h-[460px]">
                        <div className="absolute inset-0 visitor-map-grid" />
                        <div className="absolute inset-0 visitor-map-land" />

                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                <Spin size="large" tip="Đang quy đổi IP sang vị trí..." />
                            </div>
                        ) : locations.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/85">
                                <Empty description="Chưa có IP public nào định vị được" />
                            </div>
                        ) : (
                            locations.map((item, index) => {
                                const left = ((Number(item.longitude) + 180) / 360) * 100;
                                const top = ((90 - Number(item.latitude)) / 180) * 100;
                                const size = 18 + Math.sqrt((item.visitCount || 1) / maxVisits) * 34;
                                const title = [item.city, item.region, item.country].filter(Boolean).join(", ");

                                return (
                                    <Tooltip
                                        key={`${item.latitude}-${item.longitude}-${index}`}
                                        title={`${title || "Không rõ khu vực"} - ${item.visitCount} lượt / ${item.uniqueVisitors} khách`}
                                    >
                                        <div
                                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 bg-blue-500/80 shadow-[0_0_28px_rgba(59,130,246,0.55)] cursor-pointer"
                                            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                                        >
                                            <div className="absolute inset-0 rounded-full animate-ping bg-blue-300/40" />
                                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                                                {item.visitCount}
                                            </span>
                                        </div>
                                    </Tooltip>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="admin-table-wrapper" style={{ padding: "0 24px 24px" }}>
                    <Table
                        columns={ipColumns}
                        dataSource={(data?.ipVisits || []).map((item, index) => ({ ...item, key: item.rawIpAddress || index }))}
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 900 }}
                    />
                </div>
            </div>

            <style jsx>{`
                .visitor-map-grid {
                    background-image:
                        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
                    background-size: 8.333% 16.666%;
                }

                .visitor-map-land {
                    opacity: 0.82;
                    background:
                        radial-gradient(ellipse at 22% 34%, rgba(34,197,94,0.38) 0 12%, transparent 12.5%),
                        radial-gradient(ellipse at 31% 57%, rgba(34,197,94,0.32) 0 10%, transparent 10.5%),
                        radial-gradient(ellipse at 50% 38%, rgba(34,197,94,0.34) 0 15%, transparent 15.5%),
                        radial-gradient(ellipse at 67% 43%, rgba(34,197,94,0.36) 0 18%, transparent 18.5%),
                        radial-gradient(ellipse at 78% 68%, rgba(34,197,94,0.32) 0 8%, transparent 8.5%);
                }
            `}</style>
        </div>
    );
}
