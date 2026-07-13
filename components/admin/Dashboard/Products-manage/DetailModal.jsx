"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Modal, Tag, Typography, Image, Space, Spin, Badge, Card, Row, Col, Divider, Statistic, List } from 'antd';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import ProductManage from '@/services/ProductManage';
import { ShoppingCartOutlined, EyeOutlined, HeartOutlined, StarOutlined, AppstoreOutlined, TagsOutlined, InboxOutlined, CalendarOutlined, BarcodeOutlined, PictureOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const DetailModal = ({ open, onClose, product: initialProduct, categories }) => {
  const { themeColors } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const [loading, setLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState(null);

  useEffect(() => {
    if (open && initialProduct?.id) {
      setLoading(true);
      ProductManage.GetProductById(initialProduct.id)
        .then(res => {
          setFullProduct(res?.data || initialProduct);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching product details", err);
          setFullProduct(initialProduct);
          setLoading(false);
        });
    }
  }, [open, initialProduct]);

  if (!open) return null;

  const product = fullProduct || initialProduct;
  if (!product) return null;

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : '';
  };

  const formattedNumber = (number) => {
    return new Intl.NumberFormat(language).format(number || 0);
  };

  const statusConfig = {
    1: { text: 'Hoạt động', status: 'success', color: 'green' },
    0: { text: 'Ẩn', status: 'error', color: 'red' },
    true: { text: 'Hoạt động', status: 'success', color: 'green' },
    false: { text: 'Ẩn', status: 'error', color: 'red' }
  };

  const pStatus = statusConfig[product.status] || { text: 'Không xác định', status: 'default', color: 'default' };

  // Variant types
  const variantTypesRaw = product.variantTypes?.$values || product.variantTypes || [];
  const variantTypesArr = Array.isArray(variantTypesRaw) ? variantTypesRaw : [];
  
  const basePrice = Number(product.variant?.discountPrice) || Number(product.variant?.price) || Number(product.minPrice) || 0;

  const renderImages = () => {
    const imagesRaw = product.images?.$values || product.images || [];
    const imagesArr = Array.isArray(imagesRaw) ? imagesRaw : [];
    
    if (imagesArr.length === 0) return <Text type="secondary">Chưa có hình ảnh</Text>;
    
    return (
      <Space size={12} wrap style={{ width: '100%' }}>
        {imagesArr.map((img, idx) => {
          const imageUrl = img.imagePath?.startsWith('http') ? img.imagePath : `${API_ENDPOINT}${img.imagePath}`;
          return (
            <Image
              key={idx}
              src={imageUrl}
              width={100}
              height={100}
              style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #e8e8e8' }}
              preview={{ mask: <EyeOutlined /> }}
            />
          );
        })}
      </Space>
    );
  };

  const renderVariants = () => {
    if (variantTypesArr.length === 0) return <Text type="secondary" italic>Sản phẩm này không có phân loại</Text>;
    
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {variantTypesArr.map((vType, idx) => {
          const valuesRaw = vType.values?.$values || vType.values || [];
          const valuesArr = Array.isArray(valuesRaw) ? valuesRaw : [];
          
          return (
            <div key={idx}>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12, color: '#555' }}>
                {vType.name}
              </Text>
              <Space wrap size={12}>
                {valuesArr.map((val, vIdx) => {
                  const valName = val.value || val;
                  const addPrice = Number(val.additionalPrice) || 0;
                  const finalPrice = basePrice + addPrice;
                  const img = val.imageUrl;
                  
                  return (
                    <div 
                      key={vIdx} 
                      style={{ 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '6px', 
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#fff'
                      }}
                    >
                      {img && (
                        <Image 
                          src={img.startsWith('http') ? img : `${API_ENDPOINT}${img}`} 
                          width={32} height={32} 
                          style={{ objectFit: 'cover', borderRadius: '4px' }} 
                          preview={false}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{valName}</div>
                        <div style={{ color: themeColors.EndColorLinear, fontSize: 13, fontWeight: 600 }}>
                          {formattedNumber(finalPrice)} đ
                        </div>
                        {addPrice > 0 && (
                          <div style={{ fontSize: 11, color: '#888' }}>(+{formattedNumber(addPrice)} đ)</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Space>
            </div>
          );
        })}
      </Space>
    );
  };

  const specData = [
    { label: 'Tồn kho', value: <Tag color={product.stock > 10 ? 'green' : product.stock > 0 ? 'orange' : 'red'}>{formattedNumber(product.stock || 0)}</Tag> },
    { label: 'SKU', value: <Text strong>{product.variant?.sku || '--'}</Text> },
    { label: 'Khối lượng', value: product.variant?.weight ? `${product.variant.weight} g` : '--' },
    { label: 'Chất liệu', value: product.variant?.materials || '--' },
  ];

  return (
    <Modal
      title={<span style={{ fontSize: '1.25rem', fontWeight: 600 }}>Chi tiết sản phẩm</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1300}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0, background: '#f5f5f5' }}
      closeIcon={<span style={{ fontSize: 24 }}>&times;</span>}
    >
      <Spin spinning={loading}>
        <div style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden', padding: '16px 20px' }}>
          
          <Row gutter={[20, 20]}>
            {/* Left Column: Core Product Content */}
            <Col xs={24} lg={17}>
              {/* Main Info Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={3} style={{ margin: '0 0 12px 0' }}>{product.name}</Title>
                <Space size={16} wrap style={{ marginBottom: 20 }}>
                  <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px', borderRadius: '4px' }}>{getCategoryName(product.categoryId)}</Tag>
                  <Badge status={pStatus.status} text={<Text strong style={{ color: pStatus.color }}>{pStatus.text}</Text>} />
                  <span style={{ color: '#d9d9d9' }}>|</span>
                  <Text type="secondary"><TagsOutlined /> Tags: {product.tags ? product.tags.split(',').map((tag, i) => <Tag key={i} bordered={false} style={{background: '#f0f0f0'}}>{tag.trim()}</Tag>) : '--'}</Text>
                </Space>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}><PictureOutlined /> Hình ảnh sản phẩm</Text>
                  {renderImages()}
                </div>
              </Card>

              {/* Variants Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><AppstoreOutlined /> Phân loại sản phẩm</Title>
                {renderVariants()}
              </Card>

              {/* Description Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}><InboxOutlined /> Mô tả chi tiết</Title>
                <div 
                  className="product-description-content"
                  style={{ overflow: 'hidden', color: '#444', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ 
                    __html: product.description || '<p style="color: #999; font-style: italic;">Chưa có bài viết mô tả cho sản phẩm này.</p>'
                  }} 
                />
              </Card>
            </Col>

            {/* Right Column: Pricing, Specs, Stats */}
            <Col xs={24} lg={7}>
              {/* Pricing Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 14 }}>Giá bán cơ bản</Text>
                <div style={{ color: themeColors.EndColorLinear, fontSize: 28, fontWeight: 'bold', margin: '8px 0' }}>
                  {formattedNumber(basePrice)} đ
                </div>
                {Number(product.variant?.discountPrice) > 0 && Number(product.variant?.price) > Number(product.variant?.discountPrice) && (
                  <div style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 15 }}>
                    {formattedNumber(product.variant.price)} đ
                  </div>
                )}
              </Card>

              {/* Specs Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><BarcodeOutlined /> Thông số kỹ thuật</Title>
                <List
                  size="small"
                  dataSource={specData}
                  renderItem={item => (
                    <List.Item style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f0f0f0' }}>
                      <Text type="secondary">{item.label}</Text>
                      <div>{item.value}</div>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Stats Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><BarChartOutlined /> Thống kê tương tác</Title>
                <Row gutter={[12, 16]}>
                  <Col span={12}>
                    <Statistic title={<span><ShoppingCartOutlined /> Đã bán</span>} value={product.sellCount || 0} valueStyle={{ fontSize: 20, fontWeight: 600 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={<span><EyeOutlined /> Lượt xem</span>} value={product.viewCount || 0} valueStyle={{ fontSize: 20, fontWeight: 600 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={<span><HeartOutlined style={{ color: '#f5222d' }} /> Yêu thích</span>} value={product.favorites || 0} valueStyle={{ fontSize: 20, fontWeight: 600 }} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={<span><StarOutlined style={{ color: '#faad14' }} /> Đánh giá</span>} value={product.reviewCount || 0} valueStyle={{ fontSize: 20, fontWeight: 600 }} />
                  </Col>
                </Row>
              </Card>

              {/* Date Card */}
              <Card size="small" bordered={false} style={{ borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><CalendarOutlined /> Dữ liệu hệ thống</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Ngày tạo:</Text>
                    <Text strong>{product.dateAdded ? new Date(product.dateAdded).toLocaleDateString('vi-VN') : '--'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Cập nhật cuối:</Text>
                    <Text strong>{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : '--'}</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

        </div>
      </Spin>
    </Modal>
  );
};

export default DetailModal;
