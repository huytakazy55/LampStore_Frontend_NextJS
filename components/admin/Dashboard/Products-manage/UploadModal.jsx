"use client";

import React, { useContext, useState, useEffect } from 'react'
import { Modal, Upload, Button, Typography, Card, Row, Col, message, Progress, Popconfirm } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, CloseOutlined, VideoCameraOutlined } from '@ant-design/icons';
import ProductManage from '@/services/ProductManage';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import ProductVideo from '@/components/common/ProductVideo';
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
    const [videoFile, setVideoFile] = useState(null);
    const [productVideo, setProductVideo] = useState('');
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);

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
        if (updateId)
        {
            ProductManage.GetProductById(updateId)
                .then((res) => setProductVideo(res.data?.videoPath || ''))
                .catch(() => setProductVideo(''));
        }
        setVideoFile(null);
        setVideoProgress(0);
    }, [updateId]);

    const handleVideoUpload = async () =>
    {
        if (!videoFile)
        {
            message.warning('Vui lòng chọn video để tải lên!');
            return;
        }

        const formData = new FormData();
        formData.append('videoFile', videoFile);
        setVideoUploading(true);
        setVideoProgress(0);

        try
        {
            const response = await ProductManage.UploadVideoProduct(updateId, formData, {
                onUploadProgress: (event) =>
                {
                    if (event.total)
                    {
                        setVideoProgress(Math.round((event.loaded * 100) / event.total));
                    }
                }
            });
            setProductVideo(response.data?.videoPath || '');
            setVideoFile(null);
            fetchProducts();
            toast.success('Tải video sản phẩm thành công!');
        }
        catch (error)
        {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải video!');
        }
        finally
        {
            setVideoUploading(false);
            setVideoProgress(0);
        }
    };

    const handleMediaUpload = async () =>
    {
        if (fileList.length === 0 && !videoFile)
        {
            message.warning('Vui lòng chọn ít nhất một hình ảnh hoặc video để tải lên!');
            return;
        }

        if (fileList.length > 0)
        {
            await handleUpload();
        }

        if (videoFile)
        {
            await handleVideoUpload();
        }
    };

    const handleDeleteVideo = async () =>
    {
        try
        {
            await ProductManage.DeleteProductVideo(updateId);
            setProductVideo('');
            setVideoFile(null);
            fetchProducts();
            toast.success('Xóa video sản phẩm thành công!');
        }
        catch (error)
        {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa video!');
        }
    };

    const videoUploadProps = {
        accept: 'video/mp4,video/webm',
        maxCount: 1,
        fileList: videoFile ? [{
            uid: videoFile.uid || videoFile.name,
            name: videoFile.name,
            status: 'done',
            originFileObj: videoFile
        }] : [],
        beforeUpload: (file) =>
        {
            const allowedTypes = ['video/mp4', 'video/webm'];
            if (!allowedTypes.includes(file.type))
            {
                message.error('Chỉ hỗ trợ video MP4 hoặc WebM!');
                return Upload.LIST_IGNORE;
            }
            if (file.size > 20 * 1024 * 1024)
            {
                message.error('Video không được vượt quá 20MB!');
                return Upload.LIST_IGNORE;
            }
            setVideoFile(file);
            return false;
        },
        onRemove: () =>
        {
            setVideoFile(null);
            return true;
        },
        onChange: ({ fileList: nextFiles }) =>
        {
            if (nextFiles.length === 0) setVideoFile(null);
        }
    };

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

            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tải lên hình ảnh!");
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
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa hình ảnh!");
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
                border-radius: 4px;
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

            .product-media-modal .ant-modal-content {
                border-radius: 14px;
            }

            .product-media-modal .ant-modal-body {
                max-height: calc(88vh - 142px);
                overflow-y: auto;
                padding: 16px;
                background: #f7f8fa;
            }

            .product-media-modal .ant-modal-footer {
                padding: 10px 16px;
                background: #fff;
            }

            .product-media-modal .media-section {
                height: 100%;
                border: 1px solid #e8ebef;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(15, 23, 42, 0.035);
            }

            .product-media-modal .media-section .ant-card-head {
                min-height: 52px;
                padding: 0 16px;
                border-bottom-color: #edf0f3;
            }

            .product-media-modal .media-section .ant-card-head-title {
                padding: 13px 0;
                font-size: 14px;
                font-weight: 600;
            }

            .product-media-modal .media-section .ant-card-body {
                padding: 14px;
            }

            .product-media-modal .current-media-card .ant-card-body {
                padding: 14px;
            }

            .product-media-modal .current-image-card {
                overflow: hidden;
                border-radius: 9px;
            }

            .product-media-modal .current-image-card .ant-card-body {
                display: none;
            }

            .product-media-modal .current-image-card .ant-card-actions {
                border-top: 1px solid #edf0f3;
            }

            .product-media-modal .current-image-card .ant-card-actions > li {
                margin: 8px 0;
            }

            .product-media-modal .compact-image-dragger .ant-upload-drag {
                min-height: 178px;
                border-radius: 10px;
                background: #fafbfc;
            }

            .product-media-modal .compact-image-dragger .ant-upload {
                padding: 24px 12px;
            }

            .product-media-modal .compact-image-dragger .ant-upload-drag-icon {
                margin-bottom: 8px;
            }

            .product-media-modal .compact-image-dragger .ant-upload-drag-icon .anticon {
                font-size: 34px;
            }

            .product-media-modal .compact-image-dragger .ant-upload-text {
                font-size: 14px;
            }

            .product-media-modal .compact-image-dragger .ant-upload-hint {
                font-size: 12px;
            }

            .product-media-modal .compact-video-dragger {
                display: block;
                margin-top: 12px;
            }

            .product-media-modal .compact-video-dragger .ant-upload-drag {
                min-height: 142px;
                border-radius: 10px;
                background: #fafbfc;
            }

            .product-media-modal .compact-video-dragger .ant-upload {
                padding: 20px 12px;
            }

            .product-media-modal .compact-video-dragger .ant-upload-drag-icon {
                margin-bottom: 7px;
            }

            .product-media-modal .compact-video-dragger .ant-upload-drag-icon .anticon {
                color: ${themeColors.StartColorLinear};
                font-size: 32px;
            }

            .product-media-modal .compact-video-dragger .ant-upload-text {
                margin-bottom: 3px;
                font-size: 14px;
            }

            .product-media-modal .compact-video-dragger .ant-upload-hint {
                font-size: 12px;
            }

            .product-media-modal .media-video-frame {
                height: 320px;
                overflow: hidden;
                border-radius: 10px;
                background: #050505;
            }

            .product-media-modal .media-video-frame video {
                display: block;
                width: 100%;
                height: 320px;
                object-fit: contain;
            }

            .product-media-modal .media-video-empty {
                display: flex;
                height: 320px;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border: 1px dashed #d9d9d9;
                border-radius: 10px;
                background: #fafbfc;
                color: #8c8c8c;
            }

            @media (max-width: 767px) {
                .product-media-modal .ant-modal-body {
                    padding: 10px;
                }

                .product-media-modal .current-image-card img {
                    height: 105px !important;
                }

                .product-media-modal .media-video-frame,
                .product-media-modal .media-video-frame video,
                .product-media-modal .media-video-empty {
                    height: 210px;
                }
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
                        Quản lý media sản phẩm
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
                    onClick={handleMediaUpload}
                    disabled={fileList.length === 0 && !videoFile}
                    loading={uploading || videoUploading}
                    style={{ background: themeColors.StartColorLinear }}
                >
                    {uploading || videoUploading ? 'Đang upload...' : 'Upload media'}
                </Button>
            ]}
            className="custom-modal product-media-modal"
            centered
        >
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card title="Video sản phẩm" bordered={false} className="media-section">
                        {productVideo && (
                            <div style={{ marginBottom: 12 }}>
                                <div className="media-video-frame">
                                    <ProductVideo
                                        src={productVideo.startsWith('http') ? productVideo : `${API_ENDPOINT}${productVideo}`}
                                        preload="metadata"
                                        wrapperClassName="h-full"
                                        style={{ width: '100%', height: '100%', background: '#000', objectFit: 'contain' }}
                                    />
                                </div>
                                <Popconfirm
                                    title="Xóa video sản phẩm?"
                                    description="Thao tác này không thể hoàn tác."
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    onConfirm={handleDeleteVideo}
                                >
                                    <Button danger size="small" icon={<DeleteOutlined />} style={{ marginTop: 10 }}>
                                        Xóa video hiện tại
                                    </Button>
                                </Popconfirm>
                            </div>
                        )}
                        <Dragger {...videoUploadProps} className="compact-video-dragger">
                            <p className="ant-upload-drag-icon">
                                <VideoCameraOutlined />
                            </p>
                            <p className="ant-upload-text">
                                {productVideo ? 'Nhấp hoặc kéo thả video mới để thay thế' : 'Nhấp hoặc kéo thả video vào đây'}
                            </p>
                            <p className="ant-upload-hint">
                                Hỗ trợ MP4 hoặc WebM, dung lượng tối đa 20MB.
                            </p>
                        </Dragger>
                        {videoUploading && (
                            <Progress percent={videoProgress} status="active" style={{ marginTop: 12 }} />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <div className="flex h-full flex-col gap-4">
                        <Card
                            title="Hình ảnh hiện tại"
                            extra={<Text type="secondary">{productImages.length} ảnh</Text>}
                            bordered={false}
                            className="media-section current-media-card"
                        >
                            <Row gutter={[12, 12]}>
                                {productImages.map((image) => (
                                    <Col xs={12} sm={8} lg={8} key={image.id}>
                                        <Card
                                            hoverable
                                            className="current-image-card"
                                            style={{ width: '100%' }}
                                            cover={
                                                <img
                                                    alt={image.imagePath}
                                                    src={image.imagePath?.startsWith('http') ? image.imagePath : `${API_ENDPOINT}${image.imagePath}`}
                                                    style={{ height: 112, objectFit: 'cover' }}
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

                        <Card title="Tải lên hình ảnh mới" bordered={false} className="media-section">
                            <Dragger {...uploadProps} className="compact-image-dragger">
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để tải lên</p>
                                <p className="ant-upload-hint">
                                    Hỗ trợ nhiều hình ảnh cùng lúc, tối đa 5MB mỗi file.
                                </p>
                            </Dragger>

                            {uploading && (
                                <div style={{ marginTop: 16 }}>
                                    <Progress percent={uploadProgress} status="active" />
                                    <Text type="secondary">Đang tải lên... {uploadProgress}%</Text>
                                </div>
                            )}
                        </Card>
                    </div>
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
