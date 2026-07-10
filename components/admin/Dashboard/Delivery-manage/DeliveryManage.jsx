"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AdminPageHeader from '../shared/AdminPageHeader';
import { Table, Input, Pagination, Modal, message, Space, Tag, Button, Tooltip } from 'antd';
import OrderService from '@/services/OrderService';
import OrderDetailModal from '../Orders-manage/OrderDetailModal';

const formatPrice = (price) =>
{
    if (!price) return '0';
    return Number(price).toLocaleString('vi-VN');
};

const DeliveryManage = () =>
{
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() =>
    {
        fetchOrders();
    }, []);

    const fetchOrders = async () =>
    {
        try
        {
            setLoading(true);
            const response = await OrderService.getAllOrders();
            const data = response?.$values || response || [];
            const allOrders = Array.isArray(data) ? data : [];
            setOrders(allOrders.filter(o => o.status === 'Shipping'));
        } catch (error)
        {
            console.error('Error fetching orders:', error);
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally
        {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) =>
    {
        try
        {
            await OrderService.updateOrderStatus(orderId, newStatus);
            message.success('Đã cập nhật trạng thái giao hàng');
            fetchOrders();
        } catch (error)
        {
            const errMsg = error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái';
            message.error(errMsg);
        }
    };

    const confirmComplete = (orderId) =>
    {
        Modal.confirm({
            title: 'Xác nhận hoàn thành giao hàng',
            content: 'Đơn hàng đã được giao thành công đến khách hàng?',
            okText: 'Hoàn thành',
            cancelText: 'Đóng',
            onOk: () => handleStatusChange(orderId, 'Completed'),
        });
    };

    const confirmFailedDelivery = (orderId) =>
    {
        Modal.confirm({
            title: 'Xác nhận khách không nhận hàng',
            content: 'Đánh dấu đơn hàng giao không thành công vì khách không nhận hàng?',
            okText: 'Khách không nhận',
            okType: 'danger',
            cancelText: 'Đóng',
            onOk: () => handleStatusChange(orderId, 'FailedDelivery'),
        });
    };

    const filteredOrders = useMemo(() =>
    {
        if (!searchTerm) return orders;
        return orders.filter(order =>
            order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone?.includes(searchTerm) ||
            order.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [orders, searchTerm]);

    const paginatedOrders = useMemo(() =>
    {
        const start = (page - 1) * itemsPerPage;
        return filteredOrders.slice(start, start + itemsPerPage);
    }, [filteredOrders, page]);

    const columns = [
        {
            title: 'STT', key: 'stt', width: 60, align: 'center',
            render: (_, __, index) => (page - 1) * itemsPerPage + index + 1,
        },
        {
            title: 'Mã đơn hàng', dataIndex: 'id', key: 'id', width: 140,
            render: (id) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1890ff' }}>
                    #{id?.substring(0, 8).toUpperCase()}
                </span>
            ),
        },
        {
            title: 'Khách hàng', key: 'customer', width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.phone}</div>
                </div>
            ),
            sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
        },
        {
            title: 'Địa chỉ giao hàng', key: 'address', width: 280,
            render: (_, record) => (
                <div style={{ fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <i className='bx bx-map' style={{ color: '#e11d48', fontSize: 14, marginTop: 2, flexShrink: 0 }}></i>
                    <span>{[record.address, record.ward, record.district, record.city].filter(Boolean).join(', ')}</span>
                </div>
            ),
        },
        {
            title: 'Sản phẩm', key: 'items', width: 80, align: 'center',
            render: (_, record) => {
                const items = record.orderItems?.$values || record.orderItems || [];
                return <span>{items.reduce((s, i) => s + i.quantity, 0)} SP</span>;
            },
        },
        {
            title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', width: 140, align: 'right',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (amount) => <span style={{ fontWeight: 600, color: '#e11d48' }}>{formatPrice(amount)}₫</span>,
        },
        {
            title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'paymentMethod', width: 110, align: 'center',
            render: (method) => <Tag color={method === 'cod' ? 'green' : 'blue'}>{method === 'cod' ? 'COD' : 'Chuyển khoản'}</Tag>,
        },
        {
            title: 'Ngày đặt', dataIndex: 'orderDate', key: 'orderDate', width: 120, align: 'center',
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--',
        },
        {
            title: 'Thao tác', key: 'action', width: 200, align: 'center',
            render: (_, record) => (
                <Space size={6} className="admin-action-group">
                    <Tooltip title="Đánh dấu hoàn thành giao hàng">
                        <Button type="text" className="admin-action-btn" size="small" icon={<i className='bx bx-check-circle'></i>}
                            onClick={() => confirmComplete(record.id)}
                        >Hoàn thành</Button>
                    </Tooltip>
                    <Tooltip title="Đánh dấu khách không nhận hàng">
                        <Button type="text" className="admin-action-btn" danger size="small" icon={<i className='bx bx-error-circle'></i>}
                            onClick={() => confirmFailedDelivery(record.id)}
                        >Không nhận</Button>
                    </Tooltip>
                    <Tooltip title="Xem chi tiết đơn giao">
                        <Button type="text" className="admin-action-btn" icon={<i className='bx bx-show'></i>} onClick={() => setSelectedOrder(record)} size="small">Chi tiết</Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '16px' }}>
            <AdminPageHeader
                title="Quản lý Vận chuyển"
                breadcrumbItems={[
                    { title: 'Trang chủ' },
                    { title: 'Quản lý Vận chuyển' }
                ]}
            />
            <div className="admin-table-card">
                <div className="flex flex-wrap gap-6 py-4 mb-2">
                    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center min-w-[200px] flex-1 border-l-8 border-indigo-400 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)" }}>
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-2xl">
                            <i className='bx bx-package'></i>
                        </div>
                        <div className="ml-4">
                            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
                            <div className="text-gray-500 text-sm">Đơn đang giao hàng</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center min-w-[200px] flex-1 border-l-8 border-primary-400 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)" }}>
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 text-2xl">
                            <i className='bx bx-money'></i>
                        </div>
                        <div className="ml-4">
                            <div className="text-xl font-bold text-gray-800">
                                {formatPrice(orders.filter(o => o.paymentMethod === 'cod').reduce((s, o) => s + (o.totalAmount || 0), 0))}₫
                            </div>
                            <div className="text-gray-500 text-sm">Tiền COD cần thu</div>
                        </div>
                    </div>
                </div>

                <div className="admin-filter-bar"
                    style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <Input.Search placeholder="Tìm theo tên, SĐT, mã đơn..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)} style={{ width: 300 }} />
                    <Button onClick={fetchOrders} loading={loading}>
                        <i className='bx bx-refresh' style={{ marginRight: 4 }}></i> Làm mới
                    </Button>
                </div>

                <div className="admin-table-wrapper" style={{ padding: '24px' }}>
                    {filteredOrders.length === 0 && !loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                            <i className='bx bx-package' style={{ fontSize: 48, color: '#d1d5db', marginBottom: 12, display: 'block' }}></i>
                            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Không có đơn hàng đang giao</div>
                            <div style={{ fontSize: 13 }}>Các đơn hàng được chuyển sang trạng thái "Đang giao" sẽ hiển thị tại đây</div>
                        </div>
                    ) : (
                        <>
                            <Table columns={columns} dataSource={paginatedOrders} rowKey="id"
                                pagination={false} loading={loading} size="middle" tableLayout="fixed" className="custom-table" />
                            <div className="flex justify-end mt-4">
                                <Pagination current={page} pageSize={itemsPerPage} total={filteredOrders.length}
                                    onChange={setPage} showSizeChanger={false}
                                    showTotal={(total) => `Tổng ${total} đơn hàng đang giao`} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)}
                    onStatusChange={(id, status) => { handleStatusChange(id, status); setSelectedOrder(null); }} />
            )}
        </div>
    );
};

export default DeliveryManage;
