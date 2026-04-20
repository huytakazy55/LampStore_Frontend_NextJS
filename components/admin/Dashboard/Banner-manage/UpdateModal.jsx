"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Button, Switch, InputNumber, message } from 'antd';
import { EditOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import BannerService from '@/services/BannerService';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const UpdateModal = ({ banner, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (banner) {
            form.setFieldsValue({
                title: banner.title || '',
                description: banner.description || '',
                linkUrl: banner.linkUrl || '',
                order: banner.order || 0,
                isActive: banner.isActive !== undefined ? banner.isActive : true
            });
            if (banner.imageUrl) {
                setPreviewUrl(banner.imageUrl.startsWith('http') ? banner.imageUrl : `${API_ENDPOINT}${banner.imageUrl}`);
            } else {
                setPreviewUrl('');
            }
            setImageFile(null);
        }
    }, [banner, form]);

    const handleImageChange = (info) => {
        if (info.file.status === 'removed') {
            setImageFile(null);
            setPreviewUrl(banner.imageUrl ? (banner.imageUrl.startsWith('http') ? banner.imageUrl : `${API_ENDPOINT}${banner.imageUrl}`) : '');
            return;
        }
        const file = info.file?.originFileObj || (info.fileList && info.fileList[0]?.originFileObj);
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) { message.error('Chỉ chấp nhận file JPG, PNG, GIF!'); return; }
            if (file.size > 5 * 1024 * 1024) { message.error('File quá lớn! Tối đa 5MB.'); return; }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            let updatedImageUrl = banner.imageUrl;
            if (imageFile) {
                const uploadResult = await BannerService.uploadBannerImage(imageFile);
                if (uploadResult?.imageUrl) updatedImageUrl = uploadResult.imageUrl;
                else if (typeof uploadResult === 'string') updatedImageUrl = uploadResult;
                else if (uploadResult?.url) updatedImageUrl = uploadResult.url;
                else { message.error('Lỗi: Không nhận được URL ảnh!'); setLoading(false); return; }
            }
            await BannerService.updateBanner(banner.id, { ...values, imageUrl: updatedImageUrl });
            message.success('Cập nhật banner thành công');
            onSuccess();
        } catch (error) {
            message.error(error.response?.data || 'Lỗi khi cập nhật banner');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = { beforeUpload: () => false, onChange: handleImageChange, accept: 'image/*', showUploadList: false };

    return (
        <Modal open={true} onCancel={onClose} footer={null} width={600} destroyOnClose title={null} styles={{ body: { padding: 0 } }}>
            <ModalHeader icon="✏️" title="Cập nhật Banner" />
            <div style={{ padding: '24px 24px 16px' }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                        <Input placeholder="Nhập tiêu đề banner" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Nhập mô tả banner" />
                    </Form.Item>
                    <Form.Item label="Hình ảnh">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />} style={{ width: '100%', height: 42 }}>Thay đổi ảnh</Button>
                        </Upload>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" style={{ marginTop: 12, width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                        ) : (
                            <div style={{ marginTop: 12, width: '100%', height: 140, background: '#f9fafb', border: '1.5px dashed #d1d5db', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 8 }}>
                                <PictureOutlined style={{ fontSize: 32 }} />
                                <span style={{ fontSize: 13 }}>Xem trước ảnh sẽ hiển thị ở đây</span>
                            </div>
                        )}
                    </Form.Item>
                    <Form.Item name="linkUrl" label="Link URL">
                        <Input placeholder="Nhập link URL (tùy chọn)" />
                    </Form.Item>
                    <Form.Item name="order" label="Thứ tự">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                    </Form.Item>
                    <ModalFooter>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={loading} icon={<EditOutlined />}>Cập nhật</Button>
                    </ModalFooter>
                </Form>
            </div>
        </Modal>
    );
};

export default UpdateModal;