"use client";

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Table, Input, Button, Breadcrumb, Pagination, Modal, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import NewsService from '@/services/NewsService';
import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const NewsManage = () => {
    const { themeColors } = useContext(ThemeContext);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await NewsService.getAllNews(false); // Fetch both active and inactive
            const data = response.data?.$values || response.data || [];
            setNews(data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách tin tức');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, title) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc muốn xóa tin tức "${title}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await NewsService.deleteNews(id);
                    message.success(`Đã xóa tin tức: ${title}`);
                    fetchNews();
                } catch (error) {
                    message.error('Lỗi khi xóa tin tức');
                }
            },
        });
    };

    const handleEdit = (newsItem) => {
        setSelectedNews(newsItem);
        setShowUpdateModal(true);
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        fetchNews();
        message.success('Thêm tin tức thành công');
    };

    const handleUpdateSuccess = () => {
        setShowUpdateModal(false);
        setSelectedNews(null);
        fetchNews();
        message.success('Cập nhật tin tức thành công');
    };

    const filteredNews = useMemo(() => {
        return news.filter(item =>
            item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [news, searchTerm]);

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
            render: (imageUrl) => {
                if (!imageUrl) return '--';
                const imageSrc = imageUrl.startsWith('http') ? imageUrl : `${API_ENDPOINT}${imageUrl}`;
                return (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={imageSrc}
                            alt="News cover"
                            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #f0f0f0' }}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            render: (text) => (
                <div style={{ maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            align: 'center',
        },
        {
            title: 'Lượt xem',
            dataIndex: 'viewCount',
            key: 'viewCount',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.viewCount - b.viewCount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hiển thị' : 'Ẩn'}
                </Tag>
            ),
            filters: [
                { text: 'Hiển thị', value: true },
                { text: 'Ẩn', value: false }
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
            render: (date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center',
            render: (text, record) => (
                <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">Sửa</Button>
                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id, record.title)} danger size="small">Xóa</Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div className="admin-table-card">
                <div
                    className="admin-title-bar"
                    style={{ background: '#f6f8fc', borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: '24px 24px 16px 24px', marginBottom: 0 }}
                >
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
                        Quản lý Tin tức / Góc nội thất
                    </div>
                    <Breadcrumb
                        items={[{ title: 'Trang chủ' }, { title: 'Quản lý Tin tức' }]}
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <div
                    className="admin-filter-bar"
                    style={{ padding: '16px 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
                >
                    <Space>
                        <Input.Search
                            placeholder="Tìm kiếm tin tức..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 300 }}
                        />
                    </Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)} style={{ background: themeColors.StartColorLinear }}>
                        Thêm bài viết
                    </Button>
                </div>

                <div className="admin-table-wrapper" style={{ padding: '24px' }}>
                    <Table
                        columns={columns}
                        dataSource={filteredNews}
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
                            total={filteredNews.length}
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    </div>
                </div>
            </div>

            {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />}
            {showUpdateModal && selectedNews && <UpdateModal newsItem={selectedNews} onClose={() => { setShowUpdateModal(false); setSelectedNews(null); }} onSuccess={handleUpdateSuccess} />}
        </div>
    );
};

export default NewsManage;
