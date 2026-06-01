"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, Switch, InputNumber, message } from 'antd';
import { PlusOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import BannerService from '@/services/BannerService';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';

const CreateModal = ({ onClose, onSuccess }) =>
{
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleImageChange = (info) =>
    {
        if (info.file.status === 'removed')
        {
            setImageFile(null);
            setPreviewUrl('');
            return;
        }
        const file = info.file?.originFileObj || (info.fileList && info.fileList[0]?.originFileObj);
        if (file)
        {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type))
            {
                message.error('Chỉ chấp nhận file JPG, JPEG, PNG, GIF!');
                return;
            }
            if (file.size > 5 * 1024 * 1024)
            {
                message.error('File quá lớn! Kích thước tối đa là 5MB.');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () =>
            {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values) =>
    {
        setLoading(true);
        try
        {
            if (!imageFile)
            {
                message.error('Vui lòng chọn hình ảnh cho banner!');
                setLoading(false);
                return;
            }
            const uploadResult = await BannerService.uploadBannerImage(imageFile);
            let imageUrl = '';
            if (uploadResult && uploadResult.imageUrl)
            {
                imageUrl = uploadResult.imageUrl;
            } else if (uploadResult && typeof uploadResult === 'string')
            {
                imageUrl = uploadResult;
            } else if (uploadResult && uploadResult.url)
            {
                imageUrl = uploadResult.url;
            } else
            {
                message.error('Lỗi: Không nhận được URL hình ảnh từ server!');
                setLoading(false);
                return;
            }
            const createData = { ...values, imageUrl };
            await BannerService.createBanner(createData);
            message.success('Tạo banner thành công');
            form.resetFields();
            setImageFile(null);
            setPreviewUrl('');
            onSuccess();
        } catch (error)
        {
            if (error.response?.data?.errors?.ImageUrl)
            {
                message.error('Lỗi: Vui lòng chọn hình ảnh cho banner!');
            } else if (error.response?.data?.errors)
            {
                const errorsData = error.response.data.errors;
                const errorMessages = Array.isArray(errorsData) ? errorsData : 
                    (errorsData.$values ? errorsData.$values : Object.values(errorsData).flat());
                message.error(`Lỗi: ${errorMessages.join(', ')}`);
            } else if (error.response?.data?.message)
            {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else
            {
                message.error('Lỗi khi tạo banner');
            }
        } finally
        {
            setLoading(false);
        }
    };

    const uploadProps = {
        beforeUpload: () => false,
        onChange: handleImageChange,
        accept: 'image/*',
        showUploadList: false,
    };

    return (
        <Modal
            open={true}
            onCancel={onClose}
            footer={null}
            width={960}
            destroyOnHidden
            title={null}
            styles={{ body: { padding: 0 }, content: { maxWidth: 'calc(100vw - 32px)' } }}
        >
            <ModalHeader icon="🖼️" title="Tạo Banner Mới" />

            {/* Form body */}
            <div style={{ padding: '22px 24px 16px' }}>
                <style jsx>{`
                    .banner-create-grid {
                        display: grid;
                        grid-template-columns: minmax(0, 1fr) minmax(340px, 0.95fr);
                        gap: 20px 24px;
                        align-items: start;
                    }

                    .banner-create-meta {
                        display: grid;
                        grid-template-columns: minmax(0, 1fr) minmax(160px, 0.45fr);
                        gap: 16px;
                    }

                    .banner-preview-box {
                        width: 100%;
                        aspect-ratio: 16 / 9;
                        min-height: 210px;
                        background: #f9fafb;
                        border: 1.5px dashed #d1d5db;
                        border-radius: 10px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: #9ca3af;
                        gap: 8px;
                        overflow: hidden;
                    }

                    .banner-preview-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                    }

                    @media (max-width: 820px) {
                        .banner-create-grid,
                        .banner-create-meta {
                            grid-template-columns: 1fr;
                        }
                    }
                `}</style>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ isActive: true, order: 0 }}
                >
                    <div className="banner-create-grid">
                        <div>
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                            >
                                <Input placeholder="Nhập tiêu đề banner" />
                            </Form.Item>

                            <Form.Item name="description" label="Mô tả">
                                <Input.TextArea rows={4} placeholder="Nhập mô tả banner" />
                            </Form.Item>

                            <Form.Item name="linkUrl" label="Link URL">
                                <Input placeholder="Nhập link URL (tùy chọn)" />
                            </Form.Item>

                            <div className="banner-create-meta">
                                <Form.Item name="order" label="Thứ tự">
                                    <InputNumber
                                        min={0}
                                        placeholder="Nhập thứ tự hiển thị"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                                </Form.Item>
                            </div>
                        </div>

                        <div>
                            <Form.Item
                                label="Hình ảnh"
                                required
                                validateStatus={!imageFile ? 'error' : ''}
                                help={!imageFile ? 'Vui lòng chọn hình ảnh cho banner!' : ''}
                            >
                                <Upload {...uploadProps} style={{ width: '100%', display: 'block' }}>
                                    <Button
                                        icon={<UploadOutlined />}
                                        style={{ width: '100%', height: 40, fontSize: 14 }}
                                    >
                                        Chọn ảnh
                                    </Button>
                                </Upload>

                                <div className="banner-preview-box" style={{ marginTop: 12 }}>
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="banner-preview-image"
                                        />
                                    ) : (
                                        <>
                                            <PictureOutlined style={{ fontSize: 34 }} />
                                            <span style={{ fontSize: 13 }}>Xem trước ảnh sẽ hiển thị ở đây</span>
                                        </>
                                    )}
                                </div>
                                <div style={{ marginTop: 8, color: '#9ca3af', fontSize: 12 }}>
                                    Hỗ trợ JPG, PNG, GIF. Tối đa 5MB.
                                </div>
                            </Form.Item>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<PlusOutlined />}
                        >
                            Tạo Banner
                        </Button>
                    </ModalFooter>
                </Form>
            </div>
        </Modal>
    );
};

export default CreateModal;
