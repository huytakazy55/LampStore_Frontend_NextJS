"use client";

import React, { useContext, useState, useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import TagManage from '@/services/TagManage';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const UpdateModal = ({ openUpdate, handleUpdateClose, fetchTags, tag }) => {
    const { themeColors } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [updateData, setUpdateData] = useState({ id: '', name: '', description: '' });

    const handleSubmitUpdate = async (values) => {
        if (!values.name) { toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc!'); return; }
        try {
            await TagManage.UpdateTag({ id: updateData.id, name: values.name, description: values.description });
            fetchTags();
            toast.success('Cập nhật bản ghi thành công');
            handleUpdateClose();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật tag!');
        }
    };

    useEffect(() => {
        if (tag) {
            TagManage.GetTagById(tag.id)
                .then((res) => {
                    const formData = { id: res?.data?.id, name: res?.data?.name, description: res?.data?.description };
                    form.resetFields();
                    form.setFieldsValue(formData);
                    setUpdateData(formData);
                })
                .catch(() => toast.error('Có lỗi khi lấy dữ liệu.'));
        }
    }, [tag, form]);

    return (
        <Modal open={openUpdate} onCancel={handleUpdateClose} footer={null} width={700} destroyOnClose title={null} styles={{ body: { padding: 0 } }}>
            <ModalHeader icon="✏️" title="Cập nhật tag" subtitle="Chỉnh sửa thông tin tag" />
            <div style={{ padding: '24px 24px 16px' }}>
                <Form form={form} layout="vertical" onFinish={handleSubmitUpdate}>
                    <Form.Item name="name" label="Tên tag" rules={[{ required: true, message: 'Vui lòng nhập tên tag!' }]}>
                        <Input placeholder="Nhập tên tag" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <ReactQuill theme="snow" placeholder="Nhập mô tả tag" />
                    </Form.Item>
                    <ModalFooter>
                        <Button onClick={handleUpdateClose} icon={<CloseOutlined />}>Đóng</Button>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} style={{ background: themeColors.StartColorLinear }}>Lưu lại</Button>
                    </ModalFooter>
                </Form>
            </div>
        </Modal>
    );
};

export default UpdateModal;