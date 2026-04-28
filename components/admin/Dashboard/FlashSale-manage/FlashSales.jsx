"use client";

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Table, Input, Button, Breadcrumb, Pagination, Modal, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import FlashSaleService from '@/services/FlashSaleService';
import { toast } from 'react-toastify';
import CreateFlashSaleModal from './CreateFlashSaleModal';

const FlashSales = () => {
    const { themeColors } = useContext(ThemeContext);
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const fetchFlashSales = useCallback(async () => {
        try {
            setLoading(true);
            const data = await FlashSaleService.getAllFlashSales();
            setFlashSales(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách Flash Sale');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFlashSales(); }, [fetchFlashSales]);

    const handleDelete = (id, title) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa Flash Sale "${title}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await FlashSaleService.deleteFlashSale(id);
                    toast.success('Xóa Flash Sale thành công');
                    fetchFlashSales();
                } catch {
                    toast.error('Lỗi khi xóa Flash Sale');
                }
            }
        });
    };

    const handleToggleActive = async (flashSale) => {
        try {
            await FlashSaleService.updateFlashSale(flashSale.id, {
                ...flashSale,
                isActive: !flashSale.isActive
            });
            toast.success(flashSale.isActive ? 'Đã tắt Flash Sale' : 'Đã bật Flash Sale');
            fetchFlashSales();
        } catch {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const getStatus = (fs) => {
        const now = new Date();
        const start = new Date(fs.startTime);
        const end = new Date(fs.endTime);
        if (!fs.isActive) return { text: 'Tắt', color: 'default' };
        if (now < start) return { text: 'Sắp diễn ra', color: 'blue' };
        if (now >= start && now < end) return { text: 'Đang diễn ra', color: 'green' };
        return { text: 'Đã kết thúc', color: 'red' };
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredFlashSales = flashSales.filter(fs =>
        fs.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fs.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => (page - 1) * itemsPerPage + index + 1,
        },
        {
            title: 'Tên chương trình',
            dataIndex: 'title',
            key: 'title',
            width: 220,
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    {record.description && (
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                            {record.description.length > 50 ? record.description.slice(0, 50) + '...' : record.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime',
            width: 160,
            align: 'center',
            sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
            render: (date) => formatDate(date),
        },
        {
            title: 'Kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            width: 160,
            align: 'center',
            sorter: (a, b) => new Date(a.endTime) - new Date(b.endTime),
            render: (date) => formatDate(date),
        },
        {
            title: 'Sản phẩm',
            key: 'itemCount',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const items = record.items?.$values || record.items || [];
                return (
                    <Tag color="orange">{items.length} SP</Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 130,
            align: 'center',
            render: (_, record) => {
                const status = getStatus(record);
                return <Tag color={status.color}>{status.text}</Tag>;
            },
            filters: [
                { text: 'Tắt', value: 'Tắt' },
                { text: 'Sắp diễn ra', value: 'Sắp diễn ra' },
                { text: 'Đang diễn ra', value: 'Đang diễn ra' },
                { text: 'Đã kết thúc', value: 'Đã kết thúc' },
            ],
            onFilter: (value, record) => getStatus(record).text === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
                    <Button
                        size="small"
                        type={record.isActive ? 'primary' : 'default'}
                        onClick={() => handleToggleActive(record)}
                        style={record.isActive ? { background: '#22c55e', borderColor: '#22c55e' } : {}}
                    >
                        {record.isActive ? 'Bật' : 'Tắt'}
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => { setEditingFlashSale(record); setShowCreateModal(true); }}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id, record.title)}
                        danger
                        size="small"
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div className="admin-table-card">
                {/* Title Bar */}
                <div
                    className="admin-title-bar"
                    style={{
                        background: '#f6f8fc',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        padding: '24px 24px 16px 24px',
                        marginBottom: 0
                    }}
                >
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
                        ⚡ Quản lý Flash Sale
                    </div>
                    <Breadcrumb
                        items={[
                            { title: 'Trang chủ' },
                            { title: 'Quản lý Flash Sale' }
                        ]}
                        style={{ marginTop: '8px' }}
                    />
                </div>

                {/* Filter Bar */}
                <div
                    className="admin-filter-bar"
                    style={{
                        padding: '16px 24px',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    <Space>
                        <Input.Search
                            placeholder="Tìm kiếm Flash Sale..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 300 }}
                        />
                    </Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => { setEditingFlashSale(null); setShowCreateModal(true); }}
                        style={{ background: themeColors.StartColorLinear }}
                    >
                        Tạo Flash Sale
                    </Button>
                </div>

                {/* Table */}
                <div className="admin-table-wrapper" style={{ padding: '24px' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredFlashSales}
                        rowKey="id"
                        pagination={false}
                        loading={loading}
                        size="middle"
                        scroll={{ x: 1000 }}
                        className="custom-table"
                    />
                    <div className="flex justify-end mt-4">
                        <Pagination
                            current={page}
                            pageSize={itemsPerPage}
                            total={filteredFlashSales.length}
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateFlashSaleModal
                    flashSale={editingFlashSale}
                    onClose={() => { setShowCreateModal(false); setEditingFlashSale(null); }}
                    onSuccess={() => { setShowCreateModal(false); setEditingFlashSale(null); fetchFlashSales(); }}
                />
            )}
        </div>
    );
};

export default FlashSales;
