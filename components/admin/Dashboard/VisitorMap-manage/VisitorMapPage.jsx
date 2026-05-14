"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Empty, Select, Spin, Table, Tag, Tooltip } from "antd";
import { EnvironmentOutlined, GlobalOutlined, ReloadOutlined } from "@ant-design/icons";
import axiosInstance from "@/services/axiosConfig";

const normalizeList = (value) => value?.$values || value || [];
const TILE_SIZE = 256;

const clampLatitude = (lat) => Math.max(-85.05112878, Math.min(85.05112878, Number(lat)));

const latLngToPixel = (lat, lng, zoom) => {
    const sinLat = Math.sin((clampLatitude(lat) * Math.PI) / 180);
    const scale = TILE_SIZE * 2 ** zoom;

    return {
        x: ((Number(lng) + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
    };
};

const pixelToLatLng = (x, y, zoom) => {
    const scale = TILE_SIZE * 2 ** zoom;
    const lng = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return { lat: clampLatitude(lat), lng };
};

const getMapZoom = (locations) => {
    if (locations.length <= 1) return 5;

    const lats = locations.map((item) => Number(item.latitude));
    const lngs = locations.map((item) => Number(item.longitude));
    const latSpan = Math.max(...lats) - Math.min(...lats);
    const lngSpan = Math.max(...lngs) - Math.min(...lngs);
    const span = Math.max(latSpan, lngSpan);

    if (span > 120) return 2;
    if (span > 60) return 3;
    if (span > 25) return 4;
    if (span > 10) return 5;
    if (span > 4) return 6;
    if (span > 1) return 8;
    return 10;
};

const getDensityLevel = (visitCount, maxVisits) => {
    const ratio = maxVisits > 0 ? visitCount / maxVisits : 0;

    if (ratio >= 0.75) {
        return {
            label: "Rất nhiều",
            color: "bg-red-500/85",
            border: "border-red-100",
            glow: "shadow-[0_0_34px_rgba(239,68,68,0.62)]",
            ping: "bg-red-300/40",
        };
    }

    if (ratio >= 0.45) {
        return {
            label: "Nhiều",
            color: "bg-orange-500/85",
            border: "border-orange-100",
            glow: "shadow-[0_0_30px_rgba(249,115,22,0.58)]",
            ping: "bg-orange-300/40",
        };
    }

    if (ratio >= 0.18) {
        return {
            label: "Vừa",
            color: "bg-yellow-400/90",
            border: "border-yellow-50",
            glow: "shadow-[0_0_26px_rgba(234,179,8,0.52)]",
            ping: "bg-yellow-200/40",
        };
    }

    return {
        label: "Ít",
        color: "bg-blue-500/85",
        border: "border-blue-100",
        glow: "shadow-[0_0_22px_rgba(59,130,246,0.5)]",
        ping: "bg-blue-300/40",
    };
};

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
    const mapRef = useRef(null);
    const dragRef = useRef(null);
    const [data, setData] = useState(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
    const [mapView, setMapView] = useState(null);

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

    useEffect(() => {
        if (!mapRef.current) return;

        const updateSize = () => {
            const rect = mapRef.current.getBoundingClientRect();
            setMapSize({ width: rect.width, height: rect.height });
        };

        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(mapRef.current);

        return () => observer.disconnect();
    }, []);

    const locations = data?.locations || [];
    const defaultMapView = useMemo(() => {
        if (locations.length === 0) return null;

        const center = locations.reduce(
            (acc, item) => ({
                lat: acc.lat + Number(item.latitude),
                lng: acc.lng + Number(item.longitude),
            }),
            { lat: 0, lng: 0 }
        );

        return {
            lat: center.lat / locations.length,
            lng: center.lng / locations.length,
            zoom: getMapZoom(locations),
        };
    }, [locations]);

    useEffect(() => {
        if (defaultMapView) {
            setMapView(defaultMapView);
        }
    }, [defaultMapView]);

    const maxVisits = useMemo(
        () => Math.max(1, ...locations.map((item) => item.visitCount || 0)),
        [locations]
    );
    const mapState = useMemo(() => {
        if (!mapView || !mapSize.width || !mapSize.height) {
            return null;
        }

        const zoom = mapView.zoom;
        const centerPixel = latLngToPixel(mapView.lat, mapView.lng, zoom);
        const topLeft = {
            x: centerPixel.x - mapSize.width / 2,
            y: centerPixel.y - mapSize.height / 2,
        };
        const tileCount = 2 ** zoom;
        const minTileX = Math.floor(topLeft.x / TILE_SIZE);
        const maxTileX = Math.floor((topLeft.x + mapSize.width) / TILE_SIZE);
        const minTileY = Math.max(0, Math.floor(topLeft.y / TILE_SIZE));
        const maxTileY = Math.min(tileCount - 1, Math.floor((topLeft.y + mapSize.height) / TILE_SIZE));
        const tiles = [];

        for (let x = minTileX; x <= maxTileX; x++) {
            for (let y = minTileY; y <= maxTileY; y++) {
                const wrappedX = ((x % tileCount) + tileCount) % tileCount;
                tiles.push({
                    key: `${zoom}-${x}-${y}`,
                    url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
                    left: x * TILE_SIZE - topLeft.x,
                    top: y * TILE_SIZE - topLeft.y,
                });
            }
        }

        return { zoom, topLeft, tiles };
    }, [mapView, mapSize]);

    const updateZoom = (nextZoom, anchor = null) => {
        setMapView((current) => {
            if (!current) return current;

            const zoom = Math.max(2, Math.min(18, nextZoom));
            if (zoom === current.zoom) return current;

            if (!anchor || !mapState) {
                return { ...current, zoom };
            }

            const beforePixel = {
                x: mapState.topLeft.x + anchor.x,
                y: mapState.topLeft.y + anchor.y,
            };
            const anchorLatLng = pixelToLatLng(beforePixel.x, beforePixel.y, current.zoom);
            const anchorPixelAfterZoom = latLngToPixel(anchorLatLng.lat, anchorLatLng.lng, zoom);
            const centerPixelAfterZoom = {
                x: anchorPixelAfterZoom.x - anchor.x + mapSize.width / 2,
                y: anchorPixelAfterZoom.y - anchor.y + mapSize.height / 2,
            };
            const center = pixelToLatLng(centerPixelAfterZoom.x, centerPixelAfterZoom.y, zoom);

            return { ...center, zoom };
        });
    };

    const handleWheel = (event) => {
        if (!mapRef.current || !mapView) return;

        event.preventDefault();
        const rect = mapRef.current.getBoundingClientRect();
        updateZoom(mapView.zoom + (event.deltaY < 0 ? 1 : -1), {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };

    const handlePointerDown = (event) => {
        if (!mapState || !mapView) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startTopLeft: mapState.topLeft,
            zoom: mapView.zoom,
        };
    };

    const handlePointerMove = (event) => {
        if (!dragRef.current) return;

        const drag = dragRef.current;
        const centerPixel = {
            x: drag.startTopLeft.x - (event.clientX - drag.startX) + mapSize.width / 2,
            y: drag.startTopLeft.y - (event.clientY - drag.startY) + mapSize.height / 2,
        };
        const center = pixelToLatLng(centerPixel.x, centerPixel.y, drag.zoom);
        setMapView({ ...center, zoom: drag.zoom });
    };

    const handlePointerUp = (event) => {
        if (dragRef.current?.pointerId === event.pointerId) {
            dragRef.current = null;
        }
    };

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
                    <div
                        ref={mapRef}
                        className="relative overflow-hidden rounded-lg border border-slate-200 bg-[#dbe7f0] h-[460px] cursor-grab active:cursor-grabbing touch-none"
                        onWheel={handleWheel}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                <Spin size="large" tip="Đang quy đổi IP sang vị trí..." />
                            </div>
                        ) : locations.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/85">
                                <Empty description="Chưa có IP public nào định vị được" />
                            </div>
                        ) : (
                            <>
                                {mapState?.tiles.map((tile) => (
                                    <img
                                        key={tile.key}
                                        src={tile.url}
                                        alt=""
                                        draggable={false}
                                        className="absolute select-none"
                                        style={{
                                            left: tile.left,
                                            top: tile.top,
                                            width: TILE_SIZE,
                                            height: TILE_SIZE,
                                        }}
                                    />
                                ))}

                                {locations.map((item, index) => {
                                    if (!mapState) return null;

                                    const pixel = latLngToPixel(item.latitude, item.longitude, mapState.zoom);
                                    const left = pixel.x - mapState.topLeft.x;
                                    const top = pixel.y - mapState.topLeft.y;
                                    const visitCount = item.visitCount || 1;
                                    const ratio = visitCount / maxVisits;
                                    const size = 12 + Math.sqrt(ratio) * 50;
                                    const density = getDensityLevel(visitCount, maxVisits);
                                    const title = [item.city, item.region, item.country].filter(Boolean).join(", ");

                                    return (
                                        <Tooltip
                                            key={`${item.latitude}-${item.longitude}-${index}`}
                                            title={`${title || "Không rõ khu vực"} - ${density.label}: ${item.visitCount} lượt / ${item.uniqueVisitors} khách`}
                                        >
                                            <div
                                                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${density.border} ${density.color} ${density.glow} cursor-pointer z-10`}
                                                style={{ left, top, width: size, height: size }}
                                            >
                                                <div className={`absolute inset-0 rounded-full animate-ping ${density.ping}`} />
                                                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                                                    {item.visitCount}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    );
                                })}

                                <div
                                    className="absolute left-3 top-3 z-20 flex flex-col overflow-hidden rounded-md bg-white shadow-lg border border-gray-200"
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onWheel={(event) => event.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        className="h-9 w-9 text-xl font-semibold text-gray-700 hover:bg-gray-100"
                                        onClick={() => updateZoom((mapView?.zoom || 5) + 1)}
                                        aria-label="Phóng to bản đồ"
                                    >
                                        +
                                    </button>
                                    <button
                                        type="button"
                                        className="h-9 w-9 border-t border-gray-200 text-xl font-semibold text-gray-700 hover:bg-gray-100"
                                        onClick={() => updateZoom((mapView?.zoom || 5) - 1)}
                                        aria-label="Thu nhỏ bản đồ"
                                    >
                                        -
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="absolute left-3 top-[88px] z-20 rounded-md bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-lg border border-gray-200 hover:bg-gray-100"
                                    onClick={() => defaultMapView && setMapView(defaultMapView)}
                                    onPointerDown={(event) => event.stopPropagation()}
                                    onWheel={(event) => event.stopPropagation()}
                                >
                                    Reset
                                </button>

                                <div className="absolute left-3 bottom-2 z-20 rounded bg-white/90 px-2 py-1 text-[11px] text-gray-600 shadow-sm">
                                    Kéo để di chuyển, cuộn để thu phóng
                                </div>

                                <div className="absolute right-3 top-3 z-20 rounded-md bg-white/92 p-3 text-xs text-gray-700 shadow-lg border border-gray-200">
                                    <div className="mb-2 font-semibold text-gray-800">Mật độ truy cập</div>
                                    {[
                                        ["Ít", "bg-blue-500", "Nhỏ"],
                                        ["Vừa", "bg-yellow-400", "Trung bình"],
                                        ["Nhiều", "bg-orange-500", "Lớn"],
                                        ["Rất nhiều", "bg-red-500", "Rất lớn"],
                                    ].map(([label, color, sizeLabel], idx) => (
                                        <div key={label} className="flex items-center gap-2 py-1">
                                            <span
                                                className={`inline-block rounded-full border border-white ${color}`}
                                                style={{ width: 9 + idx * 4, height: 9 + idx * 4 }}
                                            />
                                            <span className="min-w-14">{label}</span>
                                            <span className="text-gray-400">{sizeLabel}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute bottom-2 right-2 z-20 rounded bg-white/85 px-2 py-1 text-[11px] text-gray-600 shadow-sm">
                                    © OpenStreetMap
                                </div>
                            </>
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

        </div>
    );
}
