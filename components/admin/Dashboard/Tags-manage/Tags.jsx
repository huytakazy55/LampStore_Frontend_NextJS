"use client";

import React, {useContext, useState, useEffect, useMemo} from 'react'
import { Breadcrumb, Input, Button, Table, Pagination, Space, Typography, Card, Row, Col, Select, DatePicker, Tag } from 'antd';
import { Link as RouterLink } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import {ThemeContext} from '@/contexts/ThemeContext';
import { toast } from 'react-toastify';
import TagManage from '@/services/TagManage';
import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';
import { DeleteOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import axios from 'axios';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 10,
  border: 'none',
  outline: 'none',
};

const Tags = () => {
  const {themeColors} = useContext(ThemeContext);
  const {t} = useTranslation();
  //modal create
  const [openCreate, setOpenCreate] = React.useState(false);
  const handleCreateOpen = () => setOpenCreate(true);
  const handleCreateClose = () => setOpenCreate(false);
  //modal update
  const [updateId, setUpdateId] = useState(0);
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [updateData, setUpdateData] = useState({
    id: '',
    name: "",
    description: "",
  });
  const handleUpdateOpen = () => setOpenUpdate(true);
  const handleUpdateClose = () => setOpenUpdate(false);
  //Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  //Data
  const [tagData, setTagData] = useState([]);
  const [tagCreate, setTagCreate] = useState({
    name: "",
    description: "",
  });
  //Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);

  useEffect( () => {
    TagManage.GetTag()
    .then((res) => {
      setTagData(res.data.$values);
    })
    .catch((err) => {
      console.log(err);
    })
  },[])

  //Search Service
  const highlightedText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span>
      ) : part
    );
  };

  const filteredTags = useMemo(() => {
    return tagData.filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tag.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateRange || (
        new Date(tag.createdAt) >= dateRange[0].startOf('day').toDate() &&
        new Date(tag.createdAt) <= dateRange[1].endOf('day').toDate()
      );
      
      return matchesSearch && matchesDate;
    });
  }, [tagData, searchTerm, dateRange]);

  const truncateWords = (text, maxWords) => {
    if (!text) {
      return '';
    }
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + ' . . .';
    }
    return text;
  };

  const handleChangePage = (page) => {
    setPage(page);
  };

  //Pagination
  const currentItems = useMemo(() => {
    return filteredTags.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredTags, page, itemsPerPage]);

  const DeleteTag = (id, name) => {
    TagManage.DeleteTag(id, name)
      .then((res) => {
        setTagData(prevData => prevData.filter(tag => tag.id !== id));
        toast.success(`Đã xóa bản ghi có id = ${id}: ${name}`);
      })
      .catch((err) => {
        toast.error("Có lỗi xảy ra");
      });
  };

  const handleUpdateClick = (id) => {
    const tag = tagData.find((item) => item.id === id);
    setSelectedTag(tag);
    handleUpdateOpen();
    setUpdateId(id);
  }

  const fetchTags = () => {
    TagManage.GetTag()
      .then((res) => {
        setTagData(res.data.$values);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: '5%',
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Tên tag',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => highlightedText(text, searchTerm)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      align: 'center',
      render: (text) => truncateWords(text, 10)
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      key: 'productCount',
      width: '10%',
      align: 'center',
      sorter: (a, b) => a.productCount - b.productCount,
      render: (count) => (
        <Tag color="blue">
          {count}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
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
      width: '12%',
      align: 'center',
      sorter: (a, b) => {
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
      title: 'Thao tác',
      key: 'action',
      width: '20%',
      align: 'center',
      render: (_, record) => (
        <Space size="middle" style={{justifyContent: 'center', width: '100%'}}>
          <Button 
            type="text" 
            icon={<i className='bx bx-edit'></i>} 
            onClick={() => handleUpdateClick(record.id)}
            style={{color: themeColors.EndColorLinear}}
          />
          <Button 
            type="text" 
            danger 
            icon={<i className='bx bx-trash'></i>} 
            onClick={() => DeleteTag(record.id, record.name)}
          />
        </Space>
      )
    }
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 20,
    columnTitle: '',
  };

  const handleBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true);
      const response = await TagManage.BulkDeleteTags(selectedRowKeys);
      
      if (response.data.success || response.status === 200 || response.status === 204) {
        toast.success(`Đã xóa ${selectedRowKeys.length} bản ghi!`);
        setSelectedRowKeys([]);
        fetchTags();
      } else {
        toast.error('Có lỗi xảy ra khi xóa bản ghi!');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa bản ghi!');
    } finally {
      setBulkDeleteLoading(false);
      setOpenBulkDelete(false);
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
            {t('Tags')}
          </div>
          <Breadcrumb
            items={[
              { title: t('Home') },
              { title: t('Tags') }
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
            <Input
              prefix={<i className='bx bx-search-alt-2'></i>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tag..."
              style={{width: '240px'}}
            />
            <Button
              type="default"
              icon={<i className='bx bx-filter'></i>}
              onClick={() => setOpenFilter(true)}
            >
              {t('Filter')} {filterCount > 0 && `(${filterCount})`}
            </Button>
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
          <Button
            type="primary"
            onClick={handleCreateOpen}
            icon={<i className='bx bx-plus'></i>}
          >
            {t('Create')}
          </Button>
        </div>
        {/* Filter options */}
        <Row gutter={[16, 16]} style={{margin: '16px 0', padding: '0 16px'}}>
          <Col span={12}>
            <DatePicker.RangePicker
              style={{width: '100%'}}
              onChange={setDateRange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
        </Row>
        {/* Table */}
        <div className="admin-table-wrapper" style={{padding: '0 24px 24px 24px'}}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={currentItems}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: itemsPerPage,
              total: filteredTags.length,
              onChange: handleChangePage,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} tag`
            }}
            style={{
              background: 'white',
              borderRadius: '5px',
              overflow: 'hidden'
            }}
            size="middle"
            scroll={{ x: 800 }}
            className="custom-table"
          />
        </div>
      </div>

      <CreateModal 
        openCreate={openCreate} 
        handleCreateClose={handleCreateClose} 
        fetchTags={fetchTags}
        style={style}
      />

      <UpdateModal 
        openUpdate={openUpdate} 
        handleUpdateClose={handleUpdateClose} 
        fetchTags={fetchTags}
        style={style}
        tag={selectedTag}
      />

      {/* Filter Modal */}
      <Modal
        title={t('Filter')}
        open={openFilter}
        onCancel={() => setOpenFilter(false)}
        onOk={() => {
          setOpenFilter(false);
          // Handle filter application
        }}
        confirmLoading={confirmLoading}
      >
        {/* Filter content */}
      </Modal>

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
}

export default Tags
