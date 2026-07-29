"use client";

import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import AdminPageHeader from '../shared/AdminPageHeader';
import { Table, Input, Button, Modal, message, Space, Row, Col, Card, Tag, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [openBulkDelete, setOpenBulkDelete] = useState(false);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

    // Debounce the search box so we don't hit the server on every keystroke.
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const searchDebounceRef = useRef(null);
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            // Reset to page 1 here (inside the debounce timeout) rather than in a
            // separate effect, so it's an event-driven update instead of a
            // synchronous setState inside an effect body.
            setPage(1);
        }, 350);
        return () => clearTimeout(searchDebounceRef.current);
    }, [searchTerm]);

    // Server-driven paginated fetch. NOTE: /api/Banners does not currently support a
    // search query param on the backend (see BannerService.getAllBanners) — `search`
    // is still sent so this becomes true server-side search the moment the backend
    // adds support. Until then, `filteredBanners` below narrows the already-loaded
    // page client-side.
    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            const { items, total } = await BannerService.getAllBanners(page, itemsPerPage, debouncedSearchTerm);
            setBanners(items);
            setTotal(total);
        } catch (error) {
            message.error('Lỗi khi tải danh sách banner');
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

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
                <Space size={6} className="admin-action-group">
                    <Tooltip title="Sửa banner">
                        <Button
                            type="text"
                            className="admin-action-btn"
                            icon={<i className='bx bx-edit'></i>}
                            onClick={() => handleEdit(record)}
                            size="small"
                        >
                            Sửa
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xóa banner">
                        <Button
                            type="text"
                            className="admin-action-btn"
                            icon={<i className='bx bx-trash'></i>}
                            onClick={() => handleDelete(record.id, record.title)}
                            danger
                            size="small"
                        >
                            Xóa
                        </Button>
                    </Tooltip>
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
        <div style={{ padding: '16px' }}>
            <AdminPageHeader
                title="Quản lý Banner"
                breadcrumbItems={[
                    { title: 'Trang chủ' },
                    { title: 'Quản lý Banner' }
                ]}
            />
            <div className="admin-table-card">
                {/* Filter Bar */}
                <div
                    className="admin-filter-bar"
                    style={{
                        padding: '16px 24px',
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
                        className="admin-theme-primary-btn"
                        icon={<PlusOutlined />}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Thêm Banner
                    </Button>
                </div>

                {/* Table */}
                <div className="admin-table-wrapper" style={{ padding: '24px' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredBanners}
                        rowKey="id"
                        pagination={{
                            current: page,
                            pageSize: itemsPerPage,
                            total,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} banner`,
                            onChange: (newPage, newPageSize) => {
                                setPage(newPage);
                                setItemsPerPage(newPageSize);
                            }
                        }}
                        loading={loading}
                        size="middle"
                        scroll={{ x: 1200 }}
                        className="custom-table"
                    />
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
