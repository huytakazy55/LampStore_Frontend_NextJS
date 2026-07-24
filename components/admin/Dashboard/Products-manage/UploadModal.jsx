"use client";

import React, { useContext, useState, useEffect } from 'react'
import { Modal, Upload, Button, Typography, Card, Row, Col, message, Progress, Popconfirm } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, CloseOutlined, VideoCameraOutlined } from '@ant-design/icons';
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

                <Col span={24}>
                    <Card title="Video sản phẩm" bordered={false}>
                        {productVideo && (
                            <div style={{ marginBottom: 16 }}>
                                <video
                                    src={productVideo.startsWith('http') ? productVideo : `${API_ENDPOINT}${productVideo}`}
                                    controls
                                    preload="metadata"
                                    style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000' }}
                                >
                                    Trình duyệt không hỗ trợ phát video.
                                </video>
                                <Popconfirm
                                    title="Xóa video sản phẩm?"
                                    description="Thao tác này không thể hoàn tác."
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    onConfirm={handleDeleteVideo}
                                >
                                    <Button danger icon={<DeleteOutlined />} style={{ marginTop: 12 }}>
                                        Xóa video hiện tại
                                    </Button>
                                </Popconfirm>
                            </div>
                        )}

                        <Upload {...videoUploadProps}>
                            <Button icon={<VideoCameraOutlined />}>
                                {productVideo ? 'Chọn video thay thế' : 'Chọn video'}
                            </Button>
                        </Upload>
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                            Hỗ trợ MP4 hoặc WebM, dung lượng tối đa 20MB. Mỗi sản phẩm có một video.
                        </Text>
                        <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            onClick={handleVideoUpload}
                            disabled={!videoFile}
                            loading={videoUploading}
                            style={{ marginTop: 12, background: themeColors.StartColorLinear }}
                        >
                            {videoUploading ? 'Đang tải video...' : 'Tải video lên'}
                        </Button>
                        {videoUploading && (
                            <Progress percent={videoProgress} status="active" style={{ marginTop: 12 }} />
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
