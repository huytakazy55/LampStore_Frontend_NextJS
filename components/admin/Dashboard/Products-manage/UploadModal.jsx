"use client";

import React, { useContext, useState, useEffect } from 'react'
import { Modal, Upload, Button, Space, Typography, Card, Row, Col, message, Progress } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import ProductManage from '@/services/ProductManage';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const { Dragger } = Upload;
const { Text, Title } = Typography;

const UploadModal = ({ openUpload, handleUploadClose, setProductData, style, updateId, fetchProducts }) =>
{
    const { themeColors } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [productImages, setProductImages] = useState([]);

    const fetchProductImages = () =>
    {
        if (updateId)
        {
            ProductManage.GetProductImageById(updateId)
                .then((res) =>
                {
                    setProductImages(res.data?.$values || res.data || []);
                })
                .catch((err) =>
                {
                    // 404 = no images yet, not an error
                    if (err.response?.status !== 404)
                    {
                        toast.error("Có lỗi khi lấy thông tin hình ảnh sản phẩm.");
                    }
                    setProductImages([]);
                });
        }
    };

    useEffect(() =>
    {
        fetchProductImages();
    }, [updateId]);

    const handlePreview = async (file) =>
    {
        if (!file.url && !file.preview)
        {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const getBase64 = (file) =>
    {
        return new Promise((resolve, reject) =>
        {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleChange = ({ fileList: newFileList }) =>
    {
        setFileList(newFileList);
    };

    const handleUpload = async () =>
    {
        if (fileList.length === 0)
        {
            message.warning('Vui lòng chọn ít nhất một hình ảnh để tải lên!');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try
        {
            const formData = new FormData();
            fileList.forEach((file) =>
            {
                if (file.originFileObj)
                {
                    formData.append('imageFiles', file.originFileObj);
                }
            });

            const totalFiles = fileList.length;
            let uploadedFiles = 0;

            await ProductManage.UploadImageProduct(updateId, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) =>
                {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            uploadedFiles++;
            const progress = Math.round((uploadedFiles * 100) / totalFiles);
            setUploadProgress(progress);

            // Refresh cả danh sách sản phẩm và ảnh trong modal
            fetchProducts();
            fetchProductImages();
            toast.success("Tải lên hình ảnh thành công!");
            setFileList([]);
        } catch (error)
        {

            toast.error("Có lỗi xảy ra khi tải lên hình ảnh! " + error.response.data);
        } finally
        {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteImage = async (imageId) =>
    {
        try
        {
            await ProductManage.DeleteProductImage(imageId);
            fetchProducts();
            fetchProductImages();
            toast.success("Xóa hình ảnh thành công!");
        } catch (error)
        {
            toast.error("Có lỗi xảy ra khi xóa hình ảnh! " + error);
        }
    };

    const uploadProps = {
        name: 'files',
        multiple: true,
        fileList,
        onChange: handleChange,
        onPreview: handlePreview,
        beforeUpload: (file) =>
        {
            const isImage = file.type.startsWith('image/');
            if (!isImage)
            {
                message.error('Chỉ có thể tải lên file hình ảnh!');
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M)
            {
                message.error('Hình ảnh phải nhỏ hơn 5MB!');
                return Upload.LIST_IGNORE;
            }
            return false; // Chặn auto-upload
        },
        accept: 'image/*'
    };

    // Thêm CSS cho modal
    useEffect(() =>
    {
        const customStyles = `
            .custom-modal .ant-modal-content {
                border-radius: 8px;
                overflow: hidden;
            }

            .custom-modal .ant-modal-header {
                padding: 16px 24px;
                border-bottom: 2px solid #f0f0f0;
                margin-bottom: 0;
            }

            .custom-modal .ant-modal-body {
                padding: 24px;
            }

            .custom-modal .ant-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #f0f0f0;
            }

            .custom-modal .ant-upload-list {
                margin-top: 16px;
            }

            .custom-modal .ant-upload-list-item {
                border-radius: 4px;
                overflow: hidden;
            }

            .custom-modal .ant-upload-list-item:hover {
                border-color: ${themeColors.StartColorLinear};
            }

            .custom-modal .ant-upload-list-item-actions {
                background: rgba(0, 0, 0, 0.5);
            }

            .custom-modal .ant-upload-list-item-actions .anticon {
                color: white;
            }

            .custom-modal .ant-upload-list-item-actions .anticon:hover {
                color: ${themeColors.StartColorLinear};
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = customStyles;
        document.head.appendChild(styleSheet);

        return () =>
        {
            document.head.removeChild(styleSheet);
        };
    }, [themeColors]);

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <UploadOutlined style={{ color: themeColors.StartColorLinear, fontSize: '20px' }} />
                    <Title level={4} style={{ margin: 0, color: themeColors.StartColorLinear }}>
                        Upload ảnh sản phẩm
                    </Title>
                </div>
            }
            open={openUpload}
            onCancel={handleUploadClose}
            width={1000}
            footer={[
                <Button
                    key="cancel"
                    onClick={handleUploadClose}
                    icon={<CloseOutlined />}
                    danger
                >
                    Đóng
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ background: themeColors.StartColorLinear }}
                >
                    {uploading ? 'Đang upload...' : 'Upload'}
                </Button>
            ]}
            className="custom-modal"
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Hình ảnh hiện tại" bordered={false}>
                        <Row gutter={[5, 5]} style={{ display: 'flex', justifyContent: 'space-around' }}>
                            {productImages.map((image) => (
                                <Col span={4} key={image.id} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Card
                                        hoverable
                                        style={{ width: '100%' }}
                                        cover={
                                            <img
                                                alt={image.imagePath}
                                                src={image.imagePath?.startsWith('http') ? image.imagePath : `${API_ENDPOINT}${image.imagePath}`}
                                                style={{ height: 120, objectFit: 'cover' }}
                                            />
                                        }
                                        actions={[
                                            <EyeOutlined key="view" onClick={() => handlePreview({ url: image.imagePath?.startsWith('http') ? image.imagePath : `${API_ENDPOINT}${image.imagePath}` })} />,
                                            <DeleteOutlined key="delete" onClick={() => handleDeleteImage(image.id)} />
                                        ]}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Tải lên hình ảnh mới" bordered={false}>
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để tải lên</p>
                            <p className="ant-upload-hint">
                                Hỗ trợ tải lên nhiều hình ảnh cùng lúc. Mỗi file không vượt quá 5MB.
                            </p>
                        </Dragger>

                        {uploading && (
                            <div style={{ marginTop: 16 }}>
                                <Progress percent={uploadProgress} status="active" />
                                <Text type="secondary">Đang tải lên... {uploadProgress}%</Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </Modal>
    );
}

export default UploadModal