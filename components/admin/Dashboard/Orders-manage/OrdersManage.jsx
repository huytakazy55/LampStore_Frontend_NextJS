"use client";

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Table, Input, Breadcrumb, Pagination, Modal, message, Space, Tag, Select, Button } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import OrderService from '@/services/OrderService';
import OrderDetailModal from './OrderDetailModal';

const statusConfig = {
    Pending: { color: 'orange', label: 'Chờ xử lý' },
    Confirmed: { color: 'blue', label: 'Đã xác nhận' },
    Shipping: { color: 'cyan', label: 'Đang giao' },
    Completed: { color: 'green', label: 'Hoàn thành' },
    Cancelled: { color: 'red', label: 'Đã hủy' },
};

const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('vi-VN');
};

const OrdersManage = () => {
    const { themeColors } = useContext(ThemeContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await OrderService.getAllOrders();
            const data = response?.$values || response || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await OrderService.deleteOrder(id);
                    message.success('Đã xóa đơn hàng');
                    fetchOrders();
                } catch (error) {
                    message.error('Lỗi khi xóa đơn hàng');
                }
            },
        });
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await OrderService.updateOrderStatus(orderId, newStatus);
            message.success(`Cập nhật trạng thái: ${statusConfig[newStatus]?.label}`);
            fetchOrders();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchSearch =
                order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.phone?.includes(searchTerm) ||
                order.id?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const paginatedOrders = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, page]);

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => (page - 1) * itemsPerPage + index + 1,
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 140,
            render: (id) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff' }}>
                    #{id?.substring(0, 8).toUpperCase()}
                </span>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.phone}</div>
                </div>
            ),
            sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            width: 220,
            render: (_, record) => (
                <div style={{ fontSize: '13px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[record.address, record.ward, record.district, record.city].filter(Boolean).join(', ')}
                </div>
            ),
        },
        {
            title: 'Sản phẩm',
            key: 'items',
            width: 80,
            align: 'center',
            render: (_, record) => {
                const items = record.orderItems?.$values || record.orderItems || [];
                const totalQty = items.reduce((s, i) => s + i.quantity, 0);
                return <span>{totalQty} SP</span>;
            },
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 140,
            align: 'right',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (amount) => (
                <span style={{ fontWeight: 600, color: '#e11d48' }}>
                    {formatPrice(amount)}₫
                </span>
            ),
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 110,
            align: 'center',
            render: (method) => (
                <Tag color={method === 'cod' ? 'green' : 'blue'}>
                    {method === 'cod' ? 'COD' : 'Chuyển khoản'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 170,
            align: 'center',
            render: (status, record) => {
                const colorMap = {
                    Pending: { bg: '#fef3c7', border: '#fcd34d', text: '#b45309', icon: 'bx-time-five' },
                    Confirmed: { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', icon: 'bx-check-circle' },
                    Shipping: { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca', icon: 'bx-package' },
                    Completed: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', icon: 'bx-check-double' },
                    Cancelled: { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', icon: 'bx-x-circle' },
                };
                return (
                    <Select
                        value={status}
                        size="small"
                        style={{ width: 158 }}
                        onChange={(val) => handleStatusChange(record.id, val)}
                        popupMatchSelectWidth={false}
                        variant="borderless"
                        labelRender={({ value: v }) => {
                            const cm = colorMap[v] || colorMap.Pending;
                            const lb = statusConfig[v]?.label || v;
                            return (
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                    background: cm.bg, color: cm.text, border: `1px solid ${cm.border}`,
                                }}>
                                    <i className={`bx ${cm.icon}`} style={{ fontSize: 13 }}></i>
                                    {lb}
                                </span>
                            );
                        }}
                        options={Object.entries(statusConfig).map(([key, val]) => {
                            const cm = colorMap[key] || colorMap.Pending;
                            return {
                                value: key,
                                label: (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: cm.text }}>
                                        <i className={`bx ${cm.icon}`} style={{ fontSize: 14 }}></i>
                                        {val.label}
                                    </span>
                                ),
                            };
                        })}
                    />
                );
            },
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 120,
            align: 'center',
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button icon={<EyeOutlined />} onClick={() => setSelectedOrder(record)} size="small">Chi tiết</Button>
                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger size="small" />
                </Space>
            ),
        },
    ];

    // Stats summary
    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        shipping: orders.filter(o => o.status === 'Shipping').length,
        completed: orders.filter(o => o.status === 'Completed').length,
        revenue: orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.totalAmount || 0), 0),
    }), [orders]);

    return (
        <div style={{ padding: '24px' }}>
            <div className="admin-table-card">
                {/* Header */}
                <div
                    className="admin-title-bar"
                    style={{ background: '#f6f8fc', borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: '24px 24px 16px 24px', marginBottom: 0 }}
                >
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
                        Quản lý Đơn hàng
                    </div>
                    <Breadcrumb
                        items={[{ title: 'Trang chủ' }, { title: 'Quản lý Đơn hàng' }]}
                        style={{ marginTop: '8px' }}
                    />
                </div>

                {/* Stats Cards */}
                <div className="flex flex-wrap gap-6 p-6 mb-2">
                    {[
                        {
                            icon: (
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl">
                                    <i className="bx bx-receipt"></i>
                                </div>
                            ),
                            value: stats.total,
                            label: "Tổng đơn",
                            percent: "Tất cả",
                            percentType: "blue"
                        },
                        {
                            icon: (
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 text-2xl">
                                    <i className="bx bx-time-five"></i>
                                </div>
                            ),
                            value: stats.pending,
                            label: "Chờ xử lý",
                            percent: "Mới",
                            percentType: "yellow"
                        },
                        {
                            icon: (
                                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 text-2xl">
                                    <i className="bx bx-package"></i>
                                </div>
                            ),
                            value: stats.shipping,
                            label: "Đang giao",
                            percent: "Ship",
                            percentType: "cyan"
                        },
                        {
                            icon: (
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-2xl">
                                    <i className="bx bx-check-double"></i>
                                </div>
                            ),
                            value: stats.completed,
                            label: "Hoàn thành",
                            percent: "Xong",
                            percentType: "green"
                        },
                        {
                            icon: (
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl">
                                    <i className="bx bx-wallet"></i>
                                </div>
                            ),
                            value: formatPrice(stats.revenue) + "₫",
                            label: "Doanh thu",
                            percent: "Tổng",
                            percentType: "red"
                        }
                    ].map((item, idx) => {
                        const percentColor = {
                            green: "bg-green-100 text-green-500",
                            blue: "bg-blue-100 text-blue-500",
                            yellow: "bg-yellow-100 text-yellow-500",
                            cyan: "bg-cyan-100 text-cyan-500",
                            red: "bg-red-100 text-red-500",
                        };
                        return (
                            <div
                                key={idx}
                                className={`
                                  bg-white rounded-xl shadow-lg 
                                  p-5 flex items-center min-w-[200px] flex-1
                                  border-l-8 border-[1px] cursor-pointer
                                  ${item.percentType === "green" ? "border-green-400" : ""}
                                  ${item.percentType === "blue" ? "border-blue-400" : ""}
                                  ${item.percentType === "yellow" ? "border-yellow-400" : ""}
                                  ${item.percentType === "cyan" ? "border-cyan-400" : ""}
                                  ${item.percentType === "red" ? "border-red-400" : ""}
                                  hover:scale-[1.03] hover:shadow-2xl transition-all duration-200
                                `}
                                style={{ background: "linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)" }}
                            >
                                {item.icon}
                                <div className="ml-4">
                                    <div className="text-xl font-bold text-gray-800">{item.value}</div>
                                    <div className="text-gray-500 text-sm">{item.label}</div>
                                </div>
                                <div className="ml-auto flex flex-col items-end">
                                    <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold ${percentColor[item.percentType]}`}>
                                        {item.percent}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter bar */}
                <div
                    className="admin-filter-bar"
                    style={{ padding: '16px 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderTop: '1px solid #f0f0f0' }}
                >
                    <Space>
                        <Input.Search
                            placeholder="Tìm theo tên, SĐT, mã đơn..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            value={statusFilter}
                            style={{ width: 160 }}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                ...Object.entries(statusConfig).map(([key, val]) => ({
                                    value: key,
                                    label: val.label,
                                })),
                            ]}
                        />
                    </Space>
                    <Button onClick={fetchOrders} loading={loading}>
                        <i className='bx bx-refresh' style={{ marginRight: 4 }}></i> Làm mới
                    </Button>
                </div>

                {/* Table */}
                <div className="admin-table-wrapper" style={{ padding: '24px' }}>
                    <Table
                        columns={columns}
                        dataSource={paginatedOrders}
                        rowKey="id"
                        pagination={false}
                        loading={loading}
                        size="middle"
                        scroll={{ x: 1400 }}
                        className="custom-table"
                    />
                    <div className="flex justify-end mt-4">
                        <Pagination
                            current={page}
                            pageSize={itemsPerPage}
                            total={filteredOrders.length}
                            onChange={setPage}
                            showSizeChanger={false}
                            showTotal={(total) => `Tổng ${total} đơn hàng`}
                        />
                    </div>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => { setSelectedOrder(null); }}
                    onStatusChange={(id, status) => { handleStatusChange(id, status); setSelectedOrder(null); }}
                />
            )}
        </div>
    );
};

export default OrdersManage;
