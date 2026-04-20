"use client";

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Table, Input, Button, Breadcrumb, Pagination, Modal, message, Space, Row, Col, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import BannerService from '@/services/BannerService';
import { useTranslation } from 'react-i18next';
import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const Banners = () => {
    const { themeColors } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [openBulkDelete, setOpenBulkDelete] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await BannerService.getAllBanners();
            setBanners(data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách banner');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, title) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa banner "${title}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await BannerService.deleteBanner(id);
                    message.success(`Đã xóa banner: ${title}`);
                    fetchBanners();
                } catch (error) {
                    message.error('Lỗi khi xóa banner');
                }
            },
        });
    };

    const handleEdit = (banner) => {
        setSelectedBanner(banner);
        setShowUpdateModal(true);
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        fetchBanners();
        message.success('Tạo banner thành công');
    };

    const handleUpdateSuccess = () => {
        setShowUpdateModal(false);
        setSelectedBanner(null);
        fetchBanners();
        message.success('Cập nhật banner thành công');
    };

    const filteredBanners = useMemo(() => {
        return banners.filter(banner =>
            banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            banner.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [banners, searchTerm]);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (text, record, index) => (page - 1) * itemsPerPage + index + 1,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 120,
            align: 'center',
            render: (imageUrl, record) => {
                const imageSrc = imageUrl.startsWith('http') ? imageUrl : `${API_ENDPOINT}${imageUrl}`
                return (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={imageSrc}
                            alt={record.title}
                            style={{
                                width: '80px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #f0f0f0'
                            }}
                        />
                    </div>
                )
            },
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            align: 'center',
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            render: (text) => (
                <div style={{ 
                    maxWidth: '180px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            align: 'center',
            render: (text) => text && text.split(' ').slice(0, 15).join(' ') + (text.split(' ').length > 15 ? ' ...' : ''),
            sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order',
            key: 'order',
            width: 80,
            align: 'center',
            sorter: (a, b) => a.order - b.order,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: true },
                { text: 'Không hoạt động', value: false }
            ],
            onFilter: (value, record) => record.isActive === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            align: 'center',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-')
        },
        {
            title: 'Ngày sửa đổi',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 120,
            align: 'center',
            sorter: (a, b) => {
                if (!a.updatedAt) return -1;
                if (!b.updatedAt) return 1;
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            },
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '-') : '--'
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <Space size="middle" style={{justifyContent: 'center', width: '100%'}}>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
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

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        columnWidth: 40,
        columnTitle: '',
    };

    return (
        <div style={{padding: '24px'}}>
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
                    <div style={{fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear}}>
                        Quản lý Banner
                    </div>
                    <Breadcrumb
                        items={[
                            { title: 'Trang chủ' },
                            { title: 'Quản lý Banner' }
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
                            placeholder="Tìm kiếm banner..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 300 }}
                        />
                    </Space>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => setShowCreateModal(true)}
                        style={{ background: themeColors.StartColorLinear }}
                    >
                        Thêm Banner
                    </Button>
                </div>
                
                {/* Table */}
                <div className="admin-table-wrapper" style={{padding: '0 24px 24px 24px'}}>
                    <Table
                        columns={columns}
                        dataSource={filteredBanners}
                        rowKey="id"
                        pagination={false}
                        loading={loading}
                        size="middle"
                        scroll={{ x: 1200 }}
                        className="custom-table"
                    />
                    <div className="flex justify-end mt-4">
                        <Pagination
                            current={page}
                            pageSize={itemsPerPage}
                            total={filteredBanners.length}
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Create */}
            {showCreateModal && (
                <CreateModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* Modal Update */}
            {showUpdateModal && selectedBanner && (
                <UpdateModal
                    banner={selectedBanner}
                    onClose={() => {
                        setShowUpdateModal(false);
                        setSelectedBanner(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default Banners; 