"use client";

import React, { useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import AdminPageHeader from '../shared/AdminPageHeader';
import { Input, Button, Table, Space, Select, DatePicker, Tag, Tooltip } from 'antd';
import { Link as RouterLink } from '@/lib/router-compat';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import { toast } from 'react-toastify';
import ProductManage from '@/services/ProductManage';
import CategoryManage from '@/services/CategoryManage';
import CreateModal from './CreateModal';
import UpdateModal from './UpdateModal';
import ImportModal from './ImportModal';
import UploadModal from './UploadModal';
import DetailModal from './DetailModal';
import { DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import axios from 'axios';
import ColumnVisibilityDropdown from '../shared/ColumnVisibilityDropdown';

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
  const { themeColors } = useContext(ThemeContext);
  const { t } = useTranslation();
  //modal create
  const [openCreate, setOpenCreate] = React.useState(false);
  const [copySourceProduct, setCopySourceProduct] = useState(null);
  const [copyLoadingId, setCopyLoadingId] = useState(null);
  const handleCreateOpen = () => {
    setCopySourceProduct(null);
    setOpenCreate(true);
  };
  const handleCreateClose = () => {
    setOpenCreate(false);
    setCopySourceProduct(null);
  };
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
  //Modal Detail
  const [openDetail, setOpenDetail] = React.useState(false);
  const handleDetailOpen = () => setOpenDetail(true);
  const handleDetailClose = () => setOpenDetail(false);
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
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  //Debounced search — the raw input updates immediately for a responsive UI, but the
  //actual server fetch only fires ~350ms after the user stops typing.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 whenever the search term settles on a new value — done here
      // (inside the debounce timeout, not a separate effect) so it's an event-driven
      // state update rather than a synchronous setState inside an effect body.
      setPage(1);
    }, 350);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchTerm]);

  // Server-driven paginated + filtered product fetch. Uses the AdvancedSearch endpoint
  // (see ProductManage.SearchProducts) which supports keyword/categoryId/status
  // server-side. `dateRange` has no equivalent search-criteria field on the backend
  // yet, so it's applied as an additional client-side filter over just the current
  // page below (see `visibleProducts`) — a known, documented limitation.
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const statusValue = statusFilter === null || statusFilter === undefined ? undefined : Boolean(statusFilter);
    ProductManage.SearchProducts({
      page,
      pageSize: itemsPerPage,
      keyword: debouncedSearchTerm || undefined,
      categoryId: selectedCategory || undefined,
      status: statusValue,
    })
      .then(({ items, total }) => {
        setProductData(items);
        setTotal(total);
      })
      .catch(() => {
        toast.error('Có lỗi xảy ra khi tải danh sách sản phẩm.');
      })
      .finally(() => setLoading(false));
  }, [page, itemsPerPage, debouncedSearchTerm, selectedCategory, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  // productData is already the current server-paginated + filtered (keyword/category/
  // status) page. `dateRange` has no equivalent on the backend's AdvancedSearch
  // criteria yet, so it's applied here as an extra client-side filter over just the
  // current page — meaning it can only narrow down what's already loaded, not search
  // the full dataset. TODO: promote this to a server-side filter once the backend
  // AdvancedSearch endpoint supports a date-range criterion.
  const visibleProducts = useMemo(() => {
    if (!dateRange) return productData;
    return productData.filter(product => (
      new Date(product.dateAdded) >= dateRange[0].startOf('day').toDate() &&
      new Date(product.dateAdded) <= dateRange[1].endOf('day').toDate()
    ));
  }, [productData, dateRange]);

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const truncateWords = (text, maxWords) => {
    if (!text) {
      return '';
    }
    const plainText = stripHtml(text);
    const words = plainText.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + ' ...';
    }
    return plainText;
  };

  // Định dạng số theo ngôn ngữ hiện tại
  const { i18n } = useTranslation();
  const language = i18n.language;
  const formattedNumber = (number, language) => {
    return new Intl.NumberFormat(language).format(number);
  };

  const DeleteProduct = (id, name) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: (
        <span>
          Bạn có chắc chắn muốn xóa sản phẩm <strong>{name}</strong>? Hành động này không thể hoàn tác.
        </span>
      ),
      okText: 'Xóa sản phẩm',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          await ProductManage.DeleteProduct(id);
          toast.success(`Đã xóa sản phẩm: ${name}`);
          fetchProducts();
        } catch (error) {
          const errorMessage = error?.response?.data?.message || 'Không thể xóa sản phẩm.';
          toast.error(errorMessage);
          throw error;
        }
      },
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

  const handleDetailClick = (id) => {
    const product = productData.find((item) => item.id === id);
    setSelectedProduct(product);
    handleDetailOpen();
  }

  const handleCopyClick = async (id) => {
    try {
      setCopyLoadingId(id);
      const response = await ProductManage.GetProductById(id);
      setCopySourceProduct(response.data);
      setOpenCreate(true);
    } catch (error) {
      console.error('Copy product error:', error);
      toast.error('Không thể tải dữ liệu sản phẩm để sao chép.');
    } finally {
      setCopyLoadingId(null);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: '3%',
      align: 'center',
      render: (_, __, index) => (page - 1) * itemsPerPage + index + 1
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: '5%',
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
      width: '12%',
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => highlightedText(text, searchTerm)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '13%',
      align: 'left',
      ellipsis: true,
      render: (text) => (
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {truncateWords(text, 10)}
        </span>
      )
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: '11%',
      align: 'center',
      sorter: (a, b) => a.minPrice - b.minPrice,
      render: (_, record) => (
        <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600, color: themeColors.EndColorLinear, fontSize: 13 }}>
            {formattedNumber(record.minPrice, language)}
          </div>
          {record.minPrice !== record.maxPrice && (
            <div style={{ fontSize: 12, color: '#888' }}>
              ~ {formattedNumber(record.maxPrice, language)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
      width: '5%',
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
      width: '8%',
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
      width: '7%',
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
      width: '13%',
      align: 'center',
      render: (_, record) => (
        <Space size={6} className="admin-action-group">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              className="admin-action-btn"
              icon={<i className='bx bx-show'></i>}
              onClick={() => handleDetailClick(record.id)}
              style={{ color: themeColors.EndColorLinear }}
            />
          </Tooltip>
          <Tooltip title="Quản lý hình ảnh sản phẩm">
            <Button
              type="text"
              className="admin-action-btn"
              icon={<i className='bx bx-image-add'></i>}
              onClick={() => handleUploadClick(record.id)}
              style={{ color: themeColors.EndColorLinear }}
            />
          </Tooltip>
          <Tooltip title="Sửa sản phẩm">
            <Button
              type="text"
              className="admin-action-btn"
              icon={<i className='bx bx-edit'></i>}
              onClick={() => handleUpdateClick(record.id)}
              style={{ color: themeColors.EndColorLinear }}
            />
          </Tooltip>
          <Tooltip title="Sao chép thành sản phẩm mới">
            <Button
              type="text"
              className="admin-action-btn admin-copy-action-btn"
              icon={<i className='bx bx-copy'></i>}
              onClick={() => handleCopyClick(record.id)}
              loading={copyLoadingId === record.id}
              style={{ color: themeColors.EndColorLinear }}
            />
          </Tooltip>
          <Tooltip title="Xóa sản phẩm">
            <Button
              type="text"
              className="admin-action-btn"
              danger
              icon={<i className='bx bx-trash'></i>}
              onClick={() => DeleteProduct(record.id, record.name)}
            />
          </Tooltip>
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
    columnWidth: '3%',
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
    <div style={{ padding: '16px' }}>
      <AdminPageHeader
        title={t('Product')}
        breadcrumbItems={[
          { title: t('Home') },
          { title: t('Product') }
        ]}
        actions={(
          <>
            <ColumnVisibilityDropdown
              columns={columns}
              hiddenKeys={hiddenColumns}
              onChange={setHiddenColumns}
            />
            <Button
              type="primary"
              className="admin-theme-primary-btn"
              onClick={handleCreateOpen}
              icon={<i className='bx bx-plus'></i>}
            >
              Thêm mới
            </Button>
            <Button
              type="primary"
              className="admin-theme-primary-btn"
              onClick={handleImportOpen}
              icon={<FileExcelOutlined />}
            >
              Import Excel
            </Button>
          </>
        )}
      />
      <div className="admin-table-card">
        {/* Filter options */}
        <div className="admin-product-filter-row">
          <Input
            prefix={<i className='bx bx-search-alt-2'></i>}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
          />
          <Button
            type="default"
            icon={<i className='bx bx-filter'></i>}
            onClick={() => setOpenFilter(true)}
          >
            {t('Filter')} {filterCount > 0 && `(${filterCount})`}
          </Button>
          <Select
            placeholder="Lọc theo danh mục"
            allowClear
            onChange={(value) => { setSelectedCategory(value); setPage(1); }}
          >
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
          <DatePicker.RangePicker
            onChange={setDateRange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            onChange={(value) => { setStatusFilter(value); setPage(1); }}
          >
            <Select.Option value={1}>Hoạt động</Select.Option>
            <Select.Option value={0}>Ẩn</Select.Option>
          </Select>
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
        </div>
        {/* Table */}
        <div className="admin-table-wrapper" style={{ padding: '24px' }}>
          <Table
            rowSelection={rowSelection}
            columns={columns.filter(col => !hiddenColumns.includes(col.key))}
            dataSource={visibleProducts}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: itemsPerPage,
              total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} sản phẩm`,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setItemsPerPage(newPageSize);
              }
            }}
            style={{
              background: 'white',
              borderRadius: '5px',
              overflow: 'hidden'
            }}
            size="middle"
            tableLayout="fixed"
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
        initialProduct={copySourceProduct}
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

      <DetailModal
        open={openDetail}
        onClose={handleDetailClose}
        product={selectedProduct}
        categories={categories}
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
