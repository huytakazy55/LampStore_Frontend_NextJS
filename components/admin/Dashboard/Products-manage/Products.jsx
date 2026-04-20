"use client";

import React, {useContext, useState, useEffect, useMemo} from 'react'
import { Breadcrumb, Input, Button, Table, Pagination, Space, Typography, Card, Row, Col, Select, DatePicker, Tag } from 'antd';
import { Link as RouterLink } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import {ThemeContext} from '@/contexts/ThemeContext';
import { toast } from 'react-toastify';
import ProductManage from '@/services/ProductManage';
import CategoryManage from '@/services/CategoryManage';
import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';
import ImportModal from './ImportModal';
import UploadModal from './UploadModal';
import { DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import axios from 'axios';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1300,
  bgcolor: 'background.paper',
  boxShadow: 10,
  border: 'none',
  outline: 'none',
};

const Products = () => {
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
    reviewCount: 0,
    tags: "",
    viewCount: 0,
    favorites: 0,
    sellCount: 0,
    categoryId: null,
    status: 1
  });
  const handleUpdateOpen = () => setOpenUpdate(true);
  const handleUpdateClose = () => setOpenUpdate(false);
  //Modal Upload
  const handleUploadOpen = () => setOpenUpload(true);
  const handleUploadClose = () => setOpenUpload(false);
  const [openUpload, setOpenUpload] = React.useState(false);
  //Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  //Data
  const [productData, setProductData] = useState([]);
  const [productCreate, setProductCreate] = useState({
    name: "",
    description: "",
    reviewCount: 0,
    tags: "",
    viewCount: 0,
    favorites: 0,
    sellCount: 0,
    categoryId: "",
    status: 1,
  });
  //Category
  const [categories, setCategories] = useState([]);
  //Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [priceRange, setPriceRange] = useState([null, null]);
  const [stockRange, setStockRange] = useState([null, null]);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [openBulkDelete, setOpenBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [openImport, setOpenImport] = useState(false);
  const handleImportOpen = () => setOpenImport(true);
  const handleImportClose = () => setOpenImport(false);

  useEffect( () => {
    ProductManage.GetProduct()
    .then((res) => {
      setProductData(res.data.$values);
    })
    .catch((err) => {
      console.log(err);
    })
  },[])

  const GetCategoryById = (id) => {
    const category = categories.find(category => category.id === id);
    return category ? category.name : ''
  }

  useEffect(() => {
    CategoryManage.GetCategory()
      .then((res) => {
        setCategories(res.data.$values);
      })
      .catch((err) => {
        toast.error("Có lỗi xảy ra khi tải danh mục.");
      });
  }, []);

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

  const filteredProducts = useMemo(() => {
    return productData.filter(product => {
      const categoryName = GetCategoryById(product.categoryId || '').toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          categoryName.includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
      const matchesStatus = statusFilter === null || statusFilter === undefined || Boolean(product.status) === Boolean(statusFilter);
      const matchesDate = !dateRange || (
        new Date(product.dateAdded) >= dateRange[0].startOf('day').toDate() &&
        new Date(product.dateAdded) <= dateRange[1].endOf('day').toDate()
      );
      
      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [productData, searchTerm, selectedCategory, dateRange, statusFilter]);

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

  // Định dạng số theo ngôn ngữ hiện tại
  const { i18n } = useTranslation();
  const language = i18n.language;
  const formattedNumber = (number, language) => {
    return new Intl.NumberFormat(language).format(number);
  };

  const handleChangePage = (page) => {
    setPage(page);
  };

  //Pagination
  const currentItems = useMemo(() => {
    return filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  const DeleteProduct = (id, name) => {
    ProductManage.DeleteProduct(id, name)
      .then((res) => {
        setProductData(prevData => prevData.filter(product => product.id !== id));
        toast.success(`Đã xóa bản ghi: ${name}`);
      })
      .catch((err) => {
        toast.error("Có lỗi xảy ra");
      });
  };

  const handleUpdateClick = (id) => {
    const product = productData.find((item) => item.id === id);
    setSelectedProduct(product);
    handleUpdateOpen();
    setUpdateId(id);
  }

  const handleUploadClick = (id) => {
    handleUploadOpen();
    setUpdateId(id);
  }

  const fetchProducts = () => {
    ProductManage.GetProduct()
      .then((res) => {
        setProductData(res.data.$values);
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
      width: '4%',
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: '6%',
      align: 'center',
      render: (images) => {
        if (images && images.$values.length > 0) {
          const imagePath = images.$values[0].imagePath
          const imageUrl = imagePath.startsWith('http') ? imagePath : `${API_ENDPOINT}${imagePath}`
          return (
            <img 
              src={imageUrl} 
              alt="Product" 
              style={{
                width: '100%', 
                height: '64px', 
                objectFit: 'cover',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} 
            />
          )
        }
        return 'No Image'
      }
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => highlightedText(text, searchTerm)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      align: 'center',
      render: (text) => truncateWords(text, 10)
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: '7%',
      align: 'center',
      sorter: (a, b) => a.minPrice - b.minPrice,
      render: (_, record) => (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <Typography.Text strong style={{color: themeColors.EndColorLinear, whiteSpace: 'nowrap'}}>
            {formattedNumber(record.minPrice, language)}
            {record.minPrice !== record.maxPrice && (
              <> - {formattedNumber(record.maxPrice, language)}</>
            )}
          </Typography.Text>
          {record.minPrice !== record.maxPrice && (
            <Tag color="blue" style={{marginTop: 2, whiteSpace: 'normal'}}>Nhiều mức giá</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
      width: '7%',
      align: 'center',
      sorter: (a, b) => a.stock - b.stock,
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: '10%',
      align: 'center',
      sorter: (a, b) => GetCategoryById(a.categoryId).localeCompare(GetCategoryById(b.categoryId)),
      render: (categoryId) => (
        <Tag color="blue">
          {highlightedText(GetCategoryById(categoryId), searchTerm)}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
                  dataIndex: 'dateAdded', 
            key: 'dateAdded',
      width: '7%',
      align: 'center',
      sorter: (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded),
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
      width: '7%',
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '8%',
      align: 'center',
      filters: [
        { text: 'Hoạt động', value: 1 },
        { text: 'Ẩn', value: 0 }
      ],
      onFilter: (value, record) => {
        if (value === null) return true;
        return Boolean(record.status) === Boolean(value);
      },
      render: (status) => {
        const statusConfig = {
          1: { text: 'Hoạt động', color: 'success' },
          0: { text: 'Ẩn', color: 'error' },
          true: { text: 'Hoạt động', color: 'success' },
          false: { text: 'Ẩn', color: 'error' }
        };
        
        const config = statusConfig[status] || { text: 'Không xác định', color: 'default' };
        
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '8%',
      align: 'center',
      render: (_, record) => (
        <Space size="middle" style={{justifyContent: 'center', width: '100%'}}>
          <Button 
            type="text" 
            icon={<i className='bx bx-image-add'></i>} 
            onClick={() => handleUploadClick(record.id)}
            style={{color: themeColors.EndColorLinear}}
          />
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
            onClick={() => DeleteProduct(record.id, record.name)}
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
      if (!selectedRowKeys || selectedRowKeys.length === 0) {
        toast.error('Vui lòng chọn bản ghi để xóa!');
        return;
      }
      const response = await ProductManage.BulkDeleteProducts(selectedRowKeys);
      if (response.status === 200 || response.status === 204) {
        toast.success(`Đã xóa ${selectedRowKeys.length} bản ghi!`);
        setSelectedRowKeys([]);
        fetchProducts();
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
            {t('Product')}
          </div>
          <Breadcrumb
            items={[
              { title: t('Home') },
              { title: t('Product') }
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
              placeholder="Tìm kiếm sản phẩm..."
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
          <div className="flex gap-2">
            <Button
              type="primary"
              onClick={handleCreateOpen}
              icon={<i className='bx bx-plus'></i>}
              style={{background: themeColors.StartColorLinear}}
            >
              Thêm mới
            </Button>
            <Button
              type="primary"
              onClick={handleImportOpen}
              icon={<FileExcelOutlined />}
              style={{background: themeColors.StartColorLinear}}
            >
              Import Excel
            </Button>
          </div>
        </div>
        {/* Filter options */}
        <Row gutter={[16, 16]} style={{margin: '16px 0', padding: '0 16px'}}>
          <Col span={6}>
            <Select
              style={{width: '100%'}}
              placeholder="Lọc theo danh mục"
              allowClear
              onChange={setSelectedCategory}
            >
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <DatePicker.RangePicker
              style={{width: '100%'}}
              onChange={setDateRange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{width: '100%'}}
              placeholder="Lọc theo trạng thái"
              allowClear
              onChange={setStatusFilter}
            >
              <Select.Option value={1}>Hoạt động</Select.Option>
              <Select.Option value={0}>Ẩn</Select.Option>
            </Select>
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
              total: filteredProducts.length,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} sản phẩm`,
              onChange: (page, pageSize) => {
                setPage(page);
                setItemsPerPage(pageSize);
              }
            }}
            style={{
              background: 'white',
              borderRadius: '5px',
              overflow: 'hidden'
            }}
            size="middle"
            scroll={{ x: 1300 }}
            className="custom-table"
          />
        </div>
      </div>

      <CreateModal 
        openCreate={openCreate} 
        handleCreateClose={handleCreateClose} 
        fetchProducts={fetchProducts}
        style={style}
        categories={categories}
      />

      <UpdateModal 
        openUpdate={openUpdate} 
        handleUpdateClose={handleUpdateClose} 
        fetchProducts={fetchProducts}
        style={style}
        categories={categories}
        product={selectedProduct}
      />

      <ImportModal
        openImport={openImport}
        handleImportClose={handleImportClose}
        fetchProducts={fetchProducts}
      />

      <UploadModal 
        openUpload={openUpload} 
        handleUploadClose={handleUploadClose} 
        fetchProducts={fetchProducts}
        setProductData={setProductData}
        style={style}
        updateId={updateId}
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

export default Products


