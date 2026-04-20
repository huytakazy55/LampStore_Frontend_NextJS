"use client";

import React, { useContext, useState, useEffect } from 'react';
import { Modal, Upload, Button, Space, Typography, message, Table, Tabs } from 'antd';
import { InboxOutlined, FileExcelOutlined, CloseOutlined, SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import { ThemeContext } from '@/contexts/ThemeContext';
import * as XLSX from 'xlsx';
import ProductManage from '@/services/ProductManage';
import { toast } from 'react-toastify';
import CategoryManage from '@/services/CategoryManage';
import TagManage from '@/services/TagManage';
const { Title } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;

const ImportModal = ({ openImport, handleImportClose, fetchProducts }) => {
    const { themeColors } = useContext(ThemeContext);
    const [fileList, setFileList] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchTags();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await CategoryManage.GetCategory();
            setCategories(response.data.$values);
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
        }
    };

    const fetchTags = async () => {
        try {
            const response = await TagManage.GetTag();
            setTags(response.data.$values);
        } catch (error) {
            toast.error('Không thể tải danh sách tags');
        }
    };

    const categoryColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 350,
            align: 'center',
            render: (text) => (
                <span style={{ cursor: 'pointer' }} onClick={() => {
                    navigator.clipboard.writeText(text);
                    toast.success('Đã copy ID danh mục!');
                }}>
                    {text}
                </span>
            )
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            align: 'center'
        }
    ];

    const tagColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 350,
            align: 'center',
            render: (text) => (
                <span style={{ cursor: 'pointer' }} onClick={() => {
                    navigator.clipboard.writeText(text);
                    toast.success('Đã copy ID tag!');
                }}>
                    {text}
                </span>
            )
        },
        {
            title: 'Tên tag',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (text) => (
                <span style={{ cursor: 'pointer' }} onClick={() => {
                    navigator.clipboard.writeText(text);
                    toast.success('Đã copy tên tag!');
                }}>
                    {text}
                </span>
            )
        }
    ];

    const handleDownloadTemplate = () => {
        // Tạo workbook mới
        const wb = XLSX.utils.book_new();
        
        // Dữ liệu mẫu
        const data = [
            {
                name: "Đèn LED Philips",
                description: "Đèn LED Philips tiết kiệm điện",
                price: 1500000,
                discountPrice: 1200000,
                stock: 50,
                materials: "Nhựa, Kim loại",
                weight: 1.5,
                sku: "LED-PH-001",
                categoryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                status: true,
                tags: "LED,Philips,Trang trí",
                variantTypeNames: "Màu sắc,Kích thước,Chất liệu",
                variantTypeValues: "Đỏ,Xanh,Trắng|Nhỏ,Vừa,Lớn|Nhựa,Kim loại,Thủy tinh"
            }
        ];

        // Tạo worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, "Products");

        // Tải file
        XLSX.writeFile(wb, "product_import_template.xlsx");
    };

    const handleFileUpload = (info) => {
        const { file } = info;
        
        // Xử lý trường hợp xóa file
        if (file.status === 'removed') {
            setFileList([]);
            setPreviewData([]);
            return;
        }

        setFileList([file]);
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
    
                const validatedData = jsonData.map((row, index) => {
                    const errors = [];
                    if (!row.name) errors.push('Tên sản phẩm không được để trống');
                    if (!row.price || isNaN(row.price)) errors.push('Giá bán không hợp lệ');
                    if (!row.stock || isNaN(row.stock)) errors.push('Số lượng không hợp lệ');
                    if (!row.categoryId) errors.push('Danh mục không được để trống');
                    if (!row.variantTypeNames || !row.variantTypeValues) errors.push('Phân loại sản phẩm không hợp lệ');
    
                    return {
                        ...row,
                        key: index,
                        errors: errors.length > 0 ? errors : null
                    };
                });
    
                setPreviewData(validatedData);
    
                if (validatedData.length === 0) {
                    toast.error('Không tìm thấy dữ liệu trong file Excel');
                } else if (validatedData.some(item => item.errors)) {
                    toast.warning('Có một số dòng dữ liệu bị lỗi, vui lòng kiểm tra lại');
                } else {
                    toast.success('Đọc file Excel thành công');
                }
            } catch (error) {
                console.error('Error reading Excel file:', error);
                toast.error('Có lỗi xảy ra khi đọc file Excel');
            }
        };
    
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (previewData.some(item => item.errors)) {
            toast.error('Vui lòng sửa các lỗi trước khi import');
            return;
        }

        setLoading(true);
        try {
            const products = previewData.map(item => {
                // Xử lý variant types
                const variantTypeNames = item.variantTypeNames ? item.variantTypeNames.split(',') : [];
                const variantTypeValues = item.variantTypeValues ? item.variantTypeValues.split('|') : [];
                
                const variantTypes = variantTypeNames.map((name, index) => ({
                    name: name.trim(),
                    values: variantTypeValues[index] ? variantTypeValues[index].split(',').map(v => v.trim()) : []
                }));

                // Xử lý tags
                const tags = item.tags ? item.tags.split(',').map(tag => tag.trim()).join(',') : '';


                // Xử lý các trường số
                const price = parseFloat(item.price) || 0;
                const discountPrice = parseFloat(item.discountPrice) || 0;
                const stock = parseInt(item.stock) || 0;
                const weight = parseFloat(item.weight) || 0;

                // Tạo product variant với đầy đủ thông tin
                const productVariant = {
                    price: price,
                    discountPrice: discountPrice,
                    stock: stock,
                    weight: weight,
                    materials: item.materials || '',
                    sku: item.sku || ''
                };

                // Tạo sản phẩm với đầy đủ thông tin
                const productDto = {
                    name: item.name,
                    description: item.description || '',
                    reviewCount: 0,
                    tags: tags,
                    viewCount: 0,
                    favorites: 0,
                    sellCount: 0,
                    categoryId: item.categoryId,
                    dateAdded: new Date().toISOString(),
                    status: item.status === true ? 1 : 0,
                    productVariants: [productVariant],
                    variantTypes: variantTypes
                };

                return productDto;
            });

            const response = await ProductManage.ImportProducts(products);
            toast.success('Import sản phẩm thành công');
            handleImportClose();
            fetchProducts();
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Có lỗi xảy ra khi import sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Số lượng',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryId',
            key: 'categoryId',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => status === true ? 'Hoạt động' : 'Không hoạt động'
        },
        {
            title: 'Loại biến thể',
            dataIndex: 'variantTypeName',
            key: 'variantTypeName',
        },
        {
            title: 'Lỗi',
            dataIndex: 'errors',
            key: 'errors',
            render: (errors) => errors ? (
                <ul style={{ color: 'red', margin: 0, padding: 0 }}>
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            ) : null
        }
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <FileExcelOutlined style={{ color: themeColors.StartColorLinear, fontSize: '20px' }} />
                    <Title level={4} style={{ margin: 0, color: themeColors.StartColorLinear }}>
                        Import sản phẩm từ Excel
                    </Title>
                </div>
            }
            open={openImport}
            onCancel={handleImportClose}
            width={1100}
            footer={[
                <Button
                    key="cancel"
                    onClick={handleImportClose}
                    icon={<CloseOutlined />}
                    danger
                >
                    Đóng
                </Button>,
                <Button
                    key="import"
                    type="primary"
                    onClick={handleImport}
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ background: themeColors.StartColorLinear }}
                    disabled={previewData.length === 0 || previewData.some(item => item.errors)}
                >
                    Import
                </Button>
            ]}
            className="custom-modal"
        >
            <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadTemplate}
                        style={{ background: themeColors.StartColorLinear }}
                    >
                        Tải mẫu Excel
                    </Button>
                </div>
                <Dragger
                    accept=".xlsx,.xls"
                    fileList={fileList}
                    onChange={handleFileUpload}
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click hoặc kéo thả file Excel vào đây</p>
                    <p className="ant-upload-hint">
                        Chỉ chấp nhận file Excel (.xlsx, .xls)
                    </p>
                </Dragger>
            </div>

            <div className="mt-4 mb-4">
                <Title level={5} style={{ color: themeColors.StartColorLinear, marginBottom: '16px' }}>
                    <i className='bx bx-info-circle' style={{ marginRight: '8px' }}></i>
                    Thông tin tham khảo
                </Title>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Danh mục" key="1">
                        <Table
                            columns={categoryColumns}
                            dataSource={categories}
                            scroll={{ x: true }}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            rowKey="id"
                        />
                    </TabPane>
                    <TabPane tab="Tags" key="2">
                        <Table
                            columns={tagColumns}
                            dataSource={tags}
                            scroll={{ x: true }}
                            pagination={{ pageSize: 5 }}
                            size="small"
                            rowKey="id"
                        />
                    </TabPane>
                </Tabs>
            </div>

            {previewData.length > 0 && (
                <div className="mt-4">
                    <Title level={5}>Xem trước dữ liệu</Title>
                    <Table
                        columns={columns}
                        dataSource={previewData}
                        scroll={{ x: true }}
                        pagination={false}
                        size="small"
                    />
                </div>
            )}

            <div className="mt-4">
                <Title level={5} style={{ color: themeColors.StartColorLinear, marginBottom: '16px' }}>
                    <i className='bx bx-info-circle' style={{ marginRight: '8px' }}></i>
                    Hướng dẫn import sản phẩm
                </Title>
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {/* Cột 1: Các trường bắt buộc */}
                        <div style={{ flex: 1 }}>
                            <Typography.Text strong style={{ color: '#1f1f1f', display: 'block', marginBottom: '12px' }}>
                                <i className='bx bx-check-circle' style={{ color: '#52c41a', marginRight: '8px' }}></i>
                                Các trường bắt buộc:
                            </Typography.Text>
                            <ul style={{ 
                                listStyle: 'none', 
                                padding: 0,
                                margin: 0
                            }}>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-check-circle' style={{ color: '#52c41a', marginRight: '8px' }}></i>
                                    <span><strong>name:</strong> Tên sản phẩm</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-check-circle' style={{ color: '#52c41a', marginRight: '8px' }}></i>
                                    <span><strong>price:</strong> Giá bán (số)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-check-circle' style={{ color: '#52c41a', marginRight: '8px' }}></i>
                                    <span><strong>stock:</strong> Số lượng (số nguyên)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-check-circle' style={{ color: '#52c41a', marginRight: '8px' }}></i>
                                    <span><strong>categoryId:</strong> ID danh mục (GUID)</span>
                                </li>
                            </ul>
                        </div>

                        {/* Cột 2: Các trường tùy chọn */}
                        <div style={{ flex: 1 }}>
                            <Typography.Text strong style={{ color: '#1f1f1f', display: 'block', marginBottom: '12px' }}>
                                <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                Các trường tùy chọn:
                            </Typography.Text>
                            <ul style={{ 
                                listStyle: 'none', 
                                padding: 0,
                                margin: 0
                            }}>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>description:</strong> Mô tả sản phẩm</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>discountPrice:</strong> Giá khuyến mãi (số)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>materials:</strong> Chất liệu (text)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>weight:</strong> Cân nặng (số thập phân)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>sku:</strong> Mã SKU (text)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>status:</strong> Trạng thái (true/false)</span>
                                </li>
                                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                    <i className='bx bx-info-circle' style={{ color: '#1890ff', marginRight: '8px' }}></i>
                                    <span><strong>tags:</strong> Tags (phân cách bằng dấu phẩy)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ 
                        marginTop: '16px', 
                        padding: '12px', 
                        background: '#fff3cd', 
                        border: '1px solid #ffeeba',
                        borderRadius: '4px'
                    }}>
                        <Typography.Text style={{ color: '#856404' }}>
                            <i className='bx bx-error-circle' style={{ marginRight: '8px' }}></i>
                            Lưu ý: Đảm bảo file Excel của bạn có đúng định dạng và các trường bắt buộc được điền đầy đủ.
                        </Typography.Text>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ImportModal; 