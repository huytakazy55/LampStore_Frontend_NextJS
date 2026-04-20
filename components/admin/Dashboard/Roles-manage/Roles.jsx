"use client";

import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card, Table, Tag, Space, Button, Modal, Checkbox, Row, Col, message, Input, Select, Spin, Breadcrumb } from 'antd';
import { ThemeContext } from '@/contexts/ThemeContext';
import UserManage from '@/services/UserManage';

const Roles = () => {
  const { themeColors } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleData, setRoleData] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableMenus, setAvailableMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [creating, setCreating] = useState(false);
  const [menuConfigModalOpen, setMenuConfigModalOpen] = useState(false);
  const [menuConfigRole, setMenuConfigRole] = useState(null);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [savingMenus, setSavingMenus] = useState(false);

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UserManage.GetUserAccount();
      const list = res.$values || [];
      setUsers(list);

      // preload roles per user
      await Promise.all(
        list.map(async (user) => {
          try {
            const r = await UserManage.GetRoleById(user.id);
            setRoleData(prev => ({
              ...prev,
              [user.id]: r.data.$values || [],
            }));
          } catch (err) {
            setRoleData(prev => ({
              ...prev,
              [user.id]: [],
            }));
          }
        })
      );
    } catch (error) {
      message.error('Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const roles = await UserManage.GetAvailableRoles();
      setAvailableRoles(roles.$values || roles || []);
    } catch (error) {
      message.error('Không tải được danh sách quyền');
    }
  };

  const fetchAvailableMenus = async () => {
    try {
      const menus = await UserManage.GetAvailableMenus();
      setAvailableMenus(menus.$values || menus || []);
    } catch (error) {
      message.error('Không tải được danh sách menu');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
    fetchAvailableMenus();
  }, []);

  const openRoleModal = (user) => {
    const roles = roleData[user.id];
    const normalized = roles?.$values || roles || [];
    setSelectedRoles(normalized);
    setModalUser(user);
    setModalOpen(true);
  };

  const openMenuConfigModal = async () => {
    if (!availableRoles || availableRoles.length === 0) {
      message.warning('Chưa có quyền nào để cấu hình menu');
      return;
    }
    const defaultRole = availableRoles[0];
    setMenuConfigRole(defaultRole);
    setMenuConfigModalOpen(true);
    await loadRoleMenus(defaultRole);
  };

  const loadRoleMenus = async (roleName) => {
    if (!roleName) return;
    setLoadingMenus(true);
    try {
      const menus = await UserManage.GetRoleMenus(roleName);
      setSelectedMenus(menus.$values || menus || []);
    } catch (error) {
      message.error('Không tải được menu của quyền này');
      setSelectedMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  };

  const handleSaveRoleMenus = async () => {
    if (!menuConfigRole) {
      message.error('Vui lòng chọn quyền cần cấu hình');
      return;
    }
    setSavingMenus(true);
    try {
      await UserManage.SetRoleMenus(menuConfigRole, selectedMenus);
      message.success('Cập nhật menu cho quyền thành công');
      setMenuConfigModalOpen(false);
    } catch (error) {
      if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error('Có lỗi xảy ra khi cập nhật menu cho quyền');
      }
    } finally {
      setSavingMenus(false);
    }
  };

  const handleAssignRoles = async () => {
    if (!modalUser) return;
    setSaving(true);
    try {
      await UserManage.AssignRoles(modalUser.id, selectedRoles);
      message.success('Cập nhật quyền thành công');
      const res = await UserManage.GetRoleById(modalUser.id);
      setRoleData(prev => ({
        ...prev,
        [modalUser.id]: res.data.$values || [],
      }));
      setModalOpen(false);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Bạn không có quyền thực hiện hành động này!');
      } else if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error('Có lỗi xảy ra khi cập nhật quyền');
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 70,
      align: 'center',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'userName',
      key: 'userName',
      width: 220,
    },
    {
      title: 'Quyền hiện tại',
      dataIndex: 'roles',
      key: 'roles',
      render: (_, record) => {
        const roles = roleData[record.id];
        if (!roles) return '...';
        const list = roles.$values || roles;
        if (!list || list.length === 0) return 'Chưa có';
        return (
          <Space wrap>
            {list.map(r => (
              <Tag color="blue" key={r}>{r}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button size="small" onClick={() => openRoleModal(record)}>
          Phân quyền
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div className="admin-table-card">
        {/* Title Bar */}
        <div
          className="admin-title-bar"
          style={{
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            padding: '24px 24px 16px 24px',
            marginBottom: 0
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
            Quản lý quyền &amp; vai trò
          </div>
          <Breadcrumb
            items={[
              { title: 'Trang chủ' },
              { title: 'Quản lý quyền & vai trò' }
            ]}
            style={{ marginTop: '8px' }}
          />
        </div>
        {/* Filter Bar */}
        <div
          className="admin-filter-bar"
          style={{
            padding: '16px 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Input.Search
            placeholder="Tìm kiếm tên đăng nhập..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
          <Space>
            <Button onClick={openMenuConfigModal}>
              Cấu hình menu theo quyền
            </Button>
            <Button type="primary" onClick={() => setCreateModalOpen(true)}>
              Thêm quyền
            </Button>
          </Space>
        </div>
        {/* Table */}
        <div className="admin-table-wrapper" style={{ padding: '0 24px 24px 24px' }}>
          <Table
            rowKey="id"
            dataSource={filteredUsers}
            columns={columns}
            loading={loading}
            pagination={false}
            className="custom-table"
            scroll={{ x: 700 }}
          />
        </div>
      </div>

      <Modal
        title={`Phân quyền - ${modalUser?.userName || ''}`}
        open={modalOpen}
        onOk={handleAssignRoles}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
      >
        <Checkbox.Group
          style={{ width: '100%' }}
          value={selectedRoles}
          onChange={setSelectedRoles}
        >
          <Row gutter={[0, 8]}>
            {availableRoles.map(role => (
              <Col span={24} key={role}>
                <Checkbox value={role}>{role}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal>

      <Modal
        title="Cấu hình menu theo quyền"
        open={menuConfigModalOpen}
        onOk={handleSaveRoleMenus}
        onCancel={() => setMenuConfigModalOpen(false)}
        confirmLoading={savingMenus}
      >
        <div style={{ marginBottom: 16 }}>
          <span className="block mb-2 font-medium">Chọn quyền</span>
          <Select
            style={{ width: '100%' }}
            value={menuConfigRole}
            onChange={(value) => {
              setMenuConfigRole(value);
              loadRoleMenus(value);
            }}
          >
            {availableRoles.map(role => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div>
          <span className="block mb-2 font-medium">Chọn menu được phép truy cập</span>
          {loadingMenus ? (
            <div className="flex justify-center py-6">
              <Spin />
            </div>
          ) : (
            <Checkbox.Group
              style={{ width: '100%' }}
              value={selectedMenus}
              onChange={setSelectedMenus}
            >
              <Row gutter={[0, 8]}>
                {availableMenus.map(menu => (
                  <Col span={24} key={menu}>
                    <Checkbox value={menu}>{menu}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          )}
        </div>
      </Modal>

      <Modal
        title="Thêm quyền mới"
        open={createModalOpen}
        onOk={async () => {
          if (!newRoleName.trim()) {
            message.error('Tên quyền không được để trống');
            return;
          }
          setCreating(true);
          try {
            await UserManage.AddRole(newRoleName.trim());
            message.success('Tạo quyền thành công');
            setNewRoleName('');
            setCreateModalOpen(false);
            fetchAvailableRoles();
          } catch (error) {
            if (error.response?.data) {
              message.error(error.response.data);
            } else {
              message.error('Không thể tạo quyền');
            }
          } finally {
            setCreating(false);
          }
        }}
        onCancel={() => setCreateModalOpen(false)}
        confirmLoading={creating}
      >
        <Input
          placeholder="Tên quyền (ví dụ: Manager)"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          maxLength={50}
        />
      </Modal>
    </div>
  );
};

export default Roles;

