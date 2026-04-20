"use client";

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Table, Input, Button, Breadcrumb, Pagination, Modal, message, Space, Row, Col, Card, Image, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import CategoryManage from '@/services/CategoryManage';
import { useTranslation } from 'react-i18next';
import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

const Category = () =>
{
  const { themeColors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [categoryData, setCategoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(0);
  const [updateData, setUpdateData] = useState({ id: '', name: '', description: '' });
  const [categoryCreate, setCategoryCreate] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchCategories = () =>
  {
    setLoading(true);
    CategoryManage.GetCategory()
      .then((res) =>
      {
        setCategoryData(res.data.$values);
        setLoading(false);
      })
      .catch(() =>
      {
        message.error('Có lỗi xảy ra!');
        setLoading(false);
      });
  };

  useEffect(() =>
  {
    fetchCategories();
  }, []);

  const handleDelete = (id, name) =>
  {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa danh mục "${name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () =>
      {
        CategoryManage.DeleteCategory(id, name)
          .then(() =>
          {
            setCategoryData(prev => prev.filter(category => category.id !== id));
            message.success(`Đã xóa bản ghi có id = ${id}: ${name}`);
          })
          .catch(() =>
          {
            message.error('Có lỗi xảy ra');
          });
      },
    });
  };

  const handleToggleDisplay = async (id, currentStatus, categoryName) =>
  {
    try
    {
      const category = categoryData.find(cat => cat.id === id);
      if (!category)
      {
        console.error('Category not found:', id);
        return;
      }



      const response = await CategoryManage.UpdateCategory(
        id,
        category.name,
        category.description,
        category.imageUrl,
        !currentStatus
      );


      if (response.status === 200 || response.status === 204)
      {
        setCategoryData(prev =>
        {
          return prev.map(cat =>
            cat.id === id ? { ...cat, isDisplayed: !currentStatus } : cat
          );
        });
        message.success(`Đã ${!currentStatus ? 'hiển thị' : 'ẩn'} danh mục "${categoryName}"`);
      } else
      {
        console.error('Unexpected response status:', response.status);
        message.error('Có lỗi xảy ra khi cập nhật trạng thái hiển thị');
      }
    } catch (error)
    {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái hiển thị');
      console.error('Toggle display error:', error);
    }
  };

  const filteredCategories = useMemo(() =>
  {
    return categoryData.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryData, searchTerm]);

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
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      align: 'center',
      render: (imageUrl) =>
      {
        if (imageUrl)
        {
          const imageSrc = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_ENDPOINT}${imageUrl}`
          return (
            <Image
              width={50}
              height={50}
              src={imageSrc}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+9Ggtsu1VUYbMGYrIGgdWAgtqM7qHr3Tlu3Vsr7nXZR6jUagDMH0Eh3vW2yIiLFQUJqShJI2kyj9SdNepI+vGe5Pql5+dft+"
            />
          )
        }
        return (
          <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: '#999' }}>No Image</span>
          </div>
        )
      }
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filters: [
        ...Array.from(new Set(filteredCategories.map(c => c.name))).map(name => ({
          text: name,
          value: name,
        }))
      ],
      onFilter: (value, record) => record.name === value,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 400,
      align: 'center',
      render: (text) => text && text.split(' ').slice(0, 25).join(' ') + (text.split(' ').length > 25 ? ' ...' : ''),
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      filters: [
        ...Array.from(new Set(filteredCategories.map(c => c.description))).map(desc => ({
          text: desc && desc.split(' ').slice(0, 8).join(' ') + (desc.split(' ').length > 8 ? ' ...' : ''),
          value: desc,
        }))
      ],
      onFilter: (value, record) => record.description === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      align: 'center',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-')
    },
    {
      title: 'Ngày sửa đổi',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      align: 'center',
      sorter: (a, b) =>
      {
        if (!a.updatedAt) return -1;
        if (!b.updatedAt) return 1;
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      },
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-') : '--'
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isDisplayed',
      key: 'isDisplayed',
      width: 100,
      align: 'center',
      filters: [
        { text: 'Hiển thị', value: true },
        { text: 'Ẩn', value: false },
      ],
      onFilter: (value, record) => record.isDisplayed === value,
      render: (isDisplayed, record) =>
      {
        return (
          <Switch
            checked={isDisplayed !== false} // Default to true if undefined
            onChange={() => handleToggleDisplay(record.id, isDisplayed !== false, record.name)}
            checkedChildren="Hiện"
            unCheckedChildren="Ẩn"
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (text, record) => (
        <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
            {
              setUpdateId(record.id);
              setOpenUpdate(true);
            }}
            size="small"
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.name)}
            danger
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) =>
  {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 40,
    columnTitle: '',
  };

  const handleBulkDelete = async () =>
  {
    try
    {
      setBulkDeleteLoading(true);
      if (!selectedRowKeys || selectedRowKeys.length === 0)
      {
        message.error('Vui lòng chọn bản ghi để xóa!');
        return;
      }
      const response = await CategoryManage.BulkDeleteCategories(selectedRowKeys);
      if (response.data.success || response.status === 200 || response.status === 204)
      {
        message.success(`Đã xóa ${selectedRowKeys.length} bản ghi!`);
        setSelectedRowKeys([]);
        fetchCategories();
      } else
      {
        message.error('Có lỗi xảy ra khi xóa bản ghi!');
      }
    } catch (error)
    {
      message.error('Có lỗi xảy ra khi xóa bản ghi!');
    } finally
    {
      setBulkDeleteLoading(false);
      setOpenBulkDelete(false);
    }
  };


  return (
    <div style={{ padding: '24px' }}>
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
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: themeColors.StartColorLinear }}>
            {t('Category')}
          </div>
          <Breadcrumb
            items={[
              { title: t('Home') },
              { title: t('Category') }
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
              placeholder="Tìm kiếm tên danh mục..."
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
        <div className="admin-table-wrapper" style={{ padding: '0 24px 24px 24px' }}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredCategories}
            rowKey="id"
            pagination={false}
            loading={loading}
            size="middle"
            scroll={{ x: 900 }}
            className="custom-table"
          />
          <div className="flex justify-end mt-4">
            <Pagination
              current={page}
              pageSize={itemsPerPage}
              total={filteredCategories.length}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
      {/* Modal Create */}
      <CreateModal
        openCreate={openCreate}
        handleCreateClose={() => setOpenCreate(false)}
        categoryCreate={categoryCreate}
        setCategoryData={setCategoryData}
        setCategoryCreate={setCategoryCreate}
      />
      {/* Modal Update */}
      <UpdateModal
        openUpdate={openUpdate}
        handleUpdateClose={() => setOpenUpdate(false)}
        setCategoryData={setCategoryData}
        updateData={updateData}
        updateId={updateId}
      />
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
    </div>
  );
};

export default Category;