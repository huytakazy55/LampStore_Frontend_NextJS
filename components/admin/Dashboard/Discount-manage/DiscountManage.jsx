"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Typography, Tag, Popconfirm, Tooltip, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';

const { Title } = Typography;
const { Search } = Input;
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const DiscountManage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    
    // Modals
    const [createVisible, setCreateVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINT}/api/DiscountCode`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDiscounts(data.$values || data || []);
            } else {
                toast.error('Lỗi khi tải mã giảm giá');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINT}/api/DiscountCode/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Đã xóa mã giảm giá');
                fetchDiscounts();
            } else {
                toast.error('Lỗi khi xóa mã giảm giá');
            }
        } catch (error) {
            toast.error('Lỗi kết nối máy chủ');
        }
    };

    const filteredData = useMemo(() => {
        if (!searchText) return discounts;
        const lower = searchText.toLowerCase();
        return discounts.filter(d => 
            d.code?.toLowerCase().includes(lower) || 
            (d.userId?.toLowerCase() || '').includes(lower)
        );
    }, [discounts, searchText]);

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Loại',
            dataIndex: 'discountType',
            key: 'discountType',
            render: (type) => type === 'Percentage' ? <Tag color="blue">% Phần trăm</Tag> : <Tag color="green">$ Tiền mặt</Tag>
        },
        {
            title: 'Giá trị',
            key: 'value',
            render: (_, record) => record.discountType === 'Percentage' 
                ? `${record.discountPercentage}% (Tối đa ${record.maxDiscountAmount?.toLocaleString()}₫)` 
                : `${record.discountAmount?.toLocaleString()}₫`
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty) => <span className={qty === 0 ? 'text-red-500 font-bold' : ''}>{qty}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => status === 'Active' ? <Tag color="success">Kích hoạt</Tag> : <Tag color="error">Vô hiệu</Tag>
        },
        {
            title: 'Hạn dùng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="primary" 
                            ghost 
                            icon={<EditOutlined />} 
                            onClick={() => {
                                setSelectedDiscount(record);
                                setUpdateVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa mã này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} style={{ margin: 0 }}>Quản lý Mã Giảm Giá</Title>
                    <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các voucher khuyến mãi</p>
                </div>
                <Space>
                    <Search
                        placeholder="Tìm theo mã..."
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button icon={<ReloadOutlined />} onClick={fetchDiscounts}>Làm mới</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>
                        Tạo mã mới
                    </Button>
                </Space>
            </div>

            <Table 
                columns={columns} 
                dataSource={filteredData} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <CreateModal 
                visible={createVisible}
                onCancel={() => setCreateVisible(false)}
                onSuccess={() => {
                    setCreateVisible(false);
                    fetchDiscounts();
                }}
            />

            {selectedDiscount && (
                <UpdateModal 
                    visible={updateVisible}
                    data={selectedDiscount}
                    onCancel={() => {
                        setUpdateVisible(false);
                        setSelectedDiscount(null);
                    }}
                    onSuccess={() => {
                        setUpdateVisible(false);
                        setSelectedDiscount(null);
                        fetchDiscounts();
                    }}
                />
            )}
        </div>
    );
};

export default DiscountManage;
