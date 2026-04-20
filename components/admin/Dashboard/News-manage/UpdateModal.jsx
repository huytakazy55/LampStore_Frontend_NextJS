"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import NewsService from '@/services/NewsService';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote'],
        ['link', 'image'],
        ['clean']
    ]
};

const UpdateModal = ({ newsItem, onClose, onSuccess }) =>
{
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [fileList, setFileList] = useState([]);

    useEffect(() =>
    {
        if (newsItem)
        {
            form.setFieldsValue(newsItem);
            setContent(newsItem.content || '');
            setImageUrl(newsItem.imageUrl || '');
            if (newsItem.imageUrl)
            {
                const fullUrl = newsItem.imageUrl.startsWith('http')
                    ? newsItem.imageUrl
                    : `${API_ENDPOINT}${newsItem.imageUrl}`;
                setFileList([{
                    uid: '-1',
                    name: 'Ảnh hiện tại',
                    status: 'done',
                    url: fullUrl
                }]);
            }
        }
    }, [newsItem, form]);

    const handleUpload = async ({ file, onSuccess: onUploadSuccess, onError }) =>
    {
        try
        {
            const res = await NewsService.uploadImage(file);
            const url = res.data.imageUrl;
            setImageUrl(url);
            setFileList([{
                uid: '-1',
                name: file.name,
                status: 'done',
                url: `${API_ENDPOINT}${url}`
            }]);
            onUploadSuccess && onUploadSuccess(res.data);
            message.success('Upload ảnh thành công!');
        } catch (err)
        {
            onError && onError(err);
            message.error('Upload ảnh thất bại!');
        }
    };

    const handleSubmit = async (values) =>
    {
        try
        {
            setLoading(true);
            await NewsService.updateNews(newsItem.id, { ...values, content, imageUrl });
            onSuccess();
        } catch (error)
        {
            message.error('Lỗi khi cập nhật tin tức!');
        } finally
        {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={<span className="text-xl font-bold">Cập nhật tin tức</span>}
            open={true}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={1000}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                    <Input placeholder="Nhập tiêu đề tin tức" size="large" />
                </Form.Item>
                <Form.Item name="excerpt" label="Mô tả ngắn" rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}>
                    <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn hiển thị trên trang chủ" />
                </Form.Item>
                <Form.Item label="Nội dung bài viết" required>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        placeholder="Soạn nội dung bài viết..."
                        style={{ minHeight: 250 }}
                    />
                </Form.Item>
                <Form.Item label="Ảnh bài viết" className="mt-4">
                    <Upload.Dragger
                        fileList={fileList}
                        customRequest={handleUpload}
                        accept="image/*"
                        maxCount={1}
                        listType="picture"
                        onRemove={() => { setImageUrl(''); setFileList([]); }}
                    >
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">Kéo thả ảnh hoặc bấm để chọn</p>
                        <p className="ant-upload-hint">Hỗ trợ JPG, PNG, GIF, WebP (tối đa 5MB)</p>
                    </Upload.Dragger>
                </Form.Item>
                <Form.Item name="category" label="Danh mục">
                    <Input placeholder="Góc tư vấn, Xu hướng, Công nghệ..." />
                </Form.Item>
                <Form.Item name="isActive" label="Trạng thái hiển thị" valuePropName="checked">
                    <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateModal;
