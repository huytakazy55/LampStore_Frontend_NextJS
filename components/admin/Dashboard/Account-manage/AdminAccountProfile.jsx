"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Button, Form, Input, Spin, message } from 'antd';
import AdminPageHeader from '../shared/AdminPageHeader';
import ProfileService from '@/services/ProfileService';
import { ThemeContext } from '@/contexts/ThemeContext';

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nameid
      || payload.sub
      || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      || '';
  } catch {
    return '';
  }
};

const getCurrentUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.nameid
        || payload.sub
        || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || '',
      name: payload.unique_name || payload.name || payload.UserName || '',
      email: payload.email
        || payload.Email
        || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        || '',
    };
  } catch {
    return {};
  }
};

const AdminAccountProfile = () => {
  const [form] = Form.useForm();
  const { themeColors } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    const currentUser = getCurrentUserInfo();
    try {
      setLoading(true);
      const response = await ProfileService.GetCurrentProfile();
      const data = response.data || {};
      const fallbackEmail = data.email
        || data.Email
        || data.accountEmail
        || data.AccountEmail
        || data.user?.email
        || data.User?.Email
        || currentUser.email
        || localStorage.getItem('userEmail')
        || '';
      setProfile(data);
      form.setFieldsValue({
        fullName: data.fullName || data.FullName || currentUser.name || '',
        email: fallbackEmail,
        phoneNumber: data.phoneNumber || data.PhoneNumber || data.accountPhoneNumber || data.AccountPhoneNumber || '',
        address: data.address || data.Address || '',
      });
    } catch {
      setProfile(null);
      form.setFieldsValue({
        fullName: currentUser.name || '',
        email: currentUser.email || localStorage.getItem('userEmail') || '',
        phoneNumber: '',
        address: '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (values) => {
    const userId = profile?.userId || getCurrentUserId();
    if (!userId) {
      message.error('Không xác định được tài khoản hiện tại.');
      return;
    }

    try {
      setSaving(true);
      if (profile?.id) {
        await ProfileService.UpdateUserProfile(
          profile.id,
          values.fullName,
          userId,
          values.email,
          values.phoneNumber,
          values.address
        );
      } else {
        const response = await ProfileService.CreateUserProfile(
          values.fullName,
          userId,
          values.email,
          values.phoneNumber,
          values.address
        );
        setProfile(response.data);
      }
      message.success('Đã cập nhật thông tin tài khoản.');
      loadProfile();
    } catch (error) {
      console.error('Update admin profile error:', error);
      message.error('Cập nhật thông tin thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <AdminPageHeader
        title="Thông tin tài khoản"
        description="Quản lý thông tin cá nhân của tài khoản admin hiện tại."
        breadcrumbItems={[
          { title: 'Trang chủ' },
          { title: 'Thông tin tài khoản' },
        ]}
      />

      <div className="admin-table-card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spin />
          </div>
        ) : (
          <div style={{ maxWidth: 760 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 24,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
              }}>
                <i className="bx bx-user" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                  {profile?.fullName || profile?.FullName || getCurrentUserInfo().name || 'Tài khoản admin'}
                </div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  {form.getFieldValue('email') || profile?.accountEmail || profile?.AccountEmail || localStorage.getItem('userEmail') || 'Chưa có email'}
                </div>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0 16px',
              }}>
                <Form.Item
                  label="Họ tên"
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phoneNumber"
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <Input placeholder="Nhập địa chỉ" />
                </Form.Item>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Button onClick={loadProfile} disabled={saving}>
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  style={{
                    border: 'none',
                    background: `linear-gradient(135deg, ${themeColors.StartColorLinear}, ${themeColors.EndColorLinear})`,
                  }}
                >
                  Lưu thông tin
                </Button>
              </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccountProfile;
