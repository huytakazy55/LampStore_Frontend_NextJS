"use client";

import React, { useContext } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import TagManage from '@/services/TagManage';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateModal = ({ openCreate, handleCreateClose, fetchTags }) => {
    const { themeColors } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const handleSubmitCreate = async (values) => {
        if (!values.name) { toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc!'); return; }
        try {
            await TagManage.CreateTag({ name: values.name, description: values.description });
            fetchTags();
            toast.success('Thêm bản ghi thành công');
            handleCreateClose();
            form.resetFields();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm tag!');
        }
    };

    return (
        <Modal open={openCreate} onCancel={handleCreateClose} footer={null} width={700} destroyOnClose title={null} styles={{ body: { padding: 0 } }}>
            <ModalHeader icon="🏷️" title="Thêm tag mới" subtitle="Tạo một tag mới để phân loại sản phẩm" />
            <div style={{ padding: '24px 24px 16px' }}>
                <Form form={form} layout="vertical" onFinish={handleSubmitCreate}>
                    <Form.Item name="name" label="Tên tag" rules={[{ required: true, message: 'Vui lòng nhập tên tag!' }]}>
                        <Input placeholder="Nhập tên tag" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <ReactQuill theme="snow" placeholder="Nhập mô tả tag" />
                    </Form.Item>
                    <ModalFooter>
                        <Button onClick={handleCreateClose} icon={<CloseOutlined />}>Đóng</Button>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ background: themeColors.StartColorLinear }}>Lưu lại</Button>
                    </ModalFooter>
                </Form>
            </div>
        </Modal>
    );
};

export default CreateModal;