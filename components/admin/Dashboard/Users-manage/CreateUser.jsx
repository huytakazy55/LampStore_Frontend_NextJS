"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { UserAddOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import UserManage from '@/services/UserManage';
import { ModalHeader, ModalFooter } from '../shared/ModalComponents';

const CreateUser = ({ open, onCancel, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const response = await UserManage.CreateUser(values);
      if (response.data.success) {
        message.success(t('CreateSuccess'));
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      message.error(t('CreateFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={600} title={null} styles={{ body: { padding: 0 } }}>
      <ModalHeader icon="👤" title={t('CreateUser')} subtitle="Tạo tài khoản người dùng mới" />
      <div style={{ padding: '24px 24px 16px' }}>
        <Form form={form} layout="vertical" initialValues={{ role: 'User' }}>
          <Form.Item name="userName" label={t('Username')} rules={[{ required: true, message: t('PleaseInputUsername') }, { min: 3, message: t('UsernameMinLength') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('Email')} rules={[{ required: true, message: t('PleaseInputEmail') }, { type: 'email', message: t('InvalidEmail') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t('Password')} rules={[{ required: true, message: t('PleaseInputPassword') }, { min: 6, message: t('PasswordMinLength') }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label={t('ConfirmPassword')} dependencies={['password']} rules={[
            { required: true, message: t('PleaseConfirmPassword') },
            ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error(t('PasswordsDoNotMatch'))); } }),
          ]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label={t('Role')} rules={[{ required: true, message: t('PleaseSelectRole') }]}>
            <Select>
              <Select.Option value="Admin">{t('Admin')}</Select.Option>
              <Select.Option value="User">{t('User')}</Select.Option>
            </Select>
          </Form.Item>
          <ModalFooter>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit} icon={<SaveOutlined />}>
              {t('CreateUser')}
            </Button>
          </ModalFooter>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateUser;