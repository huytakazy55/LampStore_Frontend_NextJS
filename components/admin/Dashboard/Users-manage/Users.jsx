"use client";

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Table, Input, Button, Breadcrumb, Modal, Pagination, message, Space, Row, Col, Card, Checkbox, Tag } from 'antd';
import { LockOutlined, UnlockOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import UserManage from '@/services/UserManage';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/lib/router-compat';
import axios from 'axios';
import CreateUser from './CreateUser';
import EditUser from './EditUser';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const Users = () => {
  const { themeColors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const location = useLocation();
  const [userData, setUserData] = useState([]);
  const [roleData, setRoleData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [roleModalLoading, setRoleModalLoading] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await UserManage.GetUserAccount();
      setUserData(res.$values || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.message === "No authentication token found") {
        message.error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!');
      } else if (error.response?.status === 401) {
        message.error('Bạn không có quyền truy cập chức năng này!');
      } else if (error.response?.status === 403) {
        message.error('Truy cập bị từ chối!');
      } else {
        message.error('Có lỗi xảy ra khi tải danh sách người dùng!');
      }
      setLoading(false);
    }
  };

  // Load users khi component mount hoặc khi navigate đến trang users
  useEffect(() => {
    if (location.pathname === '/admin/users') {
      // Nếu đã initialized và đang navigate lại vào trang users, reset state
      if (hasInitialized) {
        setSearchTerm('');
        setPage(1);
        setSelectedRowKeys([]);
        setRoleData({});
      }
      
      fetchUsers();
      setHasInitialized(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await UserManage.GetAvailableRoles();
        setAvailableRoles(roles.$values || roles || []);
      } catch (error) {
        console.error('Error fetching available roles:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (userData.length > 0) {
      userData.forEach(async (user) => {
        try {
          const res = await UserManage.GetRoleById(user.id);
          setRoleData(prevState => ({
            ...prevState,
            [user.id]: res.data.$values || [],
          }));
        } catch (error) {
          console.error(`Error fetching role for user ${user.userName}:`, error);
          setRoleData(prevState => ({
            ...prevState,
            [user.id]: ['Unknown'],
          }));
        }
      });
    }
  }, [userData]);

  const updateUserLockStatus = (userId, isLocked) => {
    setUserData(prevData =>
      prevData.map(user =>
        user.id === userId ? { ...user, lockoutEnd: isLocked ? new Date(Date.now() + 1000 * 60 * 60) : null } : user
      )
    );
  };

  const LockUser = async (userId, username) => {
    try {
      await UserManage.LockUser(userId, username);
      message.success(`Đã khóa tài khoản ${username}`);
      updateUserLockStatus(userId, true);
    } catch (error) {
      console.error(`Error locking user ${username}:`, error);
      if (error.response?.status === 401) {
        message.error('Bạn không có quyền thực hiện hành động này!');
      } else {
        message.error('Có lỗi xảy ra khi khóa tài khoản');
      }
    }
  };

  const UnLockUser = async (userId, username) => {
    try {
      await UserManage.UnLockUser(userId, username);
      message.success(`Đã mở khóa tài khoản ${username}`);
      updateUserLockStatus(userId, false);
    } catch (error) {
      console.error(`Error unlocking user ${username}:`, error);
      if (error.response?.status === 401) {
        message.error('Bạn không có quyền thực hiện hành động này!');
      } else {
        message.error('Có lỗi xảy ra khi mở khóa tài khoản');
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return userData.filter(user =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userData, searchTerm]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (text, record, index) => (page - 1) * itemsPerPage + index + 1,
    },
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      align: 'center',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'userName',
      key: 'userName',
      width: 250,
      align: 'center',
      render: (text) => <span>{text}</span>,
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      filters: [
        ...Array.from(new Set(filteredUsers.map(u => u.userName))).map(name => ({
          text: name,
          value: name,
        }))
      ],
      onFilter: (value, record) => record.userName === value,
    },
    {
      title: 'Nhóm quyền',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      align: 'center',
      render: (text, record) => {
        const roles = roleData[record.id];
        if (!roles) return 'Loading...';
        return (
          <Space wrap style={{ justifyContent: 'center' }}>
            {(roles.$values || roles).map(role => (
              <Tag color="blue" key={role}>{role}</Tag>
            ))}
          </Space>
        );
      },
      sorter: (a, b) => {
        const roleA = (roleData[a.id]?.[0] || '').toString();
        const roleB = (roleData[b.id]?.[0] || '').toString();
        return roleA.localeCompare(roleB);
      },
      filters: availableRoles.map(role => ({ text: role, value: role })),
      onFilter: (value, record) => (roleData[record.id] || []).includes(value),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (text, record) => (
        <Space size="middle" style={{justifyContent: 'center', width: '100%'}}>
          {record.lockoutEnd && new Date(record.lockoutEnd) > new Date() ? (
            <Button
              icon={<UnlockOutlined />}
              onClick={() => UnLockUser(record.id, record.userName)}
              type="primary"
              size="small"
            >
              Mở khóa
            </Button>
          ) : (
            <Button
              icon={<LockOutlined />}
              onClick={() => LockUser(record.id, record.userName)}
              danger
              size="small"
            >
              Khóa
            </Button>
          )}
          <Button size="small" onClick={() => openRoleModal(record)}>
            Phân quyền
          </Button>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 40,
    columnTitle: '',
  };

  const handleBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true);
      if (!selectedRowKeys || selectedRowKeys.length === 0) {
        message.error('Vui lòng chọn bản ghi để xóa!');
        return;
      }
      const response = await axios.delete(`${API_URL}/users/bulk`, {
        data: { ids: selectedRowKeys }
      });
      if (response.data.success) {
        message.success(t('DeleteSuccess'));
        setSelectedRowKeys([]);
        fetchUsers();
      } else {
        message.error(t('DeleteFailed'));
      }
    } catch (error) {
      message.error(t('DeleteFailed'));
    } finally {
      setBulkDeleteLoading(false);
      setOpenBulkDelete(false);
    }
  };

  const openRoleModal = (user) => {
    setRoleModalUser(user);
    const roles = roleData[user.id];
    const normalized = roles?.$values || roles || [];
    setSelectedRoles(normalized);
    setRoleModalVisible(true);
  };

  const handleAssignRoles = async () => {
    if (!roleModalUser) return;
    setRoleModalLoading(true);
    try {
      await UserManage.AssignRoles(roleModalUser.id, selectedRoles);
      message.success('Cập nhật quyền thành công');
      // refresh roles for that user
      const res = await UserManage.GetRoleById(roleModalUser.id);
      setRoleData(prev => ({
        ...prev,
        [roleModalUser.id]: res.data.$values || [],
      }));
      setRoleModalVisible(false);
    } catch (error) {
      console.error('Error assigning roles:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Bạn không có quyền thực hiện hành động này!');
      } else if (error.response?.data) {
        message.error(error.response.data);
      } else {
        message.error('Có lỗi xảy ra khi cập nhật quyền');
      }
    } finally {
      setRoleModalLoading(false);
    }
  };


  return (
    <div style={{padding: '24px'}}>
      <div className="admin-table-card">
        {/* Title Bar */}
        <div
          className="admin-title-bar"
          style={{
            background: '#f6f8fc',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            padding: '24px 24px 16px 24px',
            marginBottom: 0
          }}
        >
          <div style={{fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear}}>
            {t('Users')}
          </div>
          <Breadcrumb
            items={[
              { title: t('Home') },
              { title: t('Users') }
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
          <Space>
            <Input.Search
              placeholder="Tìm kiếm tên người dùng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: 300 }}
            />
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => setOpenBulkDelete(true)}
                loading={bulkDeleteLoading}
              >
                {t('DeleteSelected')} ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreate(true)}>
            {t('Create')}
          </Button>
        </div>

        {/* Table */}
        <div style={{padding: '0 24px 24px 24px'}}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 900 }}
            className="custom-table"
          />
          <div className="flex justify-end mt-4">
            <Pagination
              current={page}
              pageSize={itemsPerPage}
              total={filteredUsers.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateUser
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onSuccess={() => {
          setOpenCreate(false);
          fetchUsers();
        }}
      />

      {/* Edit Modal */}
      {currentUser && (
        <EditUser
          open={openEdit}
          onCancel={() => {
            setOpenEdit(false);
            setCurrentUser(null);
          }}
          onSuccess={() => {
            setOpenEdit(false);
            setCurrentUser(null);
            fetchUsers();
          }}
          user={currentUser}
        />
      )}

      {/* Bulk Delete Modal */}
      <Modal
        title={t('ConfirmDelete')}
        open={openBulkDelete}
        onOk={handleBulkDelete}
        onCancel={() => setOpenBulkDelete(false)}
        confirmLoading={bulkDeleteLoading}
      >
        <p>{t('ConfirmDeleteSelected', { count: selectedRowKeys.length })}</p>
      </Modal>

      {/* Assign Roles Modal */}
      <Modal
        title={`Phân quyền - ${roleModalUser?.userName || ''}`}
        open={roleModalVisible}
        onOk={handleAssignRoles}
        onCancel={() => setRoleModalVisible(false)}
        confirmLoading={roleModalLoading}
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
    </div>
  );
};

export default Users;
