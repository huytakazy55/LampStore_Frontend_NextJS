import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Button } from 'antd';
import { toast } from 'react-toastify';

import dayjs from 'dayjs';

const { Option } = Select;
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const CreateModal = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [discountType, setDiscountType] = useState('Percentage');

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            const payload = {
                code: values.code,
                discountType: values.discountType,
                discountPercentage: values.discountType === 'Percentage' ? values.discountPercentage : 0,
                discountAmount: values.discountType === 'FixedAmount' ? values.discountAmount : 0,
                maxDiscountAmount: values.discountType === 'Percentage' ? (values.maxDiscountAmount || 0) : 0,
                minOrderAmount: values.minOrderAmount || 0,
                quantity: values.quantity,
                status: values.status ? 'Active' : 'Inactive',
                expiryDate: values.expiryDate.toISOString(),
                userId: values.userId || null // Empty means global
            };

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_ENDPOINT}/api/DiscountCode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Tạo mã giảm giá thành công');
                form.resetFields();
                onSuccess();
            } else {
                toast.error('Lỗi khi tạo mã giảm giá');
            }
        } catch (error) {
            console.error('Validate failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo Mã Giảm Giá Mới"
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    discountType: 'Percentage',
                    status: true,
                    quantity: 1,
                    minOrderAmount: 0,
                    maxDiscountAmount: 0
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="code"
                        label="Mã giảm giá (Code)"
                        rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá!' }]}
                    >
                        <Input placeholder="Ví dụ: SUMMER2024" />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="discountType"
                        label="Loại giảm giá"
                        rules={[{ required: true }]}
                    >
                        <Select onChange={(value) => setDiscountType(value)}>
                            <Option value="Percentage">Phần trăm (%)</Option>
                            <Option value="FixedAmount">Tiền mặt (₫)</Option>
                        </Select>
                    </Form.Item>

                    {discountType === 'Percentage' ? (
                        <Form.Item
                            name="discountPercentage"
                            label="Phần trăm giảm (%)"
                            rules={[{ required: true, message: 'Vui lòng nhập %!' }]}
                        >
                            <InputNumber min={1} max={100} className="w-full" />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            name="discountAmount"
                            label="Số tiền giảm (₫)"
                            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
                        >
                            <InputNumber min={1} className="w-full"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="minOrderAmount"
                        label="Đơn tối thiểu (₫)"
                    >
                        <InputNumber min={0} className="w-full"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    {discountType === 'Percentage' && (
                        <Form.Item
                            name="maxDiscountAmount"
                            label="Giảm tối đa (₫, 0=Không giới hạn)"
                        >
                            <InputNumber min={0} className="w-full"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="expiryDate"
                        label="Ngày hết hạn"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}
                    >
                        <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm:ss" />
                    </Form.Item>

                    <Form.Item
                        name="userId"
                        label="UserId (để trống nếu áp dụng tất cả)"
                    >
                        <Input placeholder="Nhập ID người dùng (không bắt buộc)" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="status"
                    label="Kích hoạt"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateModal;
