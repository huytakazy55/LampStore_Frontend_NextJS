"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, Image, Switch, message, Row, Col } from 'antd';
import { UploadOutlined, EditOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons';
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
      quality: 0.6, maxWidth: 800, maxHeight: 600, mimeType: 'image/jpeg',
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
    <Modal
      open={openUpdate}
      onCancel={handleUpdateClose}
      footer={null}
      destroyOnHidden
      title={null}
      width={900}
      className="admin-category-modal"
      styles={{ body: { padding: 0 } }}
    >
      <ModalHeader icon="✏️" title={t('Update')} />
      <div className="admin-category-modal-body">
        <Form form={form} layout="vertical" onFinish={handleSubmitUpdate}>
          <Row gutter={28}>
            {/* Left column - Form fields */}
            <Col xs={24} md={14}>
              <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
                <Input placeholder="Nhập tên danh mục" autoFocus />
              </Form.Item>
              <Form.Item name="description" label="Mô tả">
                <ReactQuill theme="snow" placeholder="Nhập mô tả danh mục" className="admin-category-editor" />
              </Form.Item>
              <Form.Item name="isDisplayed" label="Hiển thị" valuePropName="checked">
                <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>

            {/* Right column - Image */}
            <Col xs={24} md={10}>
              <Form.Item label="Ảnh danh mục">
                {imageUrl ? (
                  <div className="admin-category-image-frame">
                    <Image
                      width="100%"
                      height={220}
                      src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${imageUrl}`}
                      style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => setImageUrl('')}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(255,255,255,0.85)', borderRadius: '50%',
                        width: 34, height: 34, padding: 0, minWidth: 0,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
                      }}
                    />
                  </div>
                ) : (
                  <div className="admin-category-image-empty">
                    <PictureOutlined style={{ fontSize: 38 }} />
                    <span>Chưa có ảnh</span>
                  </div>
                )}
                <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                  <Button icon={<UploadOutlined />} loading={uploading} className="admin-category-upload-btn">
                    {uploading ? 'Đang upload...' : 'Thay ảnh mới'}
                  </Button>
                </Upload>
                <div className="admin-category-upload-note">Tối đa 2MB, tự nén</div>
              </Form.Item>
            </Col>
          </Row>

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
