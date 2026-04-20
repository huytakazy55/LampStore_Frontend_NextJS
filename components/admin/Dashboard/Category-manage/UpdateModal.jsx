"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, Image, Switch, message } from 'antd';
import { UploadOutlined, EditOutlined, PictureOutlined } from '@ant-design/icons';
import CategoryManage from '@/services/CategoryManage';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';
import ReactQuill from 'react-quill-new';
import Compressor from 'compressorjs';
import 'react-quill-new/dist/quill.snow.css';

const UpdateModal = ({ openUpdate, handleUpdateClose, setCategoryData, updateId }) =>
{
  const { themeColors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() =>
  {
    if (openUpdate && updateId)
    {
      CategoryManage.GetCategoryById(updateId)
        .then((res) =>
        {
          form.setFieldsValue({ id: res?.data.id, name: res?.data.name, description: res?.data.description, isDisplayed: res?.data.isDisplayed !== false });
          setImageUrl(res?.data.imageUrl || '');
        })
        .catch(() => { });
    }
  }, [openUpdate, updateId, form]);

  const handleImageUpload = async (file) =>
  {
    if (file.size > 2 * 1024 * 1024) { message.error('Kích thước ảnh phải nhỏ hơn 2MB.'); return false; }
    setUploading(true);
    new Compressor(file, {
      quality: 0.8, maxWidth: 800, maxHeight: 600, mimeType: 'image/jpeg',
      success(compressedFile)
      {
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

  const handleSubmitUpdate = (values) =>
  {
    CategoryManage.UpdateCategory(updateId, values.name, values.description, imageUrl, values.isDisplayed !== false)
      .then(() =>
      {
        setCategoryData((prev) => prev.map((item) => (item.id === updateId ? { ...item, ...values, imageUrl, id: updateId } : item)));
        message.success('Cập nhật bản ghi thành công');
        handleUpdateClose();
      })
      .catch(() => message.error('Có lỗi xảy ra.'));
  };

  return (
    <Modal open={openUpdate} onCancel={handleUpdateClose} footer={null} destroyOnHidden title={null} styles={{ body: { padding: 0 } }}>
      <ModalHeader icon="✏️" title={t('Update')} subtitle="Chỉnh sửa thông tin danh mục" />
      <div style={{ padding: '24px 24px 16px' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmitUpdate}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
            <Input placeholder="Nhập tên danh mục" autoFocus />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <ReactQuill theme="snow" placeholder="Nhập mô tả danh mục" style={{ minHeight: 90, maxHeight: 120, overflow: 'auto' }} />
          </Form.Item>
          <Form.Item label="Ảnh danh mục">
            <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading} style={{ width: '100%', height: 42 }}>
                {uploading ? 'Đang nén và upload...' : 'Thay ảnh mới'}
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
          <Form.Item name="isDisplayed" label="Hiển thị" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
          <ModalFooter>
            <Button onClick={handleUpdateClose}>Đóng</Button>
            <Button type="primary" htmlType="submit" style={{ background: themeColors.EndColorLinear }} icon={<EditOutlined />}>Lưu lại</Button>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default UpdateModal;