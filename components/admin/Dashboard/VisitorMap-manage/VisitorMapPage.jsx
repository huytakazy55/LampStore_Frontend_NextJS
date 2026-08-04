"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Empty, Select, Spin, Table, Tag, Tooltip } from "antd";
import {
    AimOutlined,
    CompressOutlined,
    EnvironmentOutlined,
    ExpandOutlined,
    ReloadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from "@ant-design/icons";
import axiosInstance from "@/services/axiosConfig";
import AdminPageHeader from "../shared/AdminPageHeader";

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
            color: "bg-secondary-400/90",
            border: "border-primary-500",
            glow: "shadow-[0_0_26px_rgba(234,179,8,0.52)]",
            ping: "bg-secondary-200/40",
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
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [failedTiles, setFailedTiles] = useState(() => new Set());
    const [isDragging, setIsDragging] = useState(false);

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

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsMapFullscreen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

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
        if (event.target.closest?.(".admin-visitor-toolbar")) return;

        event.preventDefault();
        const rect = mapRef.current.getBoundingClientRect();
        updateZoom(mapView.zoom + (event.deltaY < 0 ? 1 : -1), {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };

    // React registers onWheel as a passive listener, so event.preventDefault() inside
    // it is silently ignored by the browser and the page scrolls anyway underneath the
    // map. Attaching a native, non-passive listener is the only reliable way to block
    // page scroll while the user scrolls to zoom the map.
    useEffect(() => {
        const node = mapRef.current;
        if (!node) return undefined;

        node.addEventListener("wheel", handleWheel, { passive: false });
        return () => node.removeEventListener("wheel", handleWheel);
    });

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
        setIsDragging(true);
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
        setIsDragging(false);
    };

    const handleDoubleClick = (event) => {
        if (!mapRef.current || !mapView) return;

        const rect = mapRef.current.getBoundingClientRect();
        updateZoom(mapView.zoom + 1, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        });
    };

    const panBy = (dx, dy) => {
        if (!mapState || !mapView) return;

        const centerPixel = {
            x: mapState.topLeft.x + mapSize.width / 2 + dx,
            y: mapState.topLeft.y + mapSize.height / 2 + dy,
        };
        const center = pixelToLatLng(centerPixel.x, centerPixel.y, mapView.zoom);
        setMapView({ ...center, zoom: mapView.zoom });
    };

    const PAN_STEP = 80;

    const handleMapKeyDown = (event) => {
        if (!mapView) return;

        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                panBy(0, -PAN_STEP);
                break;
            case "ArrowDown":
                event.preventDefault();
                panBy(0, PAN_STEP);
                break;
            case "ArrowLeft":
                event.preventDefault();
                panBy(-PAN_STEP, 0);
                break;
            case "ArrowRight":
                event.preventDefault();
                panBy(PAN_STEP, 0);
                break;
            case "+":
            case "=":
                event.preventDefault();
                updateZoom(mapView.zoom + 1);
                break;
            case "-":
            case "_":
                event.preventDefault();
                updateZoom(mapView.zoom - 1);
                break;
            default:
                break;
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
        <div className="admin-visitor-page">
            <div className="admin-table-card admin-visitor-card">
                <AdminPageHeader
                    title="Bản đồ truy cập"
                    breadcrumbItems={[
                        { title: "Trang chủ" },
                        { title: "Bản đồ truy cập" },
                    ]}
                    actions={(
                        <>
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
                        </>
                    )}
                />

                {error && (
                    <div className="admin-visitor-alert">
                        <Alert type="warning" showIcon message={error} />
                    </div>
                )}

                <div className="admin-visitor-stats">
                    {[
                        ["IP đã ghi nhận", data?.totalIpCount || 0, "blue", "Tổng", `${days} ngày`],
                        ["IP định vị được", data?.resolvedIpCount || 0, "green", "OK", "Public IP"],
                        ["IP nội bộ", data?.privateIpCount || 0, "gray", "Local", "Nội bộ"],
                        ["Chưa định vị", data?.unresolvedIpCount || 0, "amber", "Pending", "Chờ dữ liệu"],
                    ].map(([label, value, tone, badge, meta]) => (
                        <div key={label} className={`admin-visitor-stat-card admin-visitor-stat-card-${tone}`}>
                            <div className={`admin-visitor-stat-icon admin-visitor-stat-icon-${tone}`}>
                                <EnvironmentOutlined />
                            </div>
                            <div className="admin-visitor-stat-main">
                                <div className="admin-visitor-stat-value">{value.toLocaleString("vi-VN")}</div>
                                <div className="admin-visitor-stat-label">{label}</div>
                            </div>
                            <div className="admin-visitor-stat-meta">
                                <div className={`admin-visitor-stat-badge admin-visitor-stat-badge-${tone}`}>
                                    {badge}
                                </div>
                                <div className="admin-visitor-stat-time">{meta}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={isMapFullscreen ? "admin-visitor-map-fullscreen" : "admin-visitor-map-section"}>
                    <div
                        ref={mapRef}
                        className={`admin-visitor-map ${isMapFullscreen ? "admin-visitor-map-expanded" : ""}`}
                        tabIndex={0}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onDoubleClick={handleDoubleClick}
                        onKeyDown={handleMapKeyDown}
                    >
                        {loading ? (
                            <div className="admin-visitor-map-state">
                                <Spin size="large" tip="Đang quy đổi IP sang vị trí..." />
                            </div>
                        ) : locations.length === 0 ? (
                            <div className="admin-visitor-map-state">
                                <Empty
                                    description={
                                        data?.totalIpCount > 0
                                            ? "Không định vị được IP nào — dịch vụ IP geolocation (ip-api.com) có thể đang gián đoạn, thử Làm mới sau ít phút"
                                            : "Chưa có IP public nào định vị được"
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                {mapState?.tiles
                                    .filter((tile) => !failedTiles.has(tile.key))
                                    .map((tile) => (
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
                                                transition: isDragging ? "none" : "left 180ms ease, top 180ms ease",
                                            }}
                                            onError={() =>
                                                setFailedTiles((current) => {
                                                    if (current.has(tile.key)) return current;
                                                    const next = new Set(current);
                                                    next.add(tile.key);
                                                    return next;
                                                })
                                            }
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

                                    const markerLabel = `${title || "Không rõ khu vực"} - ${density.label}: ${item.visitCount} lượt / ${item.uniqueVisitors} khách`;

                                    return (
                                        <Tooltip
                                            key={`${item.latitude}-${item.longitude}-${index}`}
                                            title={markerLabel}
                                            trigger={["hover", "focus"]}
                                        >
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                aria-label={markerLabel}
                                                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${density.border} ${density.color} ${density.glow} cursor-pointer z-10 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white`}
                                                style={{
                                                    left,
                                                    top,
                                                    width: size,
                                                    height: size,
                                                    transition: isDragging ? "none" : "left 180ms ease, top 180ms ease",
                                                }}
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
                                    className="admin-visitor-toolbar"
                                    onPointerDown={(event) => event.stopPropagation()}
                                >
                                    <Tooltip title="Phóng to (phím +)" placement="right">
                                        <button
                                            type="button"
                                            className="admin-visitor-toolbar-btn"
                                            onClick={() => updateZoom((mapView?.zoom || 5) + 1)}
                                            disabled={!mapView || mapView.zoom >= 18}
                                            aria-label="Phóng to bản đồ"
                                        >
                                            <ZoomInOutlined />
                                        </button>
                                    </Tooltip>

                                    <div className="admin-visitor-toolbar-zoom" title="Mức thu phóng hiện tại">
                                        {mapView?.zoom ?? "-"}
                                    </div>

                                    <Tooltip title="Thu nhỏ (phím -)" placement="right">
                                        <button
                                            type="button"
                                            className="admin-visitor-toolbar-btn"
                                            onClick={() => updateZoom((mapView?.zoom || 5) - 1)}
                                            disabled={!mapView || mapView.zoom <= 2}
                                            aria-label="Thu nhỏ bản đồ"
                                        >
                                            <ZoomOutOutlined />
                                        </button>
                                    </Tooltip>

                                    <div className="admin-visitor-toolbar-divider" />

                                    <Tooltip title="Về vị trí mặc định" placement="right">
                                        <button
                                            type="button"
                                            className="admin-visitor-toolbar-btn"
                                            onClick={() => defaultMapView && setMapView(defaultMapView)}
                                            aria-label="Đặt lại vị trí bản đồ"
                                        >
                                            <AimOutlined />
                                        </button>
                                    </Tooltip>

                                    <Tooltip title={isMapFullscreen ? "Thu nhỏ" : "Toàn màn hình"} placement="right">
                                        <button
                                            type="button"
                                            className="admin-visitor-toolbar-btn"
                                            onClick={() => setIsMapFullscreen((value) => !value)}
                                            aria-label={isMapFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
                                        >
                                            {isMapFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                                        </button>
                                    </Tooltip>
                                </div>

                                <div className="admin-visitor-map-hint">
                                    Kéo hoặc phím mũi tên để di chuyển · Cuộn, double-click hoặc +/- để thu phóng
                                    {isMapFullscreen ? " · Esc để thoát" : ""}
                                </div>

                                <div className="admin-visitor-legend">
                                    <div className="admin-visitor-legend-title">Mật độ truy cập</div>
                                    {[
                                        ["Ít", "bg-blue-500", "Nhỏ"],
                                        ["Vừa", "bg-secondary-400", "Trung bình"],
                                        ["Nhiều", "bg-orange-500", "Lớn"],
                                        ["Rất nhiều", "bg-red-500", "Rất lớn"],
                                    ].map(([label, color, sizeLabel], idx) => (
                                        <div key={label} className="admin-visitor-legend-item">
                                            <span
                                                className={`admin-visitor-legend-dot ${color}`}
                                                style={{ width: 9 + idx * 4, height: 9 + idx * 4 }}
                                            />
                                            <span className="admin-visitor-legend-label">{label}</span>
                                            <span className="admin-visitor-legend-size">{sizeLabel}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-visitor-map-credit">
                                    © OpenStreetMap
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="admin-visitor-table">
                    <Table
                        columns={ipColumns}
                        dataSource={(data?.ipVisits || []).map((item, index) => ({ ...item, key: `${item.ipAddress}-${index}` }))}
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        scroll={{ x: 900 }}
                        className="custom-table"
                    />
                </div>
            </div>

        </div>
    );
}
