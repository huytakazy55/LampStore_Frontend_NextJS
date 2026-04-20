"use client";

import React, { useContext, useState } from 'react';
import { Modal, Form, Input, Button, Upload, Image, Switch, message } from 'antd';
import { UploadOutlined, PlusOutlined, PictureOutlined } from '@ant-design/icons';
import CategoryManage from '@/services/CategoryManage';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';
import ReactQuill from 'react-quill';
import Compressor from 'compressorjs';
import 'react-quill/dist/quill.snow.css';

const CreateModal = ({ openCreate, handleCreateClose, setCategoryData }) => {
  const { themeColors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file) => {
    if (file.size > 2 * 1024 * 1024) { message.error('Kích thước ảnh phải nhỏ hơn 2MB.'); return false; }
    setUploading(true);
    new Compressor(file, {
      quality: 0.8, maxWidth: 800, maxHeight: 600, mimeType: 'image/jpeg',
      success(compressedFile) {
        const renamedFile = new File([compressedFile], `category_${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
        CategoryManage.UploadImage(renamedFile)
          .then((response) => { setImageUrl(response.data.imageUrl); message.success('Upload ảnh thành công!'); })
          .catch(() => message.error('Upload ảnh thất bại!'))
          .finally(() => setUploading(false));
      },
      error() { message.error('Có lỗi xảy ra khi nén ảnh.'); setUploading(false); }
    });
    return false;
  };

  const handleSubmitCreate = (values) => {
    CategoryManage.CreateCategory(values.name, values.description, imageUrl, values.isDisplayed !== false)
      .then((res) => {
        message.success('Thêm mới danh mục thành công!');
        setCategoryData(prevData => [...prevData, res.data]);
        form.resetFields();
        setImageUrl('');
        handleCreateClose();
      })
      .catch(() => message.error('Có lỗi xảy ra!'));
  };

  return (
    <Modal open={openCreate} onCancel={handleCreateClose} footer={null} destroyOnClose title={null} styles={{ body: { padding: 0 } }}>
      <ModalHeader icon="➕" title={t('Create')} subtitle="Thêm danh mục mới vào hệ thống" />
      <div style={{ padding: '24px 24px 16px' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmitCreate}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
            <Input placeholder="Nhập tên danh mục" autoFocus />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <ReactQuill theme="snow" placeholder="Nhập mô tả danh mục" style={{ minHeight: 90, maxHeight: 120, overflow: 'auto' }} />
          </Form.Item>
          <Form.Item label="Ảnh danh mục">
            <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading} style={{ width: '100%', height: 42 }}>
                {uploading ? 'Đang nén và upload...' : 'Chọn ảnh'}
              </Button>
            </Upload>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Ảnh tự động nén. Tối đa 2MB.</div>
            {imageUrl ? (
              <div style={{ marginTop: 12 }}>
                <Image width="100%" src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${imageUrl}`} style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </div>
            ) : (
              <div style={{ marginTop: 12, width: '100%', height: 120, background: '#f9fafb', border: '1.5px dashed #d1d5db', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 8 }}>
                <PictureOutlined style={{ fontSize: 28 }} />
                <span style={{ fontSize: 13 }}>Chưa có ảnh</span>
              </div>
            )}
          </Form.Item>
          <Form.Item name="isDisplayed" label="Hiển thị" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" defaultChecked />
          </Form.Item>
          <ModalFooter>
            <Button onClick={handleCreateClose}>Đóng</Button>
            <Button type="primary" htmlType="submit" style={{ background: themeColors.EndColorLinear }} icon={<PlusOutlined />}>Lưu lại</Button>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateModal;